import json

import requests
from e2b_code_interpreter import Sandbox
from langchain_core.tools import tool

from config import E2B_API_KEY, TAVILY_API_KEY


@tool
def e2b(code: str) -> dict:
    """Execute Python code in an isolated sandbox and return stdout/stderr."""
    sandbox = None
    try:
        sandbox = Sandbox.create(api_key=E2B_API_KEY)
        execution = sandbox.run_code(code)
        return {
            "success": True,
            "output": execution.logs.stdout,
            "warnings": execution.logs.stderr,
            "errors": None,
            "results": [str(result) for result in execution.results],
        }
    except Exception as exc:
        return {
            "success": False,
            "output": None,
            "warnings": None,
            "errors": str(exc),
            "results": [],
        }
    finally:
        if sandbox is not None:
            try:
                sandbox.kill()
            except Exception:
                pass


@tool
def tavily_search(query: str) -> str:
    """Search the web for current company and interview-process information."""
    if not TAVILY_API_KEY:
        return "Web search is unavailable because TAVILY_API_KEY is not configured."

    try:
        response = requests.post(
            "https://api.tavily.com/search",
            json={
                "api_key": TAVILY_API_KEY,
                "query": query,
                "search_depth": "advanced",
                "max_results": 5,
                "include_answer": True,
            },
            timeout=30,
        )
        response.raise_for_status()
        payload = response.json()
    except Exception as exc:
        return f"Web search failed: {exc}"

    lines = []
    answer = payload.get("answer")
    if answer:
        lines.append(f"Answer: {answer}")

    for result in payload.get("results", []):
        title = result.get("title", "")
        content = result.get("content", "")
        url = result.get("url", "")
        lines.append(f"- {title}: {content} ({url})")

    return "\n".join(lines)[:6000] or json.dumps(payload)[:6000]


def get_all_tools():
    """Return the synchronous tools used by the interview graph."""
    return [e2b, tavily_search]