'use client'

import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import TemplatePdfDocument from './TemplatePdfDocument'

/** Generates the PDF on click only, so react-pdf never runs during editing. */
export default function DownloadButton({
  markdown,
  fields,
  filename,
}: {
  markdown: string
  fields: Record<string, string>
  filename: string
}) {
  const [generating, setGenerating] = useState(false)

  async function handleDownload() {
    setGenerating(true)
    try {
      const blob = await pdf(<TemplatePdfDocument markdown={markdown} fields={fields} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 0)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      className="px-4 py-2 bg-brand-purple text-white text-sm rounded hover:bg-brand-purple/90 transition-colors disabled:opacity-50"
    >
      {generating ? 'Preparing PDF...' : 'Download PDF'}
    </button>
  )
}
