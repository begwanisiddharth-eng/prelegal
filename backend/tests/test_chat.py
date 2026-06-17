"""Tests for the chat endpoint, with the LLM call stubbed out."""

import json
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app import chat as chat_module
from app.main import app


def fake_completion(**kwargs):
    payload = {
        "reply": "Got it. What is the purpose?",
        "document": "Mutual-NDA.md",
        "fields": [{"name": "Purpose", "value": "Evaluating a partnership"}],
    }
    message = SimpleNamespace(content=json.dumps(payload))
    return SimpleNamespace(choices=[SimpleNamespace(message=message)])


def test_chat_returns_reply_document_and_fields(monkeypatch):
    monkeypatch.setattr(chat_module, "completion", fake_completion)
    with TestClient(app) as client:
        response = client.post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "I need an NDA"}]},
        )
    assert response.status_code == 200
    body = response.json()
    assert body["document"] == "Mutual-NDA.md"
    assert body["fields"][0]["name"] == "Purpose"


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
        )

    context = "\n".join(m["content"] for m in captured["messages"] if m["role"] == "system")
    assert "Cloud Service Agreement" in context  # catalog is provided
    assert "Purpose" in context  # parsed placeholders for the chosen document
    assert "Delaware" in context  # current field values
