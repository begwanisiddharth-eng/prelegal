"""Tests for the health check and dummy-login endpoints."""

from fastapi.testclient import TestClient

from app.main import app


def test_health():
    with TestClient(app) as client:
        response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_login_success():
    with TestClient(app) as client:
        response = client.post("/api/login", json={"username": "demo", "password": "demo"})
    assert response.status_code == 200
    assert response.json()["ok"] is True


def test_login_wrong_password():
    with TestClient(app) as client:
        response = client.post("/api/login", json={"username": "demo", "password": "nope"})
    assert response.status_code == 401


def test_login_unknown_user():
    with TestClient(app) as client:
        response = client.post("/api/login", json={"username": "ghost", "password": "demo"})
    assert response.status_code == 401
