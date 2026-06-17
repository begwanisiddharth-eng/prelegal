# Code Review — prelegal frontend (MNDA Creator)

**Scope:** `frontend/` Next.js app (PL-3 Mutual NDA Creator). Originally reviewed at commit `4566ee9`. All actionable findings below have been **resolved** and verified with `npm run build` (compiles, TypeScript clean).

**Overall:** Clean, well-structured prototype. State lives in one place (`app/page.tsx`), template logic is centralized in `lib/mnda.ts`, and the HTML-preview / generate-on-download split correctly follows the guidance in `frontend/CLAUDE.md` (no live `<PDFViewer>`).

---

## Findings (all resolved)

### 1. Default effective date could be off by one day (UTC vs. local) — Fixed

`lib/mnda.ts`

`new Date().toISOString().split('T')[0]` returns the **UTC** date, which can differ from the user's local calendar day. Replaced with `new Date().toLocaleDateString('en-CA')` (local `YYYY-MM-DD`).

### 2. Trade-secret suffix logic was duplicated across two components — Fixed

`lib/mnda.ts`, `components/MNDAHtmlPreview.tsx`, `components/MNDAPdfDocument.tsx`

The trade-secret carve-out string was hard-coded verbatim in both renderers. Extracted into a single helper `getConfidentialityTermSuffix(data)` in `lib/mnda.ts`; both the HTML preview and the PDF now call it, so they can no longer drift.

### 3. Download button could get stuck on failure; object URL revoked too early — Fixed

`components/MNDADownloadButton.tsx`

Wrapped the generation in `try { ... } finally { setGenerating(false) }` so the button always recovers if `toBlob()` rejects, and deferred `URL.revokeObjectURL` via `setTimeout(..., 0)` so the download commits before the blob URL is released.

### 4. Clearing the term-years field produced malformed text — Fixed

`lib/mnda.ts`

`getMndaTermText` / `getConfidentialityTermText` now fall back to `'1'` when the years field is empty, avoiding output like `" year(s) from Effective Date"`.

### 5. Radio groups lacked a shared `name` — Fixed (a11y)

`components/MNDAForm.tsx`

Added `name="mndaTermType"` and `name="confidentialityTermType"` to each radio pair so they form proper radio groups (arrow-key navigation, assistive-tech grouping).

### 6. Form labels were not associated with their inputs — Fixed (a11y)

`components/MNDAForm.tsx`

`Input` and `Textarea` now own their `<label>` and link it to the control via a `useId()`-generated `id` / `htmlFor`. Clicking a label focuses its field and screen readers announce the association.

### 7. Empty-value fallback was inconsistent in the PDF — Fixed

`components/MNDAPdfDocument.tsx`

`purpose` and `effectiveDate` now use the same `|| ' '` fallback as the other fields, so empty values render consistent underlines.

### 8. Unused dark-mode CSS variables — Fixed

`app/globals.css`

Removed the leftover `@media (prefers-color-scheme: dark)` block (boilerplate from `create-next-app`); the UI uses fixed light colors, so the unused variable flip could only cause seams.

---

## Minor / cosmetic (left as-is by design)

- `parseSegments` (`lib/mnda.ts`) applies placeholder replacement before bold parsing, so user-entered `**` would be interpreted as bold markers. Extremely unlikely in practice.
- Index-based React keys in the clause/segment maps are acceptable because the lists are static.
- The confidentiality "fixed" radio row omits a leading prefix word while the MNDA-term row uses "Expires after" — minor visual asymmetry.

---

## Notes / non-issues

- HTML-preview-only editing with generate-on-download is correctly implemented per `frontend/CLAUDE.md`; `@react-pdf/renderer` is dynamically imported with `ssr: false` (`app/page.tsx`) and only runs on click.
- `next.config.ts` Turbopack setup matches the Next.js 16 expectations in `frontend/AGENTS.md`.
- Build/typecheck/lint findings are out of scope; CI covers those.
