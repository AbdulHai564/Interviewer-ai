import logging
import time

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from config import GROQ_API_KEY
from db.memory import append_ai_message, append_exchange, get_history
from db.models import update_session
from prompts.interviewer import INTERVIEWER_SYSTEM_PROMPT

llm = ChatGroq(model="openai/gpt-oss-120b", api_key=GROQ_API_KEY)

logger = logging.getLogger(__name__)

CODING_KEYWORDS = ("coding", "technical", "programming", "code")
ROUND_COMPLETE_PHRASES = (
    "let's move on",
    "next round",
    "moving on",
    "that concludes",
    "shall we proceed",
)


def _to_messages(history: list) -> list:
    messages = []
    for item in history:
        msg_type = item.get("type")
        content = item.get("content", "")
        if msg_type == "SystemMessage":
            messages.append(SystemMessage(content=content))
        elif msg_type == "HumanMessage":
            messages.append(HumanMessage(content=content))
        elif msg_type == "AIMessage":
            messages.append(AIMessage(content=content))
    return messages


def _message_text(content) -> str:
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


def _is_coding(round_name: str) -> bool:
    name = str(round_name or "").lower()
    return any(keyword in name for keyword in CODING_KEYWORDS)


def _round_limit(state: dict, round_name: str) -> int:
    limits = state.get("round_time_limits") or {}
    value = limits.get(round_name)
    if value is None and round_name == state.get("current_round"):
        value = state.get("time_limit")
    try:
        limit = int(value)
    except (TypeError, ValueError):
        limit = 30
    return limit if limit > 0 else 30


def _timer_for_round(state: dict, round_name: str) -> dict:
    if _is_coding(round_name):
        return {
            "timer_active": True,
            "time_limit": _round_limit(state, round_name),
            "round_start_time": time.time(),
        }
    return {
        "timer_active": False,
        "time_limit": None,
        "round_start_time": None,
    }


def _next_round(state: dict) -> str | None:
    rounds = state.get("rounds") or []
    current_round = state.get("current_round")
    if current_round not in rounds:
        return None
    index = rounds.index(current_round)
    if index + 1 >= len(rounds):
        return None
    return rounds[index + 1]


def interview_node(state: dict) -> dict:
    company = state["company"]
    role = state["role"]
    current_round = state["current_round"]
    session_id = state["session_id"]
    rounds = state.get("rounds") or [current_round]

    history = get_history(session_id)
    messages = _to_messages(history)

    system_prompt = INTERVIEWER_SYSTEM_PROMPT.format(
        company=company,
        role=role,
        current_round=current_round,
    )
    if messages and isinstance(messages[0], SystemMessage):
        messages[0] = SystemMessage(content=system_prompt)
    else:
        messages.insert(0, SystemMessage(content=system_prompt))

    new_human_message = ""
    for message in state.get("messages", []):
        if not isinstance(message, HumanMessage):
            continue
        content = _message_text(message.content)
        if not content:
            continue
        new_human_message = content
        if not (
            messages
            and isinstance(messages[-1], HumanMessage)
            and messages[-1].content == content
        ):
            messages.append(HumanMessage(content=content))

    updates = {}
    timer_active = bool(state.get("timer_active"))
    round_start_time = state.get("round_start_time")

    if _is_coding(current_round) and not timer_active:
        timer_active = True
        round_start_time = time.time()
        updates.update(
            {
                "timer_active": True,
                "time_limit": _round_limit(state, current_round),
                "round_start_time": round_start_time,
            }
        )
    elif not _is_coding(current_round) and timer_active:
        timer_active = False
        round_start_time = None
        updates.update(
            {
                "timer_active": False,
                "time_limit": None,
                "round_start_time": None,
            }
        )

    if timer_active and round_start_time:
        limit = _round_limit(state, current_round)
        elapsed_minutes = (time.time() - round_start_time) / 60
        if elapsed_minutes >= limit:
            timeout_message = (
                "Time's up for this round. Let's move on and review what you had."
            )
            append_ai_message(session_id, timeout_message)
            upcoming_round = _next_round(state)
            if upcoming_round:
                update_session(session_id, current_round=upcoming_round)
                return {
                    **updates,
                    "messages": [AIMessage(content=timeout_message)],
                    "current_round": upcoming_round,
                    **_timer_for_round(state, upcoming_round),
                }
            return {
                **updates,
                "messages": [AIMessage(content=timeout_message)],
                "interview_complete": True,
                "timer_active": False,
                "round_start_time": None,
            }

    try:
        response = llm.invoke(messages)
        response_text = _message_text(response.content)
    except Exception:
        logger.exception("Interviewer LLM call failed")
        response_text = (
            "I hit a brief issue on my side. Could you repeat that answer in one "
            "or two sentences?"
        )

    if not response_text:
        response_text = "Could you tell me a little more about that?"

    if new_human_message:
        append_exchange(session_id, new_human_message, response_text)
    else:
        append_ai_message(session_id, response_text)

    update_session(session_id, current_round=current_round)

    current_index = rounds.index(current_round) if current_round in rounds else -1
    is_last_round = current_index == len(rounds) - 1
    round_complete = any(
        phrase in response_text.lower() for phrase in ROUND_COMPLETE_PHRASES
    )

    if round_complete and is_last_round:
        return {
            **updates,
            "messages": [AIMessage(content=response_text)],
            "interview_complete": True,
            "timer_active": False,
            "round_start_time": None,
        }

    if round_complete:
        upcoming_round = _next_round(state)
        if upcoming_round:
            update_session(session_id, current_round=upcoming_round)
            return {
                **updates,
                "messages": [AIMessage(content=response_text)],
                "current_round": upcoming_round,
                **_timer_for_round(state, upcoming_round),
            }

    return {
        **updates,
        "messages": [AIMessage(content=response_text)],
    }