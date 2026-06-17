@AGENTS.md

## Frontend overview

Next.js 16 (Turbopack), TypeScript, Tailwind CSS v4, `@react-pdf/renderer` v4.

Entry point: `app/page.tsx`. It holds the form state (`formData`) and renders the form on the left and the preview on the right.

The right-hand preview is a live **HTML** rendering (`MNDAHtmlPreview.tsx`) that updates instantly on every keystroke. The actual PDF is generated only when the user clicks Download (`MNDADownloadButton.tsx`, via `pdf().toBlob()`), so `@react-pdf/renderer` never runs during editing. Do not reintroduce a live `<PDFViewer>` iframe for the preview — it reloads a new blob URL on every edit and flashes blank.

All components are in `components/`. Shared types and template logic are in `lib/mnda.ts`.

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
