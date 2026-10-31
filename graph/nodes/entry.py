import json

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from config import GROQ_API_KEY
from db.memory import save_history
from db.models import create_session, get_company_intel, upsert_company
from prompts.interviewer import INTERVIEWER_SYSTEM_PROMPT
from tools.tools import get_all_tools

llm = ChatGroq(model="openai/gpt-oss-120b", api_key=GROQ_API_KEY)


def _fallback_plan():
    return {
        "rounds": [
            "Introduction",
            "Coding Challenge",
            "System Design",
            "Behavioral",
        ],
        "round_time_limits": {"Coding Challenge": 30},
        "overview": "A standard four-round software engineering interview loop.",
    }


def _extract_json(content) -> dict:
    text = str(content or "").strip()
    if text.startswith("```"):
        lines = [line for line in text.splitlines() if not line.strip().startswith("```")]
        text = "\n".join(lines).strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start >= 0 and end > start:
            return json.loads(text[start : end + 1])
        raise


def _normalise_limit(value):
    try:
        limit = int(value)
    except (TypeError, ValueError):
        return None
    return limit if limit > 0 else None


def entry_node(state: dict) -> dict:
    company = state["company"]
    role = state["role"]

    session_id = create_session(company, role)

    intel = ""
    try:
        cached = get_company_intel(company)
        if cached and cached.get("intel_json"):
            cached_intel = cached["intel_json"]
            intel = (
                json.dumps(cached_intel)
                if isinstance(cached_intel, (dict, list))
                else str(cached_intel)
            )
    except Exception:
        intel = ""

    if not intel:
        try:
            tools = get_all_tools()
            tavily = next(tool for tool in tools if "search" in tool.name.lower())
            intel = str(tavily.invoke(f"{company} interview process hiring loop rounds 2025 2026"))
            upsert_company(company, "", {"raw": intel})
        except Exception as exc:
            intel = f"Company research was unavailable: {exc}"

    planning_prompt = f"""
    Based on this information about {company}'s interview process:
    {intel[:6000]}

    Plan the interview rounds for a {role} position.
    Return a JSON object with this exact structure:
    {{
        "rounds": ["round1_name", "round2_name", ...],
        "round_time_limits": {{"round_name": minutes_or_null}},
        "overview": "brief description of the interview process"
    }}
    Only return JSON, nothing else.
    """

    try:
        response = llm.invoke([HumanMessage(content=planning_prompt)])
        plan = _extract_json(response.content)
    except Exception:
        plan = _fallback_plan()

    rounds = [
        str(round_name).strip()
        for round_name in plan.get("rounds", [])
        if str(round_name).strip()
    ]
    if not rounds:
        plan = _fallback_plan()
        rounds = plan["rounds"]

    raw_limits = plan.get("round_time_limits")
    if not isinstance(raw_limits, dict):
        raw_limits = _fallback_plan()["round_time_limits"]

    round_time_limits = {}
    for round_name, minutes in raw_limits.items():
        normalized = _normalise_limit(minutes)
        if normalized is not None:
            round_time_limits[str(round_name)] = normalized

    current_round = rounds[0]
    system_msg = SystemMessage(
        content=INTERVIEWER_SYSTEM_PROMPT.format(
            company=company,
            role=role,
            current_round=current_round,
        )
    )
    save_history(session_id, [system_msg])

    return {
        "session_id": session_id,
        "rounds": rounds,
        "current_round": current_round,
        "round_time_limits": round_time_limits,
        "round_results": {},
        "timer_active": False,
        "time_limit": round_time_limits.get(current_round),
        "round_start_time": None,
        "interview_complete": False,
        "messages": [system_msg],
    }