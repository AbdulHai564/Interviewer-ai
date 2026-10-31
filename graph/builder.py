from langgraph.graph import END, StateGraph

from graph.nodes.entry import entry_node
from graph.nodes.eval import evaluation_node
from graph.nodes.interview import interview_node
from graph.state import State


def after_interview(state: dict) -> str:
    return "evaluation" if state.get("interview_complete") else "end"


def _add_interview_nodes(graph: StateGraph):
    graph.add_node("interview", interview_node)
    graph.add_node("evaluation", evaluation_node)
    graph.add_conditional_edges(
        "interview",
        after_interview,
        {
            "evaluation": "evaluation",
            "end": END,
        },
    )
    graph.add_edge("evaluation", END)


def build_start_graph():
    graph = StateGraph(State)
    graph.add_node("entry", entry_node)
    _add_interview_nodes(graph)

    graph.set_entry_point("entry")
    graph.add_edge("entry", "interview")

    return graph.compile()


def build_chat_graph():
    graph = StateGraph(State)
    _add_interview_nodes(graph)
    graph.set_entry_point("interview")
    return graph.compile()


graph = build_start_graph()
chat_graph = build_chat_graph()