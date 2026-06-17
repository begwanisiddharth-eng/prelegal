#!/usr/bin/env bash
# Build the frontend, then serve it and the API from FastAPI on http://localhost:8000
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"

cd "$root/frontend"
npm install
npm run build

cd "$root/backend"
uv run uvicorn app.main:app --host 127.0.0.1 --port 8000
