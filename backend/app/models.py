"""Database models."""

from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class User(Base):
    """An application user. Authentication is not yet implemented."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(unique=True, index=True)
    # Plaintext for the temporary dummy login. Replace with a password hash
    # when real authentication is added.
    password: Mapped[str] = mapped_column()
