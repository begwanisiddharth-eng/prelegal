# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`prelegal` is a platform for drafting common legal agreements. Expected completion: 2026-06-23.

Planned stack (inferred from `.gitignore`): FastAPI backend + Next.js frontend, with `uv` as the Python package manager.

## Dataset: Legal Templates

`catalog.json` is the index of all templates. Each entry has `name`, `description`, and `filename` (pointing into `templates/`).

`templates/` contains 12 CommonPaper standard legal agreements in Markdown. Variable placeholders use the format:

```html
<span class="coverpage_link">FieldName</span>
```

Cover pages are separate files (e.g., `Mutual-NDA-coverpage.md`) and reference the standard terms document by incorporation.

## Development Commands

No build system exists yet. Once the backend and frontend are scaffolded:

- Python (backend): use `uv run` and `uv add` — never `python3` or `pip`
- Frontend: Next.js (scaffolded with `npx create-next-app` or equivalent)
