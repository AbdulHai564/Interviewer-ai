import json
import time

import redis

from config import REDIS_URL

client = redis.from_url(
    REDIS_URL,
    socket_connect_timeout=10,
    socket_timeout=10,
)

SESSION_TTL = 60 * 60 * 24
STATE_FIELDS = (
    "session_id",
    "company",
    "role",
    "rounds",
    "current_round",
    "round_time_limits",
    "round_results",
    "timer_active",
    "time_limit",
    "round_start_time",
    "interview_complete",
)


def _history_key(session_id: str) -> str:
    return f"session:{session_id}"


def _state_key(session_id: str) -> str:
    return f"interview_state:{session_id}"


def get_history(session_id: str) -> list:
    data = client.get(_history_key(session_id))
    if not data:
        return []
    try:
        return json.loads(data)
    except (TypeError, json.JSONDecodeError):
        return []


def save_history(session_id: str, messages: list):
    serializable = []
    for message in messages:
        serializable.append(
            {
                "type": message.__class__.__name__,
                "content": message.content,
            }
        )
    client.setex(_history_key(session_id), SESSION_TTL, json.dumps(serializable))


def append_exchange(session_id: str, human_msg: str, ai_msg: str):
    history = get_history(session_id)
    if human_msg and human_msg.strip():
        history.append({"type": "HumanMessage", "content": human_msg.strip()})
    if ai_msg and ai_msg.strip():
        history.append({"type": "AIMessage", "content": ai_msg.strip()})
    client.setex(_history_key(session_id), SESSION_TTL, json.dumps(history))


def append_ai_message(session_id: str, ai_msg: str):
    history = get_history(session_id)
    if ai_msg and ai_msg.strip():
        history.append({"type": "AIMessage", "content": ai_msg.strip()})
    client.setex(_history_key(session_id), SESSION_TTL, json.dumps(history))


def save_state(session_id: str, state: dict):
    payload = {field: state.get(field) for field in STATE_FIELDS}
    payload["updated_at"] = time.time()
    client.setex(_state_key(session_id), SESSION_TTL, json.dumps(payload, default=str))


def get_state(session_id: str) -> dict | None:
    data = client.get(_state_key(session_id))
    if not data:
        return None
    try:
        return json.loads(data)
    except (TypeError, json.JSONDecodeError):
        return None


def clear_state(session_id: str):
    client.delete(_state_key(session_id))


def clear_session(session_id: str):
    client.delete(_history_key(session_id), _state_key(session_id))