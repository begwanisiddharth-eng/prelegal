@AGENTS.md

## Frontend overview

Next.js 16 (Turbopack), TypeScript, Tailwind CSS v4, `@react-pdf/renderer` v4.

Entry point: `app/page.tsx`. It holds the chosen document, its markdown, and the field values, and renders an AI chat (`ChatPanel.tsx`) on the left and the document preview on the right. The chat posts the conversation, current document, and fields to `POST /api/chat` (`lib/chat.ts`); the response carries the assistant reply, the chosen document, and the updated fields. When a document is selected, the page fetches its markdown from `GET /api/templates/{filename}` and renders it.

Any of the 11 catalog documents can be created. `lib/template.ts` parses a template's markdown into blocks/segments, turning every `<span class="*_link">Name</span>` placeholder into a fill-in blank. Both renderers share that parser: `TemplatePreview.tsx` (live HTML, gray underlined blanks) and `TemplatePdfDocument.tsx` (react-pdf; **unfilled** placeholders get a red underline — PDF only, never on screen).

The actual PDF is generated only when the user clicks Download (`DownloadButton.tsx`, via `pdf().toBlob()`), so `@react-pdf/renderer` never runs during editing. Do not reintroduce a live `<PDFViewer>` iframe for the preview — it reloads a new blob URL on every edit and flashes blank.

The app is gated behind a fake login. `app/login/page.tsx` posts to `POST /api/login` (helpers in `lib/auth.ts`) and sets a `localStorage` flag; `app/AuthGuard.tsx` (wired into `layout.tsx`) redirects to `/login` until that flag is set. The app is statically exported (`output: 'export'`) and served by FastAPI on :8000; in dev, set `NEXT_PUBLIC_API_BASE` to reach the backend across origins.

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
