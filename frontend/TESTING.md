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
- `MNDAForm`: label/input association (`getByLabelText` resolves), radio groups
  sharing a `name`, disabling the years input, and per-party state isolation.
- `MNDAHtmlPreview`: live values, the trade-secret carve-out toggling with the
  confidentiality term, placeholder substitution, and the signature table.
- `MNDADownloadButton`: PDF generation on click, the `mutual-nda.pdf` download
  wiring, idle-state reset after completion, and deferred object-URL revoke.
- E2E: full page render, live preview updates while typing, carve-out toggle,
  radio-group behaviour, and a real PDF download.

---

## Manual test checklist

Run `npm run dev` and open http://localhost:3000. These cover things the
automated suite cannot assert (visual fidelity, real PDF output, accessibility,
and OS-level behaviour).

### PDF output (open the downloaded file)
- [ ] Click **Download PDF** with the default form; a `mutual-nda.pdf` opens.
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
- [ ] Typing in any field updates the right-hand preview instantly with no
      blank flash or flicker (no `<PDFViewer>` reload).
- [ ] Switch MNDA Term to "Continues until terminated"; the years input
      disables and the cover page text updates.
- [ ] Switch Term of Confidentiality to "In perpetuity"; the trade-secret
      carve-out sentence disappears.

### Accessibility / keyboard
- [ ] Click a field's label text; focus moves to that field (label association).
- [ ] Tab through the whole form in a logical order.
- [ ] In each radio group, focus one radio and use Up/Down arrow keys to move
      between options (verifies the shared `name`).
- [ ] Run a screen reader (NVDA/VoiceOver) and confirm each input announces its
      label and each radio announces its group.

### Layout / responsiveness
- [ ] At a narrow window width the two-pane layout remains usable.
- [ ] With the OS set to dark mode, the UI stays legible (fixed light theme; no
      stray dark seams now that the unused dark-mode CSS was removed).
