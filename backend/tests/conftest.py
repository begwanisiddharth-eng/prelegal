"""Point the database at a throwaway file before the app imports config."""

import atexit
import os
import shutil
import tempfile

import pytest
from fastapi.testclient import TestClient

_TMP_DIR = tempfile.mkdtemp()
os.environ["PRELEGAL_DB_PATH"] = os.path.join(_TMP_DIR, "test.db")
atexit.register(lambda: shutil.rmtree(_TMP_DIR, ignore_errors=True))


@pytest.fixture
def auth_headers():
    """Return a helper that signs up a user and yields their auth header."""

    def _make(client: TestClient, username: str) -> dict:
        token = client.post("/api/signup", json={"username": username, "password": "pw"}).json()["token"]
        return {"Authorization": f"Bearer {token}"}

    return _make
