@AGENTS.md

## Frontend overview

Next.js 16 (Turbopack), TypeScript, Tailwind CSS v4, `@react-pdf/renderer` v4.

Entry point: `app/page.tsx`. It holds the document state (`formData`) and renders an AI chat (`ChatPanel.tsx`) on the left and the preview on the right. The chat replaced the old manual form: it posts the conversation and current fields to the backend `POST /api/chat` (`lib/chat.ts`), which returns the assistant reply plus the updated fields that drive the preview.

The right-hand preview is a live **HTML** rendering (`MNDAHtmlPreview.tsx`) that updates instantly on every keystroke. The actual PDF is generated only when the user clicks Download (`MNDADownloadButton.tsx`, via `pdf().toBlob()`), so `@react-pdf/renderer` never runs during editing. Do not reintroduce a live `<PDFViewer>` iframe for the preview — it reloads a new blob URL on every edit and flashes blank.

All components are in `components/`. Shared types and template logic are in `lib/mnda.ts`.

The app is gated behind a fake login. `app/login/page.tsx` posts to the backend `POST /api/login` (helpers in `lib/auth.ts`) and sets a `localStorage` flag; `app/AuthGuard.tsx` (wired into `layout.tsx`) redirects to `/login` until that flag is set. The MNDA Creator itself is unchanged. The app is statically exported (`output: 'export'`) and served by FastAPI on :8000; in dev, set `NEXT_PUBLIC_API_BASE` to reach the backend across origins.

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
