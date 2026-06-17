# Build the frontend, then serve it and the API from FastAPI on http://localhost:8000
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent

Push-Location "$root\frontend"
npm install
npm run build
Pop-Location

Push-Location "$root\backend"
uv run uvicorn app.main:app --host 127.0.0.1 --port 8000
Pop-Location
