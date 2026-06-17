'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import ChatPanel from '@/components/ChatPanel'
import TemplatePreview from '@/components/TemplatePreview'
import { logout } from '@/lib/auth'
import { fetchTemplate, fieldsToMap, type FieldValue } from '@/lib/chat'

const DownloadButton = dynamic(() => import('@/components/DownloadButton'), { ssr: false })

function pdfName(document: string): string {
  return document.replace(/\.md$/, '').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase() + '.pdf'
}

export default function Page() {
  const router = useRouter()
  const [document, setDocument] = useState('')
  const [markdown, setMarkdown] = useState('')
  const [fields, setFields] = useState<FieldValue[]>([])

  const fieldsMap = useMemo(() => fieldsToMap(fields), [fields])

  async function handleResult(nextDocument: string, nextFields: FieldValue[]) {
    setFields(nextFields)
    if (nextDocument && nextDocument !== document) {
      setDocument(nextDocument)
      const template = await fetchTemplate(nextDocument)
      setMarkdown(template.markdown)
    }
  }

  function handleLogout() {
    logout()
    router.replace('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Chat panel */}
      <div className="w-2/5 flex flex-col bg-white border-r border-gray-200">
        <div className="border-b border-gray-100 px-6 py-4">
          <h1 className="text-lg font-semibold text-brand-navy">Prelegal Document Creator</h1>
          <p className="text-xs text-brand-gray mt-0.5">Chat with the assistant to choose and fill in your document</p>
        </div>
        <div className="flex-1 min-h-0">
          <ChatPanel document={document} fields={fields} onResult={handleResult} />
        </div>
      </div>

      {/* Preview panel */}
      <div className="w-3/5 flex flex-col min-w-0 bg-gray-50">
        <div className="flex justify-end items-center gap-2 border-b border-gray-200 bg-white px-3 py-2">
          {markdown && <DownloadButton markdown={markdown} fields={fieldsMap} filename={pdfName(document)} />}
          <button
            onClick={handleLogout}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-brand-navy hover:bg-gray-100 transition-colors"
          >
            Log out
          </button>
        </div>
        {markdown ? (
          <div className="flex-1 overflow-y-auto bg-gray-100 p-3">
            <TemplatePreview markdown={markdown} fields={fieldsMap} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
            Your document will appear here once you choose one.
          </div>
        )}
      </div>
    </div>
  )
}
