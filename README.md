# prelegal

A platform for drafting common legal agreements.

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

## Legal Templates

`catalog.json` + `templates/` — 12 CommonPaper standard agreements (Mutual NDA, BAA, DPA, CSA, and others) in Markdown with structured variable placeholders.
