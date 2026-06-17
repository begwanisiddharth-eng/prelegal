"""Application configuration, overridable via environment variables."""

import os
from pathlib import Path

APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent

# SQLite database location. Temporary by default (recreated on startup); point
# PRELEGAL_DB_PATH at a durable location when persistence is introduced.
DB_PATH = Path(os.getenv("PRELEGAL_DB_PATH", BACKEND_DIR / "prelegal.db"))
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Directory holding the statically-exported frontend (frontend/out). Mounted
# only when present, so the API can run without a frontend build (e.g. tests).
FRONTEND_DIR = Path(os.getenv("PRELEGAL_FRONTEND_DIR", PROJECT_ROOT / "frontend" / "out"))

# Credentials seeded for the temporary dummy login.
SEED_USERNAME = os.getenv("PRELEGAL_SEED_USER", "demo")
SEED_PASSWORD = os.getenv("PRELEGAL_SEED_PASSWORD", "demo")
