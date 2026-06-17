"""LLM-backed chat that picks a document and fills its placeholders by conversation."""

import json

import litellm
from fastapi import HTTPException
from litellm import completion
from pydantic import BaseModel, Field, ValidationError
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.templates import catalog_filenames, load_catalog, parse_placeholders, read_template

MODEL = "groq/openai/gpt-oss-120b"


class MalformedResponse(Exception):
    """The model did not return a JSON object matching ChatResponse."""


class FieldValue(BaseModel):
    name: str
    value: str


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    document: str = ""
    fields: list[FieldValue] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    document: str
    fields: list[FieldValue]


SYSTEM_PROMPT = """You help a user create a legal document by chatting with them. \
Only the documents in the provided catalog can be generated.

Always refer to a document by its catalog NAME (for example "Partnership Agreement"). \
Never mention filenames, file extensions, ".md", or the word "template" in your replies. \
The `document` field carries the filename for internal use only. The finished document is \
delivered to the user as a downloadable PDF.

Choosing the document:
- If the user asks for a document that is not in the catalog, explain you can't generate \
that one, suggest the closest catalog document (judging by the names and descriptions), and \
ask if they want to proceed with it. Do not pick a document until the user settles on one.
- When the user settles on a supported document, set `document` to that catalog filename. In \
the SAME reply, confirm the document, tell the user you'll now ask about its fields one at a \
time, mention they can say "generate as-is" at any point to finish with what's filled so far, \
and ask the FIRST field question.

Filling fields (once a document is chosen):
- Ask about the placeholders that are still empty, MOST IMPORTANT FIRST (you decide the \
importance; cover-page / key commercial terms and party names first), so that if the user \
stops early the important fields are already filled.
- Every reply must contain exactly one question until all fields are filled or the user opts \
out, then confirm the document is ready to download (and ask nothing further).
- Some placeholders are grammatical variants of the same thing (for example "Customer" and \
"Customer's"); ask about them once and fill all the variants consistently.
- Only use field names from the provided placeholder list. Always return ALL known fields in \
`fields` as name/value pairs, preserving values already gathered; leave the rest out.

Always keep `document` set to the current filename once chosen (echo it back every turn).

Respond with ONLY a JSON object (no text outside it) of exactly this shape:
{"reply": "<your message to the user>", "document": "<chosen catalog filename, or empty \
string if none chosen yet>", "fields": [{"name": "<placeholder name>", "value": "<value>"}]}"""


def _context_message(document: str, fields: list[FieldValue]) -> str:
    catalog = load_catalog()
    lines = ["Catalog of supported documents (name -- filename -- description):"]
    for entry in catalog:
        lines.append(f"- {entry['name']} -- {entry['filename']} -- {entry['description']}")

    if document:
        placeholders = parse_placeholders(read_template(document))
        known = {f.name: f.value for f in fields}
        lines.append(f"\nChosen document: {document}")
        lines.append(f"Placeholders to fill: {json.dumps(placeholders)}")
        lines.append(f"Current field values: {json.dumps(known)}")
    else:
        lines.append("\nNo document chosen yet.")
    return "\n".join(lines)


@retry(
    reraise=True,
    stop=stop_after_attempt(4),
    wait=wait_exponential(multiplier=2, min=2, max=32),
    retry=retry_if_exception_type(
        (litellm.RateLimitError, litellm.ServiceUnavailableError, MalformedResponse)
    ),
)
def _complete(messages: list[dict]) -> ChatResponse:
    """Call the model in JSON mode and validate it against ChatResponse, retrying on failure."""
    response = completion(
        model=MODEL,
        messages=messages,
        response_format={"type": "json_object"},
        reasoning_effort="high",
        allowed_openai_params=["reasoning_effort"],
    )
    content = response.choices[0].message.content
    try:
        return ChatResponse.model_validate_json(content)
    except ValidationError as error:
        raise MalformedResponse(str(error))


def run_chat(request: ChatRequest) -> ChatResponse:
    """Send the conversation to the model and return its reply, document, and fields."""
    if request.document and request.document not in catalog_filenames():
        raise HTTPException(status_code=400, detail="Unknown document")
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": _context_message(request.document, request.fields)},
        *({"role": m.role, "content": m.content} for m in request.messages),
    ]
    return _complete(messages)
