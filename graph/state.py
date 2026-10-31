from typing import Annotated, TypedDict

from langgraph.graph.message import add_messages


class State(TypedDict):
    messages: Annotated[list, add_messages]
    company: str
    role: str
    session_id: str
    rounds: list
    current_round: str
    round_time_limits: dict
    round_results: dict
    timer_active: bool
    time_limit: int | None
    round_start_time: float | None
    interview_complete: bool