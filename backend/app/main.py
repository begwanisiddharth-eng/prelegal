"""FastAPI application: auth, saved documents, chat, and static frontend serving."""

import json
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import select

from app import config
from app.auth import bearer, create_session, get_current_user, hash_password, verify_password
from app.chat import ChatRequest, ChatResponse, FieldValue, run_chat
from app.db import SessionLocal, init_db
from app.models import SavedDocument, Session, User, now_iso
from app.templates import catalog_filenames, load_catalog, parse_placeholders, read_template


def seed_user() -> None:
    """Insert the demo user if it is not already present."""
    with SessionLocal() as db:
        if db.scalar(select(User).where(User.username == config.SEED_USERNAME)) is None:
            db.add(User(username=config.SEED_USERNAME, password_hash=hash_password(config.SEED_PASSWORD)))
            db.commit()


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


class Credentials(BaseModel):
    username: str
    password: str


class DocumentIn(BaseModel):
    name: str
    document: str
    fields: list[FieldValue]


class DocumentUpdate(BaseModel):
    fields: list[FieldValue]
    name: str | None = None


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/signup")
def signup(body: Credentials) -> dict:
    with SessionLocal() as db:
        if db.scalar(select(User).where(User.username == body.username)):
            raise HTTPException(status_code=409, detail="Username already taken")
        user = User(username=body.username, password_hash=hash_password(body.password))
        db.add(user)
        db.commit()
        db.refresh(user)
        user_id = user.id
    return {"token": create_session(user_id), "username": body.username}


@app.post("/api/login")
def login(body: Credentials) -> dict:
    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.username == body.username))
        if user is None or not verify_password(body.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid username or password")
        user_id = user.id
    return {"token": create_session(user_id), "username": body.username}


@app.post("/api/logout")
def logout(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)) -> dict:
    """Delete the caller's session token."""
    if credentials:
        with SessionLocal() as db:
            session = db.get(Session, credentials.credentials)
            if session:
                db.delete(session)
                db.commit()
    return {"ok": True}


def _document_payload(doc: SavedDocument) -> dict:
    return {
        "id": doc.id,
        "name": doc.name,
        "document": doc.document,
        "fields": json.loads(doc.fields_json),
        "updated_at": doc.updated_at,
    }


@app.get("/api/documents")
def list_documents(user: User = Depends(get_current_user)) -> list[dict]:
    with SessionLocal() as db:
        docs = db.scalars(
            select(SavedDocument)
            .where(SavedDocument.user_id == user.id)
            .order_by(SavedDocument.updated_at.desc())
        ).all()
        return [_document_payload(doc) for doc in docs]


@app.post("/api/documents")
def create_document(body: DocumentIn, user: User = Depends(get_current_user)) -> dict:
    with SessionLocal() as db:
        doc = SavedDocument(
            user_id=user.id,
            name=body.name,
            document=body.document,
            fields_json=json.dumps([f.model_dump() for f in body.fields]),
            updated_at=now_iso(),
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return _document_payload(doc)


@app.put("/api/documents/{doc_id}")
def update_document(doc_id: int, body: DocumentUpdate, user: User = Depends(get_current_user)) -> dict:
    with SessionLocal() as db:
        doc = db.get(SavedDocument, doc_id)
        if doc is None or doc.user_id != user.id:
            raise HTTPException(status_code=404, detail="Document not found")
        doc.fields_json = json.dumps([f.model_dump() for f in body.fields])
        if body.name:
            doc.name = body.name
        doc.updated_at = now_iso()
        db.commit()
        db.refresh(doc)
        return _document_payload(doc)


@app.get("/api/catalog")
def catalog() -> list[dict]:
    return load_catalog()


@app.get("/api/templates/{filename}")
def template(filename: str) -> dict:
    if filename not in catalog_filenames():
        raise HTTPException(status_code=404, detail="Unknown template")
    markdown = read_template(filename)
    return {"filename": filename, "markdown": markdown, "placeholders": parse_placeholders(markdown)}


@app.post("/api/chat")
def chat(req: ChatRequest) -> ChatResponse:
    return run_chat(req)


# Serve the statically-exported frontend (when built). Mounted last so the
# /api routes above take precedence over the catch-all.
if config.FRONTEND_DIR.is_dir():
    app.mount("/", StaticFiles(directory=config.FRONTEND_DIR, html=True), name="frontend")
