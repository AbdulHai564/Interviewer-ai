# interview-ai

An AI-powered mock interview platform. Pick a company and role, and an AI interviewer conducts a realistic, multi-round interview — researching the company live, adapting its questions to your answers, running your code in a real sandbox, and generating a recruiter-style evaluation report at the end.

**Live app:** https://interviewer-ai-pearl.vercel.app/

---

## What it does

1. You enter a company and role.
2. The agent researches that company's actual interview process live via web search, and an LLM plans out realistic interview rounds based on what it finds (no hardcoded "recruiter → technical → coding" — a startup's one-call process looks different from a FAANG loop, and the model adapts).
3. You're interviewed round by round in a chat interface. The interviewer asks one question at a time, adapts difficulty based on how you're doing, and stays in character as a senior engineer at that company.
4. When a round is coding-based, the editor appears, a timer starts, and your submitted code is executed live in a secure sandbox — the interviewer reviews the actual output, not just the code.
5. At the end, you get a full evaluation report: overall score, hire/no-hire recommendation, per-round breakdown, strengths/weaknesses, and a written hiring decision.

---

## Stack

**Backend**
- **FastAPI** — API layer
- **LangGraph** — orchestrates the interview as a stateful agent graph (entry → interview loop → evaluation)
- **Groq (Llama 3.3 70B)** — the interviewer and evaluator LLM
- **Tavily** — live web search tool the agent calls to research each company's actual hiring process
- **E2B** — secure sandboxed code execution for coding rounds
- **PostgreSQL (Neon)** — persists sessions, scores, and a cache of researched company intel
- **Redis (Upstash)** — stores the live conversation history per session during the interview
- **LangSmith** — tracing/observability across the whole agent run

**Frontend**
- **React + Vite**
- **Tailwind CSS**
- **Monaco Editor** — in-browser code editor for coding rounds

**Deployment**
- **FastAPI Cloud** — backend hosting
- **Vercel** — frontend hosting
- Fully connected to GitHub — every push to `main` auto-redeploys both

---

## Architecture notes

- **No hardcoded round structure.** Instead of fixed recruiter/technical/coding nodes, the agent researches the company first and lets the LLM decide what rounds make sense, then drives through them.
- **Two-tier storage.** Redis holds the active conversation for speed during the interview; Postgres holds the durable stuff — session metadata, final scores, and a company-intel cache so the same company isn't re-researched via Tavily on every session.
- **Deterministic routing, LLM-optional tools.** Must-always-happen logic (DB writes, round transitions) lives in plain Python nodes. Tavily and E2B are bound as tools the LLM calls only when it actually needs them.
- **Timers are scoped.** Only coding/time-boxed rounds get a timer — the LLM is instructed not to time-pressure open-ended or behavioral rounds.

---

## Project structure

```
interviewer.ai/
├── api.py                  # FastAPI app and routes
├── config.py                # env var loading
├── db/
│   ├── models.py            # Postgres: companies cache + sessions
│   └── memory.py             # Redis: active conversation history
├── graph/
│   ├── state.py              # LangGraph state schema
│   ├── builder.py            # graph wiring + router
│   └── nodes/
│       ├── entry.py          # creates session, researches company, plans rounds
│       └── interview.py      # main conversation loop, timer handling, round transitions
│       └── evaluation.py     # generates final recruiter-style report
├── prompts/
│   └── interviewer.py        # system prompt
├── tools/
│   └── tools.py               # Tavily + E2B tool bindings
├── requirements.txt
└── frontend/                 # React + Vite + Tailwind + Monaco
```

---

## Routes

| Route | Method | Description |
|---|---|---|
| `/start` | POST | Start a new interview — researches the company, plans rounds, returns session_id + first message |
| `/chat` | POST | Send a message, get the interviewer's response |
| `/report/{session_id}` | GET | Fetch the final evaluation report |
| `/history/{session_id}` | GET | Fetch full conversation history |

---

## What's next

- University interview mode
- Live-call voice interviews
- Curated company docs layered on top of live Tavily research
