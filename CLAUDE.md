# Prelegal Project

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`prelegal` is a SaaS product that lets users draft common legal agreements from
the templates in `templates/`. The intended experience is an AI chat that
establishes which document the user wants and helps fill in its fields.

The available documents are indexed in `catalog.json`:

@catalog.json

There are 12 catalog entries: 11 document types plus the Mutual NDA cover page.

Expected completion: 2026-06-23.

## Development process

When instructed to build a feature:

1. Read the feature instructions from Jira (Atlassian tools).
2. Develop the feature using the `feature-dev` skill — do not skip any of its
   7 steps.
3. Thoroughly test with unit and integration tests; fix any issues.
4. Submit a PR using the GitHub tools.

## AI design

When writing code that calls an LLM, use the `groq-inference` skill: LiteLLM
against the `groq/openai/gpt-oss-120b` model with **Groq** as the inference
provider. Use Structured Outputs so results can be parsed and used to populate
fields in the legal document.

`GROQ_API_KEY` (and `OPENAI_API_KEY`) live in `.env` at the project root.

## Technical design

This is the target architecture. Much of it is **not yet built** — see
Implementation Status for what actually exists today.

- Backend in `backend/` — a `uv` project using FastAPI.
- Frontend in `frontend/` — the Next.js app.
- Database: SQLite, created fresh each time the backend starts, with a users
  table supporting sign up and sign in.
- Prefer statically building the frontend and serving it from FastAPI if
  feasible.
- Start/stop scripts in `scripts/` for each platform:

```bash
# Mac
scripts/start-mac.sh
scripts/stop-mac.sh

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```

- Backend served at http://localhost:8000.

When the backend is added: use `uv run` and `uv add` — never `python3` or `pip`.

## Dataset: Legal Templates

`catalog.json` is the index of all templates. Each entry has `name`,
`description`, and `filename` (pointing into `templates/`).

`templates/` contains the CommonPaper standard agreements in Markdown. Variable
placeholders use the format:

```html
<span class="coverpage_link">FieldName</span>
```

Cover pages are separate files (e.g., `Mutual-NDA-coverpage.md`) and reference
the standard terms document by incorporation.

## Color Scheme

Target brand palette (not yet applied — the frontend currently uses the Next.js
default theme `#ffffff` / `#171717`):

- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`

## Implementation Status

### Implemented PL-2

- CommonPaper legal document templates dataset: the standard agreements in
  `templates/` (Markdown) plus `catalog.json`, the index of all 12 catalog
  entries (`name`, `description`, `filename`).

### Implemented PL-3

- Mutual NDA Creator (frontend only): manual form with a live HTML preview that
  updates on every keystroke and a Download button that generates the PDF via
  `@react-pdf/renderer` on click. Details in `frontend/CLAUDE.md`.
- Vitest unit/component tests and Playwright E2E tests for the NDA Creator.
- Windows dev scripts: `scripts/start-dev.ps1`, `scripts/stop-dev.ps1`.
