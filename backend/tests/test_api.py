"""Tests for auth (signup/login/logout) and the saved-documents API."""

from fastapi.testclient import TestClient

from app.main import app


def auth_headers(client: TestClient, username: str, password: str = "pw") -> dict:
    token = client.post("/api/signup", json={"username": username, "password": password}).json()["token"]
    return {"Authorization": f"Bearer {token}"}


def test_health():
    with TestClient(app) as client:
        response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_signup_returns_token_and_rejects_duplicates():
    with TestClient(app) as client:
        first = client.post("/api/signup", json={"username": "alice", "password": "pw"})
        assert first.status_code == 200
        assert first.json()["token"]
        duplicate = client.post("/api/signup", json={"username": "alice", "password": "pw"})
    assert duplicate.status_code == 409


def test_login_with_seeded_demo_user():
    with TestClient(app) as client:
        ok = client.post("/api/login", json={"username": "demo", "password": "demo"})
        assert ok.status_code == 200
        assert ok.json()["token"]
        bad = client.post("/api/login", json={"username": "demo", "password": "nope"})
    assert bad.status_code == 401


def test_documents_require_authentication():
    with TestClient(app) as client:
        response = client.get("/api/documents")
    assert response.status_code == 401


def test_document_create_list_update_roundtrip():
    with TestClient(app) as client:
        headers = auth_headers(client, "bob")
        created = client.post(
            "/api/documents",
            json={"name": "My NDA", "document": "Mutual-NDA.md", "fields": [{"name": "Purpose", "value": "X"}]},
            headers=headers,
        )
        assert created.status_code == 200
        doc_id = created.json()["id"]

        listed = client.get("/api/documents", headers=headers).json()
        assert len(listed) == 1
        assert listed[0]["name"] == "My NDA"

        updated = client.put(
            f"/api/documents/{doc_id}",
            json={"name": "Renamed", "fields": [{"name": "Purpose", "value": "Y"}]},
            headers=headers,
        )
        assert updated.status_code == 200
        assert updated.json()["name"] == "Renamed"
        assert updated.json()["fields"][0]["value"] == "Y"


def test_documents_are_isolated_per_user():
    with TestClient(app) as client:
        carol = auth_headers(client, "carol")
        dave = auth_headers(client, "dave")
        doc_id = client.post(
            "/api/documents",
            json={"name": "Carol doc", "document": "Mutual-NDA.md", "fields": []},
            headers=carol,
        ).json()["id"]

        # Dave cannot see or modify Carol's document.
        assert client.get("/api/documents", headers=dave).json() == []
        blocked = client.put(f"/api/documents/{doc_id}", json={"fields": []}, headers=dave)
    assert blocked.status_code == 404


def test_logout_invalidates_the_token():
    with TestClient(app) as client:
        headers = auth_headers(client, "erin")
        assert client.get("/api/documents", headers=headers).status_code == 200
        client.post("/api/logout", headers=headers)
        after = client.get("/api/documents", headers=headers)
    assert after.status_code == 401
