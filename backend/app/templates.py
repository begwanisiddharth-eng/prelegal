"""Catalog access and deterministic placeholder parsing for the templates."""

import json
import re

from app.config import PROJECT_ROOT

CATALOG_PATH = PROJECT_ROOT / "catalog.json"
TEMPLATES_DIR = PROJECT_ROOT / "templates"

# Catalog entries that are cover pages, not selectable documents on their own.
COVERPAGE_FILENAMES = {"Mutual-NDA-coverpage.md"}

# Every placeholder is a <span class="..._link">Field Name</span>; the field is
# the span's text. The same field name appearing again fills with the same value.
PLACEHOLDER_RE = re.compile(r'<span class="[a-z]+_link">(.*?)</span>')


def load_catalog() -> list[dict]:
    """Return the selectable documents (cover-page entries excluded)."""
    entries = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    return [entry for entry in entries if entry["filename"] not in COVERPAGE_FILENAMES]


def catalog_filenames() -> set[str]:
    return {entry["filename"] for entry in load_catalog()}


def read_template(filename: str) -> str:
    # Guard against path traversal: only ever read known catalog files.
    if filename not in catalog_filenames():
        raise ValueError(f"Unknown template: {filename}")
    return (TEMPLATES_DIR / filename).read_text(encoding="utf-8")


def parse_placeholders(markdown: str) -> list[str]:
    """Return the unique placeholder field names, in order of first appearance."""
    fields: list[str] = []
    for match in PLACEHOLDER_RE.finditer(markdown):
        field = match.group(1).strip()
        if field and field not in fields:
            fields.append(field)
    return fields
