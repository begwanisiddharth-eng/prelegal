"""Tests for catalog access, placeholder parsing, and the template endpoints."""

from fastapi.testclient import TestClient

from app.main import app
from app.templates import load_catalog, parse_placeholders


def auth_headers(client: TestClient, username: str) -> dict:
    token = client.post("/api/signup", json={"username": username, "password": "pw"}).json()["token"]
    return {"Authorization": f"Bearer {token}"}


def test_catalog_excludes_cover_page():
    filenames = {entry["filename"] for entry in load_catalog()}
    assert "Mutual-NDA.md" in filenames
    assert "Mutual-NDA-coverpage.md" not in filenames
    assert len(load_catalog()) == 11


def test_parse_placeholders_unique_in_order():
    markdown = (
        'A <span class="orderform_link">Customer</span> and the '
        '<span class="coverpage_link">Provider</span> and '
        '<span class="orderform_link">Customer</span> again.'
    )
    assert parse_placeholders(markdown) == ["Customer", "Provider"]


def test_template_endpoint_requires_auth():
    with TestClient(app) as client:
        response = client.get("/api/templates/Mutual-NDA.md")
    assert response.status_code == 401


def test_template_endpoint_returns_placeholders():
    with TestClient(app) as client:
        response = client.get("/api/templates/Mutual-NDA.md", headers=auth_headers(client, "tpl1"))
    assert response.status_code == 200
    body = response.json()
    assert body["filename"] == "Mutual-NDA.md"
    assert "Purpose" in body["placeholders"]
    assert body["markdown"]


def test_template_endpoint_rejects_unknown():
    with TestClient(app) as client:
        response = client.get("/api/templates/secrets.md", headers=auth_headers(client, "tpl2"))
    assert response.status_code == 404
