# prelegal — frontend

Next.js 16 app (TypeScript, Tailwind CSS, `@react-pdf/renderer`).

## Running

For the full app (frontend built and served by the backend on :8000), use the
project-root start script for your platform, e.g. `.\scripts\start-windows.ps1`.

For frontend-only development on :3000:

```bash
npm run dev
```

In dev, point the frontend at the backend by setting `NEXT_PUBLIC_API_BASE`
(e.g. `http://localhost:8000`); in production it is same-origin and unset. The
app is statically exported (`output: 'export'`) for the backend to serve.

## Structure

```
app/
  page.tsx                layout; chosen document, markdown, and field state
  login/page.tsx          login screen (posts to /api/login)
  AuthGuard.tsx           gates pages behind the login flag
components/
  ChatPanel.tsx           left-hand AI chat (posts to /api/chat)
  TemplatePreview.tsx     live HTML preview of the chosen template (right panel)
  TemplatePdfDocument.tsx react-pdf document (red underline for unfilled blanks)
  DownloadButton.tsx      generates the PDF on click
lib/
  template.ts             markdown -> blocks/segments parser (shared by preview + PDF)
  chat.ts                 chat + template client
  auth.ts                 login/logout helpers
  api.ts                  shared API base URL
```

## Key behaviour notes

- The right-hand preview is a live HTML rendering that updates instantly on every keystroke.
- The actual PDF is generated only when the user clicks Download, so react-pdf never runs during editing.
- This avoids the iframe-reload flicker that an embedded live PDF viewer causes (a new blob URL on every edit forces the iframe to reload and flash blank).
