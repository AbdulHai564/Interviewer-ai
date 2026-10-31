from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from starlette.concurrency import run_in_threadpool
from langchain_core.messages import AIMessage, HumanMessage

from graph.builder import chat_graph, graph
from db.memory import get_history, get_state, save_state
from db.models import get_session, init_db


app = FastAPI(title="interview-ai")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    init_db()


class StartRequest(BaseModel):
    company: str
    role: str


class ChatRequest(BaseModel):
    session_id: str
    message: str


def _content_text(content) -> str:
    if isinstance(content, str):
        return content.strip()
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict) and item.get("text"):
                parts.append(str(item["text"]))
        return "\n".join(parts).strip()
    return str(content or "").strip()


def _last_ai_text(messages) -> str:
    for message in reversed(messages or []):
        if isinstance(message, AIMessage):
            text = _content_text(message.content)
            if text:
                return text
    return ""


def _last_ai_from_history(history) -> str:
    for item in reversed(history or []):
        if item.get("type") == "AIMessage":
            text = _content_text(item.get("content"))
            if text:
                return text
    return ""


def _state_payload(session_id: str, state: dict) -> dict:
    return {
        "session_id": session_id,
        "company": state.get("company"),
        "role": state.get("role"),
        "rounds": state.get("rounds") or [],
        "current_round": state.get("current_round") or "Interview",
        "round_time_limits": state.get("round_time_limits") or {},
        "round_results": state.get("round_results") or {},
        "timer_active": bool(state.get("timer_active")),
        "time_limit": state.get("time_limit"),
        "round_start_time": state.get("round_start_time"),
        "interview_complete": bool(state.get("interview_complete")),
    }


def _persist_state(session_id: str, state: dict):
    save_state(session_id, _state_payload(session_id, state))


def _state_from_row(row: dict) -> dict:
    current_round = row.get("current_round") or "Interview"
    return {
        "session_id": str(row["id"]),
        "company": row["company"],
        "role": row["role"],
        "rounds": [current_round],
        "current_round": current_round,
        "round_time_limits": {},
        "round_results": row.get("round_results") or {},
        "timer_active": False,
        "time_limit": None,
        "round_start_time": None,
        "interview_complete": row.get("status") == "completed",
    }


def _load_session(session_id: str) -> tuple[dict, dict]:
    row = get_session(session_id)
    if not row:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    state = get_state(session_id)
    if not state:
        state = _state_from_row(row)
        _persist_state(session_id, state)

    state["company"] = row["company"]
    state["role"] = row["role"]
    if not state.get("round_results"):
        state["round_results"] = row.get("round_results") or {}
    if row.get("status") == "completed":
        state["interview_complete"] = True

    return state, row


@app.get("/health")
async def health():
    return {"status": "ok", "service": "interview-ai"}


@app.post("/start")
async def start_interview(req: StartRequest):
    company = req.company.strip()
    role = req.role.strip()
    if not company or not role:
        raise HTTPException(status_code=422, detail="Company and role are required.")

    initial_state = {
        "company": company,
        "role": role,
        "messages": [],
        "rounds": [],
        "current_round": "",
        "round_time_limits": {},
        "round_results": {},
        "timer_active": False,
        "time_limit": None,
        "round_start_time": None,
        "interview_complete": False,
        "session_id": "",
    }

    try:
        result = await run_in_threadpool(graph.invoke, initial_state)
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Could not start interview: {exc}"
        ) from exc

    session_id = result.get("session_id")
    if not session_id:
        raise HTTPException(status_code=500, detail="No session_id was created.")

    _persist_state(session_id, result)

    message = _last_ai_text(result.get("messages"))
    if not message:
        message = "Hi, thanks for joining. Let's begin with a quick introduction."

    return {
        "session_id": session_id,
        "rounds": result.get("rounds") or [],
        "current_round": result.get("current_round") or "Interview",
        "message": message,
        "timer_active": bool(result.get("timer_active")),
        "time_limit": result.get("time_limit"),
    }


@app.post("/chat")
async def chat(req: ChatRequest):
    message = req.message.strip()
    if not message:
        raise HTTPException(status_code=422, detail="Message cannot be empty.")

    state, row = _load_session(req.session_id)

    if state.get("interview_complete"):
        report = state.get("round_results") or row.get("round_results") or {}
        return {
            "message": "This interview is already complete.",
            "current_round": state.get("current_round"),
            "interview_complete": True,
            "timer_active": False,
            "time_limit": None,
            "report": report,
        }

    payload = {
        "session_id": req.session_id,
        "company": row["company"],
        "role": row["role"],
        "messages": [HumanMessage(content=message)],
        "rounds": state.get("rounds") or [state.get("current_round") or "Interview"],
        "current_round": state.get("current_round") or "Interview",
        "round_time_limits": state.get("round_time_limits") or {},
        "round_results": state.get("round_results") or {},
        "timer_active": bool(state.get("timer_active")),
        "time_limit": state.get("time_limit"),
        "round_start_time": state.get("round_start_time"),
        "interview_complete": False,
    }

    try:
        result = await run_in_threadpool(chat_graph.invoke, payload)
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Could not continue interview: {exc}"
        ) from exc

    _persist_state(req.session_id, {**payload, **result})
    history = get_history(req.session_id)

    complete = bool(result.get("interview_complete"))
    report = result.get("round_results") or {}
    if complete:
        if not report:
            refreshed = get_session(req.session_id) or {}
            report = refreshed.get("round_results") or {}
        response_message = "That wraps up the interview. Your evaluation report is ready."
    else:
        response_message = (
            _last_ai_from_history(history)
            or _last_ai_text(result.get("messages"))
            or "Let's keep going. Could you expand on that?"
        )

    return {
        "message": response_message,
        "current_round": result.get("current_round") or payload["current_round"],
        "interview_complete": complete,
        "timer_active": bool(result.get("timer_active")),
        "time_limit": result.get("time_limit"),
        "report": report if complete else None,
    }


@app.get("/report/{session_id}")
async def get_report(session_id: str):
    row = get_session(session_id)
    if not row:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    state = get_state(session_id) or {}
    report = state.get("round_results") or row.get("round_results") or {}

    if not report:
        raise HTTPException(
            status_code=404,
            detail="The evaluation report is not ready yet. Complete the interview first.",
        )

    return report


@app.get("/history/{session_id}")
async def get_interview_history(session_id: str):
    row = get_session(session_id)
    if not row:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    return {
        "session_id": session_id,
        "company": row["company"],
        "role": row["role"],
        "messages": get_history(session_id),
    }