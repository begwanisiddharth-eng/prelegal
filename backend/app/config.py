"""Application configuration, overridable via environment variables."""

import os
from pathlib import Path

from dotenv import load_dotenv

APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent

# Load the project-root .env so GROQ_API_KEY is available to the LLM client.
load_dotenv(PROJECT_ROOT / ".env")

# Persistent SQLite database location (override with PRELEGAL_DB_PATH).
DB_PATH = Path(os.getenv("PRELEGAL_DB_PATH", BACKEND_DIR / "prelegal.db"))
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Directory holding the statically-exported frontend (frontend/out). Mounted
# only when present, so the API can run without a frontend build (e.g. tests).
FRONTEND_DIR = Path(os.getenv("PRELEGAL_FRONTEND_DIR", PROJECT_ROOT / "frontend" / "out"))

# Allowed CORS origins (comma-separated) for the cross-origin dev frontend.
CORS_ORIGINS = os.getenv("PRELEGAL_CORS_ORIGINS", "http://localhost:3000").split(",")

# Session lifetime in hours.
SESSION_TTL_HOURS = int(os.getenv("PRELEGAL_SESSION_TTL_HOURS", "168"))
