# prelegal — backend

FastAPI + SQLAlchemy backend. Serves the dummy-login API and the statically
exported frontend.

## Run

```bash
uv run uvicorn app.main:app --port 8000
```

Serves on http://localhost:8000. If `frontend/out` exists (after a frontend
build) it is served at `/`; otherwise only the API is available. Normally you'd
use the project-root start script, which builds the frontend first.

## Endpoints

- `GET /api/health` — liveness check.
- `POST /api/login` `{username, password}` — validates against the `users`
  table (seeded with `demo` / `demo`). No real authentication yet.
- `GET /api/catalog` — the 11 selectable document types (cover-page entry excluded).
- `GET /api/templates/{filename}` — a template's markdown plus its parsed
  placeholder list (`<span class="*_link">Name</span>` fields).
- `POST /api/chat` `{messages, document, fields}` — sends the conversation to the
  LLM (LiteLLM → Groq `gpt-oss-120b`, JSON mode + Pydantic validation) and returns
  the assistant reply, the chosen document, and the updated fields. Stateless.
  Requires `GROQ_API_KEY` in the project-root `.env`.

## Database

Temporary SQLite, recreated on startup. The path is configurable via
`PRELEGAL_DB_PATH`; making it persistent later means removing the `drop_all` in
`app/db.py`.

## Test

```bash
uv run pytest
```
