"""Tests for the chat endpoint, with the LLM call stubbed out."""

import json
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app import chat as chat_module
from app.main import app

CANNED_FIELDS = {
    "purpose": "Evaluating a partnership",
    "effectiveDate": "",
    "mndaTermType": "fixed",
    "mndaTermYears": "",
    "confidentialityTermType": "fixed",
    "confidentialityTermYears": "",
    "governingLaw": "",
    "jurisdiction": "",
    "party1": {"printName": "", "title": "", "company": "", "noticeAddress": "", "date": ""},
    "party2": {"printName": "", "title": "", "company": "", "noticeAddress": "", "date": ""},
}


def fake_completion(**kwargs):
    payload = {"reply": "Got it. What is the purpose?", "fields": CANNED_FIELDS}
    message = SimpleNamespace(content=json.dumps(payload))
    return SimpleNamespace(choices=[SimpleNamespace(message=message)])


def test_chat_returns_reply_and_fields(monkeypatch):
    monkeypatch.setattr(chat_module, "completion_with_backoff", fake_completion)
    with TestClient(app) as client:
        response = client.post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "I need an NDA"}]},
        )
    assert response.status_code == 200
    body = response.json()
    assert body["reply"]
    assert body["fields"]["purpose"] == "Evaluating a partnership"


def test_chat_sends_system_prompt_history_and_known_fields(monkeypatch):
    captured = {}

    def capture(**kwargs):
        captured.update(kwargs)
        return fake_completion(**kwargs)

    monkeypatch.setattr(chat_module, "completion_with_backoff", capture)
    with TestClient(app) as client:
        client.post(
            "/api/chat",
            json={
                "messages": [{"role": "user", "content": "hello"}],
                "fields": {"governingLaw": "Delaware"},
            },
        )

    messages = captured["messages"]
    assert messages[0]["role"] == "system"
    assert any("Delaware" in m["content"] for m in messages)
    assert messages[-1] == {"role": "user", "content": "hello"}
