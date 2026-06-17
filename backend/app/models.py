"""Database models."""

from datetime import datetime, timezone

from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class User(Base):
    """An application user."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(unique=True, index=True)
    password_hash: Mapped[str] = mapped_column()


class Session(Base):
    """An auth session: a bearer token mapped to a user."""

    __tablename__ = "sessions"

    token: Mapped[str] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)


class SavedDocument(Base):
    """A user's saved document: a chosen template plus its field values."""

    __tablename__ = "saved_documents"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column()
    document: Mapped[str] = mapped_column()  # template filename
    fields_json: Mapped[str] = mapped_column(Text, default="[]")  # JSON [{name, value}]
    updated_at: Mapped[str] = mapped_column(default=now_iso)
