# prelegal — backend

FastAPI + SQLAlchemy backend. Provides auth (bcrypt + token sessions), per-user
saved documents, the AI chat, and serves the statically exported frontend.

## Run

```bash
uv run uvicorn app.main:app --port 8000
```

Serves on http://localhost:8000. If `frontend/out` exists (after a frontend
build) it is served at `/`; otherwise only the API is available. Normally you'd
use the project-root start script, which builds the frontend first.

## Endpoints

- `GET /api/health` — liveness check.
- `POST /api/signup` `{username, password}` — create an account (bcrypt-hashed);
  returns a session token. Duplicate usernames return 409.
- `POST /api/login` `{username, password}` — returns a session token.
- `POST /api/logout` — invalidates the caller's token.
- `GET/POST/PUT /api/documents` — per-user saved documents (auth required via
  `Authorization: Bearer <token>`); each user sees only their own.
All of the following also require auth (`Authorization: Bearer <token>`):

- `GET /api/catalog` — the 11 selectable document types (cover-page entry excluded).
- `GET /api/templates/{filename}` — a template's markdown plus its parsed
  placeholder list (`<span class="*_link">Name</span>` fields).
- `POST /api/chat` `{messages, document, fields}` — sends the conversation to the
  LLM (LiteLLM → Groq `gpt-oss-120b`, JSON mode + Pydantic validation) and returns
  the assistant reply, the chosen document, and the updated fields. Stateless;
  rejects a `document` outside the catalog. Requires `GROQ_API_KEY` in the
  project-root `.env`.

## Database

Persistent SQLite (path configurable via `PRELEGAL_DB_PATH`). `init_db` creates
any missing tables on startup and never drops them, so users, sessions, and
saved documents survive restarts. Conversations are not stored.

## Test

```bash
uv run pytest
```
