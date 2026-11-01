# interview-ai — frontend

React + Vite frontend for the **interview-ai** platform. Dark, Linear/VSCode-inspired interface with a company-aware interview loop, typewriter chat, Monaco code editor, live countdown, and a hiring-grade report.

## Stack

- React 18 + Vite 5
- Tailwind CSS 3
- Monaco Editor (bundled locally, lazy-loaded for coding rounds)
- Axios
- Lucide icons

## Getting started

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

Production build:

```bash
npm run build
npm run preview
```

> Node 18+ is required.

## API configuration

The client defaults to `http://localhost:8000` and can be overridden with `VITE_API_URL`:

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:8000
```

### If FastAPI does not have CORS enabled

Add the dev proxy instead of calling the API cross-origin:

```env
VITE_API_URL=/api
```

`vite.config.js` proxies `/api/*` to `http://localhost:8000/*` during `npm run dev`.

Alternatively, enable CORS on the backend:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Endpoints used

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/start` | Start a session with `{ company, role }` |
| `POST` | `/chat` | Send `{ session_id, message }` |
| `GET` | `/report/{session_id}` | Load the evaluation report |
| `GET` | `/history/{session_id}` | Available in the API client for transcript recovery |

### Timer behavior

The UI shows the countdown only when a timer is active. If the backend response includes `timer_active` / `time_limit`, those values are honored exactly. When they are absent (the current API contract), the client infers the timer from coding-style round names (`coding`, `technical`, `programming`, `code`, `algorithm`, `data structure`, `system design`) and uses a 30-minute default, or a per-round time limit when one is present in `rounds`.

## Views

- **Landing** — company and role form, validation, quick company suggestions, animated dark hero.
- **Interview** — split chat + Monaco layout, round progress, typing indicator, typewriter interviewer messages, live timer that turns red under five minutes, round transition overlay, code sharing into the chat.
- **Report** — circular overall score, color-coded recommendation, competency progress bars, expandable per-round breakdown, and hiring-decision paragraph. Reports can be exported as JSON.

## Project structure

```text
frontend/
  src/
    components/
      AnimatedBackground.jsx
      ChatInput.jsx
      ChatMessage.jsx
      ChatPanel.jsx
      CodeEditor.jsx
      ConfirmDialog.jsx
      InlineAlert.jsx
      Logo.jsx
      RecommendationBadge.jsx
      RoundProgress.jsx
      RoundResultCard.jsx
      RoundTransition.jsx
      ScoreBar.jsx
      ScoreRing.jsx
      Timer.jsx
      TopBar.jsx
      TypingIndicator.jsx
    context/
      InterviewContext.jsx
    lib/
      api.js
      monaco.js
    pages/
      LandingPage.jsx
      InterviewPage.jsx
      ReportPage.jsx
    utils/
      constants.js
      format.js
      interview.js
    App.jsx
    index.css
    main.jsx
  index.html
  package.json
  postcss.config.js
  tailwind.config.js
  vite.config.js
```

## Notes

- State lives in a single React context (`InterviewContext`) — no Redux.
- Monaco is configured with local workers; it is not loaded from a CDN.
- The report normalizer accepts either a flat report object or a `{ report: ... }` / `{ round_results: ... }` wrapper.
- Reduced-motion preferences disable typewriter and transition animations.
