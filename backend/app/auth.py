"""Password hashing and token-based session auth."""

import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app import config
from app.db import SessionLocal
from app.models import AuthSession, User

bearer = HTTPBearer(auto_error=False)


def _bcrypt_bytes(password: str) -> bytes:
    # bcrypt rejects inputs longer than 72 bytes; truncate to stay within it.
    return password.encode("utf-8")[:72]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_bcrypt_bytes(password), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(_bcrypt_bytes(password), password_hash.encode())


def create_session(user_id: int) -> str:
    """Create a session token for a user and return it."""
    token = secrets.token_urlsafe(32)
    expires_at = (datetime.now(timezone.utc) + timedelta(hours=config.SESSION_TTL_HOURS)).isoformat()
    with SessionLocal() as db:
        db.add(AuthSession(token=token, user_id=user_id, expires_at=expires_at))
        db.commit()
    return token


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> User:
    """Resolve the bearer token to its user, or raise 401. Expired tokens are purged."""
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    with SessionLocal() as db:
        session = db.get(AuthSession, credentials.credentials)
        if session is not None and session.expires_at < datetime.now(timezone.utc).isoformat():
            db.delete(session)
            db.commit()
            session = None
        user = db.get(User, session.user_id) if session else None
        if user is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
