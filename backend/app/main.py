"""FastAPI application: dummy-login API plus static frontend serving."""

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import select

from app import config
from app.chat import ChatRequest, ChatResponse, run_chat
from app.db import SessionLocal, init_db
from app.models import User
from app.templates import catalog_filenames, load_catalog, parse_placeholders, read_template


def seed_user() -> None:
    """Insert the temporary dummy user if it is not already present."""
    with SessionLocal() as session:
        existing = session.scalar(select(User).where(User.username == config.SEED_USERNAME))
        if existing is None:
            session.add(User(username=config.SEED_USERNAME, password=config.SEED_PASSWORD))
            session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_user()
    yield


app = FastAPI(title="Prelegal", lifespan=lifespan)

# The Next.js dev server runs on a separate origin; allow it during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    username: str
    password: str


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/login")
def login(req: LoginRequest) -> dict:
    with SessionLocal() as session:
        user = session.scalar(select(User).where(User.username == req.username))
    # Plaintext comparison — placeholder until real authentication is added.
    if user is None or user.password != req.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"ok": True, "username": user.username}


@app.get("/api/catalog")
def catalog() -> list[dict]:
    return load_catalog()


@app.get("/api/templates/{filename}")
def template(filename: str) -> dict:
    if filename not in catalog_filenames():
        raise HTTPException(status_code=404, detail="Unknown template")
    markdown = read_template(filename)
    return {
        "filename": filename,
        "markdown": markdown,
        "placeholders": parse_placeholders(markdown),
    }


@app.post("/api/chat")
def chat(req: ChatRequest) -> ChatResponse:
    return run_chat(req)


# Serve the statically-exported frontend (when built). Mounted last so the
# /api routes above take precedence over the catch-all.
if config.FRONTEND_DIR.is_dir():
    app.mount("/", StaticFiles(directory=config.FRONTEND_DIR, html=True), name="frontend")
