"""LLM-backed chat that gathers Mutual NDA fields via free-form conversation."""

from typing import Literal

import litellm
from litellm import completion
from pydantic import BaseModel, Field
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

MODEL = "groq/openai/gpt-oss-120b"


@retry(
    reraise=True,
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=2, min=4, max=64),
    retry=retry_if_exception_type((litellm.RateLimitError, litellm.ServiceUnavailableError)),
)
def completion_with_backoff(**kwargs):
    kwargs.setdefault("allowed_openai_params", ["reasoning_effort"])
    return completion(**kwargs)


class Party(BaseModel):
    printName: str = ""
    title: str = ""
    company: str = ""
    noticeAddress: str = ""
    date: str = ""


class MNDAFields(BaseModel):
    """The Mutual NDA fields, mirroring the frontend's MNDAFormData."""

    purpose: str = ""
    effectiveDate: str = ""
    mndaTermType: Literal["fixed", "until-terminated"] = "fixed"
    mndaTermYears: str = ""
    confidentialityTermType: Literal["fixed", "perpetuity"] = "fixed"
    confidentialityTermYears: str = ""
    governingLaw: str = ""
    jurisdiction: str = ""
    party1: Party = Field(default_factory=Party)
    party2: Party = Field(default_factory=Party)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    fields: MNDAFields = Field(default_factory=MNDAFields)


class ChatResponse(BaseModel):
    reply: str
    fields: MNDAFields


SYSTEM_PROMPT = """You are an assistant that helps a user complete a Common Paper Mutual \
Non-Disclosure Agreement (MNDA) through a friendly, free-form conversation. Only this one \
document type is supported.

Gather these fields, asking about a few at a time in natural language (never dump a form):
- purpose: the business purpose for sharing confidential information
- effectiveDate: when the agreement takes effect (YYYY-MM-DD)
- mndaTermType: "fixed" (a set number of years) or "until-terminated"
- mndaTermYears: the number of years, when the term is fixed
- confidentialityTermType: "fixed" or "perpetuity"
- confidentialityTermYears: the number of years, when fixed
- governingLaw: the US state whose law governs the agreement
- jurisdiction: the courts/location where disputes are handled
- party1 and party2, each with: printName, title, company, noticeAddress, date

Rules:
- Always return the complete `fields` object, preserving every value already gathered (the \
current known values are given to you). Only change a field when the user supplies or revises it.
- Leave unknown text fields as empty strings; keep the enum fields at their current values \
until the user decides.
- Keep `reply` short and conversational: acknowledge what you captured, then ask the next question.
- Use YYYY-MM-DD for all dates.
- When every field is filled, tell the user the NDA is complete and ready to download."""


def run_chat(request: ChatRequest) -> ChatResponse:
    """Send the conversation to the model and return its reply plus updated fields."""
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "system",
            "content": f"Current known field values (JSON): {request.fields.model_dump_json()}",
        },
        *({"role": m.role, "content": m.content} for m in request.messages),
    ]
    response = completion_with_backoff(
        model=MODEL,
        messages=messages,
        response_format=ChatResponse,
        reasoning_effort="high",
    )
    return ChatResponse.model_validate_json(response.choices[0].message.content)
