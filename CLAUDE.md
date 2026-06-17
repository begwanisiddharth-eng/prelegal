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

This is the target architecture. The scaffolding exists (see Implementation
Status); items marked **(target)** below are not fully realized yet.

- Backend in `backend/` — a `uv` project using FastAPI + SQLAlchemy.
- Frontend in `frontend/` — the Next.js app, statically exported and served by
  FastAPI in production.
- Database: SQLite via SQLAlchemy, **persistent** across restarts (config-driven
  path `PRELEGAL_DB_PATH`; tables created if missing, never wiped). Holds users,
  sessions, and saved documents. Conversations are not persisted.
- Frontend is statically built (`output: 'export'`) and served from FastAPI.
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

- Backend (and the frontend it serves) at http://localhost:8000.

In the backend, use `uv run` and `uv add` — never `python3` or `pip`. In dev the
Next.js server runs separately on :3000 and reaches the API via
`NEXT_PUBLIC_API_BASE`; in production everything is same-origin on :8000.

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

Brand palette, applied to the app chrome (headers, buttons, chat, login) as
Tailwind tokens (`brand-navy`, `brand-blue`, etc.) defined in
`frontend/app/globals.css`. The document preview keeps black/gray text to stay
faithful to the generated PDF.

- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7` (chat user bubbles, focus rings)
- Purple Secondary: `#753991` (submit/download buttons)
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

### Implemented PL-4

- Backend in `backend/` (FastAPI + SQLAlchemy, `uv` project): `GET /api/health`
  and `POST /api/login`, which validated against a temporary SQLite `users`
  table with a dummy login (no real authentication yet — superseded by PL-7).
- Frontend configured for static export and served by FastAPI on :8000. A login
  page posts to `/api/login`; a client-side flag (`AuthGuard`) gates the MNDA
  Creator, which is otherwise unchanged.
- Cross-platform start/stop scripts (`scripts/start-{windows,mac,linux}` and
  matching `stop-*`) that build the frontend then run FastAPI on :8000. These
  replace the old `start-dev.ps1` / `stop-dev.ps1`.
- pytest suite for the backend; Vitest tests for the login page, auth helper,
  and guard; an E2E test for the login redirect.

### Implemented PL-5

- AI chat replaces the manual form: the left panel is now a freeform chat
  (`ChatPanel`) that asks about the document and populates the MNDA fields from
  the user's answers. The live HTML preview and PDF download are unchanged.
- Backend `POST /api/chat` (`app/chat.py`) calls the LLM via the
  `groq-inference` skill (LiteLLM → `groq/openai/gpt-oss-120b`, Structured
  Outputs) and returns the assistant reply plus the full MNDA field set. The
  endpoint is stateless — the frontend sends the conversation and current
  fields each turn.
- Still Mutual-NDA-only; no document-type selection yet.
- pytest for the chat endpoint (LLM call stubbed); Vitest for `ChatPanel` and
  the chat client; E2E drives the chat with a mocked `/api/chat`.

### Implemented PL-6

- All 11 catalog document types are supported. The chat greets, asks which
  document, and for an unsupported request suggests the nearest catalog document.
- Generic engine replaces the MNDA-specific code. `app/templates.py` serves
  `GET /api/catalog` and `GET /api/templates/{filename}` and deterministically
  parses placeholders (every `<span class="*_link">Name</span>`). The frontend
  `lib/template.ts` parses a template into blocks shared by `TemplatePreview`
  (HTML, gray blanks) and `TemplatePdfDocument` (react-pdf; **unfilled**
  placeholders get a red underline in the PDF only).
- `POST /api/chat` is document-agnostic: it carries the chosen document and a
  dynamic field list, picks the document (nearest-from-catalog for unsupported
  requests), and asks about fields most-important-first so an early opt-out
  still captures the key fields. It uses JSON mode with Pydantic validation and
  retries on a malformed response (Groq's strict json_schema mode was brittle).
- Removed the MNDA-specific `lib/mnda.ts`, `MNDAHtmlPreview`, `MNDAPdfDocument`,
  and `MNDADownloadButton`. Tests updated across backend, Vitest, and E2E.

### Implemented PL-7

- Multiple users, each with their own sign-in and private saved documents.
  Real auth: bcrypt-hashed passwords, token sessions (`Authorization: Bearer`),
  and a now-persistent SQLite DB. Conversations are not persisted.
- Backend (`app/auth.py`, `app/models.py`): `POST /api/signup`, `/api/login`,
  `/api/logout`; `users`, `sessions`, `saved_documents` tables; a
  `get_current_user` dependency; `GET/POST/PUT /api/documents` (per-user,
  isolated). `init_db` now creates missing tables only (no drop).
- Frontend screens: `/login` (with a sign-up link), `/signup` (auto-login on
  success), Home `/` (Start New Conversation / Download Saved Documents),
  creator `/create`, and `/saved`. `lib/auth.ts` is token-based; `lib/documents.ts`
  is the saved-docs client; `lib/pdf.tsx` is the shared PDF download.
- Save flow: Save and Generate PDF appear only once a document is chosen. First
  Save prompts for a name (custom dialog) and creates the entry; later saves
  update it. Unsaved-changes warnings (custom dialogs) gate Home and Log Out;
  Generate PDF shows a one-button notice when there are unsaved changes, then
  downloads. All dialogs are custom in-app components in `components/Dialog.tsx`.
