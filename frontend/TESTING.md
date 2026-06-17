# Testing

## Automated tests

| Layer | Tool | Location | Run |
|---|---|---|---|
| Unit (pure logic) | Vitest | `lib/*.test.ts` | `npm test` |
| Component (DOM/interaction) | Vitest + Testing Library | `components/*.test.tsx` | `npm test` |
| End-to-end (real browser) | Playwright | `e2e/*.spec.ts` | `npm run test:e2e` |

```bash
npm test          # run unit + component tests once
npm run test:watch  # watch mode
npm run test:e2e    # Playwright (auto-starts the dev server)
```

Playwright drives Chromium headless and starts/stops the Next.js dev server
itself (see `playwright.config.ts`). First run needs the browser binary:
`npx playwright install chromium`.

### What the automated tests cover

- `lib/template.ts`: parsing headings, paragraphs, bold, lists (markers,
  indentation, checkboxes), tables, and `*_link` placeholder segments; plus a
  real full template parsed without leaking HTML.
- `ChatPanel`: the greeting on mount, sending a message and showing the reply,
  reporting the document/fields result, and the error state on a failed request.
- `lib/chat.ts`: `sendChat`, `fetchTemplate`, and `fieldsToMap`.
- `TemplatePreview`: rendering template text and filling placeholders from fields.
- E2E: login redirect, the greeting + empty preview state, choosing a document
  (mocked `/api/chat` + `/api/templates`) and seeing the filled preview, and a
  real PDF download.

---

## Manual test checklist

Run `npm run dev` and open http://localhost:3000 (or the full app on :8000 via
the start script). Sign in with `demo` / `demo` first — the creator is gated
behind the login. These cover things the automated suite cannot assert (visual
fidelity, real PDF output, accessibility, and OS-level behaviour).

### Chat (needs the backend running with a valid `GROQ_API_KEY`)
- [ ] The assistant greets and asks which document on load.
- [ ] Ask for a supported document (e.g. "cloud service agreement"); it is
      selected and the full template renders on the right with underlined blanks.
- [ ] Ask for an unsupported document (e.g. "employment contract"); the assistant
      explains it can't and suggests the closest catalog document.
- [ ] As you answer, the blanks fill in; questions come most-important-first.
- [ ] Say "generate as-is"; the assistant stops asking and says it's ready.
- [ ] A backend/LLM failure shows the inline "Please try again" error.

### PDF output (open the downloaded file)
- [ ] Click **Download PDF**; a PDF named after the document opens.
- [ ] **Unfilled** placeholders show a **red underline** in the PDF (and are NOT
      red in the on-screen preview).
- [ ] Filled placeholder values appear (underlined), bold runs render bold, and
      headings/lists/tables are readable.
- [ ] Long answers wrap and content flows across pages without overflow.

### Error resilience
- [ ] Trigger a failure during generation (e.g. throttle/offline) and confirm
      the button returns to "Download PDF" instead of staying stuck on
      "Preparing PDF..." (covers the `try/finally` fix).
- [ ] Download twice in a row; the second download still works (object URL was
      revoked cleanly).

### Live preview
- [ ] As the chat fills fields, the preview updates with no blank flash or
      flicker (no `<PDFViewer>` reload).
- [ ] Repeated placeholders (e.g. "Customer" throughout) all fill from one answer.

### Accessibility / keyboard
- [ ] Tab to the message input and Send button in a logical order.
- [ ] The message input has an accessible name ("Message").
- [ ] Run a screen reader (NVDA/VoiceOver) and confirm the chat input and the
      conversation are announced sensibly.

### Layout / responsiveness
- [ ] At a narrow window width the two-pane layout remains usable.
- [ ] With the OS set to dark mode, the UI stays legible (fixed light theme; no
      stray dark seams now that the unused dark-mode CSS was removed).
