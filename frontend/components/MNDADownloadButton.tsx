'use client'

import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import MNDAPdfDocument from './MNDAPdfDocument'
import type { MNDAFormData } from '@/lib/mnda'

/** Generates the PDF on click only, so react-pdf never runs during editing. */
export default function MNDADownloadButton({ data }: { data: MNDAFormData }) {
  const [generating, setGenerating] = useState(false)

  async function handleDownload() {
    setGenerating(true)
    try {
      const blob = await pdf(<MNDAPdfDocument data={data} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'mutual-nda.pdf'
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
      className="self-end px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
    >
      {generating ? 'Preparing PDF...' : 'Download PDF'}
    </button>
  )
}
