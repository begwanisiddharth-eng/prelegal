# prelegal

A platform for drafting common legal agreements. The intended experience is an
AI chat that establishes which document a user wants and helps fill in its
fields.

## Status

In progress — expected completion 2026-06-23.

Currently implemented: Mutual NDA Creator (frontend only).

## Running the app

```powershell
.\scripts\start-dev.ps1
```

Then open [http://localhost:3000](http://localhost:3000).

To stop the server:

```powershell
.\scripts\stop-dev.ps1
```

## Testing

From `frontend/`:

```bash
npm test          # unit + component tests (Vitest)
npm run test:e2e  # end-to-end tests (Playwright)
```

See [`frontend/TESTING.md`](frontend/TESTING.md) for the manual test checklist.

## Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, `@react-pdf/renderer`
- **Backend**: FastAPI (planned), Python via `uv`
- **AI**: LiteLLM against `groq/openai/gpt-oss-120b` (Groq), Structured Outputs (planned)

## Legal Templates

`catalog.json` + `templates/` — 12 CommonPaper catalog entries (11 agreement
types such as Mutual NDA, BAA, DPA, and CSA, plus the Mutual NDA cover page) in
Markdown with structured variable placeholders.
