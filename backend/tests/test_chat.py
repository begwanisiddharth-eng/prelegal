"""Tests for the chat endpoint, with the LLM call stubbed out."""

import json
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app import chat as chat_module
from app.chat import SYSTEM_PROMPT
from app.main import app


def auth_headers(client: TestClient, username: str) -> dict:
    token = client.post("/api/signup", json={"username": username, "password": "pw"}).json()["token"]
    return {"Authorization": f"Bearer {token}"}


def test_prompt_forbids_filenames_and_mentions_pdf():
    assert ".md" in SYSTEM_PROMPT  # the rule explicitly names the extension to avoid
    assert "filename" in SYSTEM_PROMPT.lower()
    assert "PDF" in SYSTEM_PROMPT


def fake_completion(**kwargs):
    payload = {
        "reply": "Got it. What is the purpose?",
        "document": "Mutual-NDA.md",
        "fields": [{"name": "Purpose", "value": "Evaluating a partnership"}],
    }
    message = SimpleNamespace(content=json.dumps(payload))
    return SimpleNamespace(choices=[SimpleNamespace(message=message)])


def test_chat_requires_authentication():
    with TestClient(app) as client:
        response = client.post("/api/chat", json={"messages": [{"role": "user", "content": "hi"}]})
    assert response.status_code == 401


def test_chat_returns_reply_document_and_fields(monkeypatch):
    monkeypatch.setattr(chat_module, "completion", fake_completion)
    with TestClient(app) as client:
        response = client.post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "I need an NDA"}]},
            headers=auth_headers(client, "chat1"),
        )
    assert response.status_code == 200
    body = response.json()
    assert body["document"] == "Mutual-NDA.md"
    assert body["fields"][0]["name"] == "Purpose"


def test_chat_rejects_unknown_document(monkeypatch):
    monkeypatch.setattr(chat_module, "completion", fake_completion)
    with TestClient(app) as client:
        response = client.post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "hi"}], "document": "../app/config.py"},
            headers=auth_headers(client, "chat2"),
        )
    assert response.status_code == 400


def test_chat_sends_catalog_and_placeholders(monkeypatch):
    captured = {}

    def capture(**kwargs):
        captured.update(kwargs)
        return fake_completion(**kwargs)

    monkeypatch.setattr(chat_module, "completion", capture)
    with TestClient(app) as client:
        client.post(
            "/api/chat",
            json={
                "messages": [{"role": "user", "content": "fill it in"}],
                "document": "Mutual-NDA.md",
                "fields": [{"name": "Governing Law", "value": "Delaware"}],
            },
            headers=auth_headers(client, "chat3"),
        )

    context = "\n".join(m["content"] for m in captured["messages"] if m["role"] == "system")
    assert "Cloud Service Agreement" in context  # catalog is provided
    assert "Purpose" in context  # parsed placeholders for the chosen document
    assert "Delaware" in context  # current field values
