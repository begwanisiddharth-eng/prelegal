'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/auth'
import { fetchTemplate, fieldsToMap } from '@/lib/chat'
import { listDocuments, type SavedDocument } from '@/lib/documents'
import { downloadPdf, pdfName } from '@/lib/pdf'

export default function SavedPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<SavedDocument[] | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    listDocuments().then(setDocuments).catch(() => setError(true))
  }, [])

  async function handleLogout() {
    await logout()
    router.replace('/login')
  }

  async function handleDownload(doc: SavedDocument) {
    setDownloadingId(doc.id)
    try {
      const template = await fetchTemplate(doc.document)
      await downloadPdf(template.markdown, fieldsToMap(doc.fields), pdfName(doc.document))
    } catch {
      setError(true)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold text-brand-navy">Saved Documents</h1>
        <div className="flex gap-2">
          <button onClick={() => router.push('/')} className="rounded border border-gray-300 px-4 py-2 text-sm text-brand-navy hover:bg-gray-100 transition-colors">
            Home
          </button>
          <button onClick={handleLogout} className="rounded border border-gray-300 px-4 py-2 text-sm text-brand-navy hover:bg-gray-100 transition-colors">
            Log out
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl">
          {error ? (
            <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
          ) : documents === null ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : documents.length === 0 ? (
            <p className="text-sm text-gray-500">You have no saved documents yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
              {documents.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-brand-navy">{doc.name}</p>
                    <p className="text-xs text-gray-500">Saved {new Date(doc.updated_at).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => handleDownload(doc)}
                    disabled={downloadingId === doc.id}
                    className="rounded bg-brand-purple px-4 py-2 text-sm text-white hover:bg-brand-purple/90 transition-colors disabled:opacity-50"
                  >
                    {downloadingId === doc.id ? 'Preparing PDF...' : 'Download'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
