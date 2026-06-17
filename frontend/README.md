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
  page.tsx                Home (Start New Conversation / Download Saved Documents)
  login/page.tsx          login screen (+ link to sign up)
  signup/page.tsx         account creation (auto-login on success)
  create/page.tsx         document creator: chat + preview, save / generate / nav
  saved/page.tsx          list and download the user's saved documents
  AuthGuard.tsx           gates pages behind a token (allows /login and /signup)
components/
  ChatPanel.tsx           left-hand AI chat (posts to /api/chat)
  TemplatePreview.tsx     live HTML preview of the chosen template
  TemplatePdfDocument.tsx react-pdf document (red underline for unfilled blanks)
  Dialog.tsx              custom Confirm / Notice / Prompt dialogs
lib/
  template.ts             markdown -> blocks/segments parser (shared by preview + PDF)
  chat.ts                 chat + template client
  documents.ts            saved-documents client
  auth.ts                 token-based login/signup/logout helpers
  pdf.tsx                 lazy PDF generation + download
  api.ts                  shared API base URL
```

## Key behaviour notes

- The preview is a live HTML rendering that updates as the chat fills fields.
- The PDF is generated only on demand (Save/Generate/Download), so react-pdf never runs during editing — avoiding the iframe-reload flicker an embedded live PDF viewer causes.
- Auth is token-based (stored in `localStorage`, sent as `Authorization: Bearer`). Saved documents are per-user; conversations are not persisted.
- Unsaved-changes warnings (Home, Log Out) and the Generate-PDF notice are custom dialogs, never the browser's.
