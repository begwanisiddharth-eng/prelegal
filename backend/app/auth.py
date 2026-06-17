"""Password hashing and token-based session auth."""

import secrets

import bcrypt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.db import SessionLocal
from app.models import Session, User

bearer = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def create_session(user_id: int) -> str:
    """Create a session token for a user and return it."""
    token = secrets.token_urlsafe(32)
    with SessionLocal() as db:
        db.add(Session(token=token, user_id=user_id))
        db.commit()
    return token


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> User:
    """Resolve the bearer token to its user, or raise 401."""
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    with SessionLocal() as db:
        session = db.get(Session, credentials.credentials)
        user = db.get(User, session.user_id) if session else None
        if user is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
