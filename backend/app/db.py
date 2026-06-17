"""SQLAlchemy engine, session factory, and schema setup."""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import DATABASE_URL

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)


class Base(DeclarativeBase):
    """Base class for all ORM models."""


def init_db() -> None:
    """Create the schema. The drop is temporary — remove it to persist data."""
    from app import models  # noqa: F401  register models on Base.metadata

    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
