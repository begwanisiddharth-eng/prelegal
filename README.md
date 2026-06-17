# prelegal

A platform for drafting common legal agreements. The intended experience is an
AI chat that establishes which document a user wants and helps fill in its
fields.

## Status

In progress — expected completion 2026-06-23.

Currently implemented: a fake login (dummy `demo` / `demo`) gating the Mutual
NDA Creator, served by a FastAPI backend.

## Running the app

The start script builds the frontend and serves it (plus the API) from FastAPI.
Use the script for your platform:

```powershell
.\scripts\start-windows.ps1   # macOS/Linux: scripts/start-mac.sh or start-linux.sh
```

Then open [http://localhost:8000](http://localhost:8000) and sign in with
`demo` / `demo`.

To stop the server:

```powershell
.\scripts\stop-windows.ps1    # macOS/Linux: scripts/stop-mac.sh or stop-linux.sh
```

## Testing

Frontend (from `frontend/`):

```bash
npm test          # unit + component tests (Vitest)
npm run test:e2e  # end-to-end tests (Playwright)
```

Backend (from `backend/`):

```bash
uv run pytest
```

See [`frontend/TESTING.md`](frontend/TESTING.md) for the manual test checklist.

## Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, `@react-pdf/renderer`
- **Backend**: FastAPI + SQLAlchemy (SQLite), Python via `uv`
- **AI**: LiteLLM against `groq/openai/gpt-oss-120b` (Groq), Structured Outputs (planned)

## Legal Templates

`catalog.json` + `templates/` — 12 CommonPaper catalog entries (11 agreement
types such as Mutual NDA, BAA, DPA, and CSA, plus the Mutual NDA cover page) in
Markdown with structured variable placeholders.
