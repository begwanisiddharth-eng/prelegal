# prelegal — frontend

Next.js 16 app (TypeScript, Tailwind CSS, `@react-pdf/renderer`).

## Running

From the **project root**:

```powershell
.\scripts\start-dev.ps1   # http://localhost:3000
.\scripts\stop-dev.ps1
```

Or directly from this directory:

```bash
npm run dev
```

## Structure

```
app/
  page.tsx                main page — layout and form state
components/
  MNDAForm.tsx            left-hand form panel
  MNDAHtmlPreview.tsx     live HTML preview (right panel)
  MNDADownloadButton.tsx  generates the PDF on click
  MNDAPdfDocument.tsx     react-pdf document definition (used for download)
lib/
  mnda.ts                 form data types, defaults, template logic
```

## Key behaviour notes

- The right-hand preview is a live HTML rendering that updates instantly on every keystroke.
- The actual PDF is generated only when the user clicks Download, so react-pdf never runs during editing.
- This avoids the iframe-reload flicker that an embedded live PDF viewer causes (a new blob URL on every edit forces the iframe to reload and flash blank).
