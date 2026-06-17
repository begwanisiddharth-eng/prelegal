# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`prelegal` is a platform for drafting common legal agreements. Expected completion: 2026-06-23.

Stack: Next.js 16 frontend (TypeScript, Tailwind CSS, `@react-pdf/renderer`). FastAPI backend is planned but not yet scaffolded. Python package manager is `uv`.

## Repository Layout

```
catalog.json        index of all legal templates
templates/          12 CommonPaper standard agreements in Markdown
frontend/           Next.js app (the current UI)
scripts/            helper scripts for running the dev server
```

## Dataset: Legal Templates

`catalog.json` is the index of all templates. Each entry has `name`, `description`, and `filename` (pointing into `templates/`).

`templates/` contains 12 CommonPaper standard legal agreements in Markdown. Variable placeholders use the format:

```html
<span class="coverpage_link">FieldName</span>
```

Cover pages are separate files (e.g., `Mutual-NDA-coverpage.md`) and reference the standard terms document by incorporation.

## Development — Frontend

The frontend lives in `frontend/`. All commands must be run from that directory.

| Action | Command |
|---|---|
| Start dev server | `npm run dev` (or `scripts\start-dev.ps1`) |
| Stop dev server | `scripts\stop-dev.ps1` |
| Production build | `npm run build` |
| Unit + component tests | `npm test` (Vitest) |
| End-to-end tests | `npm run test:e2e` (Playwright) |

Dev server runs at **http://localhost:3000**. Test layout and the manual test
checklist are documented in `frontend/TESTING.md`.

### Using the scripts

From the project root (PowerShell):

```powershell
.\scripts\start-dev.ps1   # starts Next.js on localhost:3000
.\scripts\stop-dev.ps1    # kills whatever is listening on port 3000
```

## Development — Backend (planned)

Not yet scaffolded. When added:

- Use `uv run` and `uv add` — never `python3` or `pip`
- FastAPI, entry point TBD
