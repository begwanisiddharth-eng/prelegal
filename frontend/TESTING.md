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

- `lib/mnda.ts`: term/suffix text, placeholder replacement, `parseSegments`,
  and the default effective date using the **local** calendar day (regression
  for the UTC off-by-one).
- `ChatPanel`: the greeting on mount, sending a message and showing the reply,
  field updates flowing to the preview, and the error state on a failed request.
- `lib/chat.ts`: posting to `/api/chat` and surfacing request failures.
- `MNDAHtmlPreview`: live values, the trade-secret carve-out toggling with the
  confidentiality term, placeholder substitution, and the signature table.
- `MNDADownloadButton`: PDF generation on click, the `mutual-nda.pdf` download
  wiring, idle-state reset after completion, and deferred object-URL revoke.
- E2E: full page render, a chat answer updating the preview, the carve-out
  toggle (both driven by a mocked `/api/chat`), and a real PDF download.

---

## Manual test checklist

Run `npm run dev` and open http://localhost:3000 (or the full app on :8000 via
the start script). Sign in with `demo` / `demo` first — the creator is gated
behind the login. These cover things the automated suite cannot assert (visual
fidelity, real PDF output, accessibility, and OS-level behaviour).

### Chat (needs the backend running with a valid `GROQ_API_KEY`)
- [ ] The assistant greeting appears on load; typing an answer and sending gets
      a relevant reply.
- [ ] Answers populate the right-hand preview (e.g. mention a purpose, governing
      law, or party names and watch the cover page update).
- [ ] A backend/LLM failure shows the inline "Please try again" error.

### PDF output (open the downloaded file)
- [ ] Click **Download PDF**; a `mutual-nda.pdf` opens.
- [ ] Cover Page shows Purpose, Effective Date, MNDA Term, Term of
      Confidentiality, Governing Law, Jurisdiction, and the signature table.
- [ ] The downloaded PDF visually matches the on-screen HTML preview.
- [ ] Bold runs (defined terms, section headings) render bold in the PDF.
- [ ] Page 2 "Standard Terms" has all 11 numbered clauses with placeholders
      filled in (no literal `coverpage_link` or `[Purpose]`-style brackets when
      fields are filled).
- [ ] Fill a very long Purpose and long notice addresses; text wraps and the
      table does not overflow the page.

### Error resilience
- [ ] Trigger a failure during generation (e.g. throttle/offline) and confirm
      the button returns to "Download PDF" instead of staying stuck on
      "Preparing PDF..." (covers the `try/finally` fix).
- [ ] Download twice in a row; the second download still works (object URL was
      revoked cleanly).

### Live preview
- [ ] As the chat fills fields, the right-hand preview updates with no blank
      flash or flicker (no `<PDFViewer>` reload).
- [ ] Tell the assistant the MNDA term "continues until terminated"; the cover
      page text updates accordingly.
- [ ] Tell the assistant confidentiality lasts "in perpetuity"; the trade-secret
      carve-out sentence disappears.

### Accessibility / keyboard
- [ ] Tab to the message input and Send button in a logical order.
- [ ] The message input has an accessible name ("Message").
- [ ] Run a screen reader (NVDA/VoiceOver) and confirm the chat input and the
      conversation are announced sensibly.

### Layout / responsiveness
- [ ] At a narrow window width the two-pane layout remains usable.
- [ ] With the OS set to dark mode, the UI stays legible (fixed light theme; no
      stray dark seams now that the unused dark-mode CSS was removed).
