@AGENTS.md

## Frontend overview

Next.js 16 (Turbopack), TypeScript, Tailwind CSS v4, `@react-pdf/renderer` v4.

Screens (each an app-router route): `/login` and `/signup` (public); Home `/` (Start New Conversation / Download Saved Documents); the document creator `/create`; and `/saved`. `app/AuthGuard.tsx` (wired into `layout.tsx`) lets `/login` and `/signup` through and redirects everything else to `/login` unless a token is present.

The creator (`app/create/page.tsx`) holds the chosen document, its markdown, and the field values, and renders an AI chat (`ChatPanel.tsx`) on the left and the document preview on the right. The chat posts to `POST /api/chat` (`lib/chat.ts`); on a document selection the page fetches its markdown from `GET /api/templates/{filename}`. Any of the 11 catalog documents can be created. `lib/template.ts` parses a template's markdown into blocks/segments, turning every `<span class="*_link">Name</span>` placeholder into a fill-in blank. Both renderers share that parser: `TemplatePreview.tsx` (live HTML, gray underlined blanks) and `TemplatePdfDocument.tsx` (react-pdf; **unfilled** placeholders get a red underline — PDF only, never on screen).

The PDF is generated only on demand via `lib/pdf.tsx` (`downloadPdf`, which lazily imports `@react-pdf/renderer`), so it never runs during editing. Do not reintroduce a live `<PDFViewer>` iframe for the preview — it reloads a new blob URL on every edit and flashes blank.

Auth is token-based: `lib/auth.ts` stores the session token in `localStorage` and sends it as `Authorization: Bearer`; `lib/documents.ts` is the saved-documents client. Save and Generate PDF appear only once a document is chosen. The first Save prompts for a name (custom dialog) and creates the saved document; later saves update it. Unsaved-changes warnings gate Home and Log Out, and Generate PDF shows a one-button notice when there are unsaved changes — all via the custom dialogs in `components/Dialog.tsx` (never the browser's). The app is statically exported (`output: 'export'`) and served by FastAPI on :8000; in dev, set `NEXT_PUBLIC_API_BASE` to reach the backend across origins.

## Commands (run from this directory)

```bash
npm run dev        # dev server on localhost:3000
npm run build      # production build
npm run start      # serve production build
npm test           # Vitest unit + component tests (once)
npm run test:watch # Vitest in watch mode
npm run test:e2e   # Playwright E2E (auto-starts the dev server)
```

## Testing

Unit/component tests use Vitest + Testing Library and live next to their
subjects (`lib/*.test.ts`, `components/*.test.tsx`). End-to-end tests use
Playwright in `e2e/`. The manual test checklist and a fuller description are in
`TESTING.md`. First Playwright run: `npx playwright install chromium`.
