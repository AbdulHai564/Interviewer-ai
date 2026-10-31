import json

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from config import GROQ_API_KEY
from db.memory import get_history
from db.models import update_session

llm = ChatGroq(model="openai/gpt-oss-120b", api_key=GROQ_API_KEY)

EVALUATION_PROMPT = """You are a senior recruiter writing a detailed candidate evaluation report.

Based on the entire interview conversation below, generate a structured evaluation report.

Return a JSON object with this exact structure:
{{
    "overall_score": <0-100>,
    "recommendation": "strong hire | hire | borderline | no hire",
    "summary": "2-3 sentence overall summary",
    "rounds": {{
        "<round_name>": {{
            "score": <0-100>,
            "strengths": ["..."],
            "weaknesses": ["..."],
            "notes": "..."
        }}
    }},
    "technical_skills": <0-100>,
    "communication": <0-100>,
    "problem_solving": <0-100>,
    "culture_fit": <0-100>,
    "hiring_decision": "detailed paragraph explaining the recommendation"
}}

Only return JSON, nothing else.
"""


def _extract_json(content) -> dict:
    text = str(content or "").strip()
    if text.startswith("```"):
        text = "\n".join(
            line for line in text.splitlines() if not line.strip().startswith("```")
        ).strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start >= 0 and end > start:
            return json.loads(text[start : end + 1])
        raise


def evaluation_node(state: dict) -> dict:
    session_id = state["session_id"]

    history = get_history(session_id)
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

    response = llm.invoke(messages + [HumanMessage(content=EVALUATION_PROMPT)])

    try:
        report = _extract_json(response.content)
    except Exception:
        report = {
            "error": "failed to parse evaluation",
            "raw": str(response.content),
        }

    update_session(
        session_id,
        status="completed",
        round_results=report,
    )

    return {
        "round_results": report,
        "interview_complete": True,
        "messages": [
            AIMessage(
                content="That wraps up the interview. Your evaluation report is ready."
            )
        ],
    }