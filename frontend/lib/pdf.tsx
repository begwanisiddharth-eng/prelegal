'use client'

/** Generate and download a template's PDF. react-pdf is imported lazily so it
 * stays out of the initial bundle and the build prerender. */
export async function downloadPdf(
  markdown: string,
  fields: Record<string, string>,
  filename: string,
): Promise<void> {
  const { pdf } = await import('@react-pdf/renderer')
  const { default: TemplatePdfDocument } = await import('@/components/TemplatePdfDocument')
  const blob = await pdf(<TemplatePdfDocument markdown={markdown} fields={fields} />).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/** Filename for a document's PDF, e.g. "Mutual-NDA.md" -> "mutual-nda.pdf". */
export function pdfName(documentFilename: string): string {
  return documentFilename.replace(/\.md$/, '').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase() + '.pdf'
}
