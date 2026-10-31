import os
from dotenv import load_dotenv

load_dotenv()


def _env(name: str) -> str | None:
    value = os.getenv(name)
    return value.strip() if value and value.strip() else None


GROQ_API_KEY = _env("GROQ_API_KEY")
GROQ_MODEL = (os.getenv("GROQ_MODEL") or "openai/gpt-oss-120b").strip()
TAVILY_API_KEY = _env("TAVILY_API_KEY")
LANGCHAIN_API_KEY = _env("LANGCHAIN_API_KEY")
REDIS_URL = _env("REDIS_URL")
DATABASE_URL = _env("DATABASE_URL")
E2B_API_KEY = _env("E2B_API_KEY")