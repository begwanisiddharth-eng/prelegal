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
- `lib/auth.ts`: token storage on login/signup, auth headers, duplicate-username
  handling, and logout clearing the token.
- `lib/documents.ts`: list/create/update sending the auth header and right verbs.
- `lib/chat.ts`: `sendChat`, `fetchTemplate`, and `fieldsToMap`.
- `ChatPanel`, `TemplatePreview`, `Dialog` (Confirm/Notice/Prompt), and the
  login/signup/AuthGuard behaviours.
- E2E: login redirect, Home options, creator filling the preview, the Save name
  dialog, the Generate-PDF unsaved-changes notice + download, and the saved-docs
  list + download (backend mocked via route interception).

---

## Manual test checklist

Run `npm run dev` and open http://localhost:3000 (or the full app on :8000 via
the start script). Create an account via the sign-up link, then sign in. These
cover things the automated suite cannot assert (visual
fidelity, real PDF output, accessibility, and OS-level behaviour).

### Accounts & navigation
- [ ] Sign up creates an account and lands on Home; a duplicate username is rejected.
- [ ] Home shows Start New Conversation and Download Saved Documents, plus Log Out.
- [ ] Save and Generate PDF appear only after a document type is selected.
- [ ] Save prompts for a name (custom dialog); re-saving updates the same entry.
- [ ] Home / Log Out with unsaved changes show a custom warning (continue/cancel);
      with nothing unsaved they navigate directly.
- [ ] Generate PDF with unsaved changes shows a one-button notice, then downloads.
- [ ] Saved Documents lists your saved docs with Download, plus Home and Log Out;
      another user does not see your documents.

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
- [ ] Click **Generate PDF** (creator) or **Download** (saved docs); a PDF named after the document opens.
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
