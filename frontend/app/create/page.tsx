'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import ChatPanel from '@/components/ChatPanel'
import { ConfirmDialog, NoticeDialog, PromptDialog } from '@/components/Dialog'
import TemplatePreview from '@/components/TemplatePreview'
import { logout } from '@/lib/auth'
import { fetchTemplate, fieldsToMap, type FieldValue } from '@/lib/chat'
import { createDocument, updateDocument } from '@/lib/documents'
import { downloadPdf, pdfName } from '@/lib/pdf'

type DialogState = 'save' | 'home' | 'logout' | 'pdf' | null

const primary = 'rounded bg-brand-purple px-4 py-2 text-sm text-white hover:bg-brand-purple/90 transition-colors disabled:opacity-50'
const accent = 'rounded bg-brand-blue px-4 py-2 text-sm text-white hover:bg-brand-blue/90 transition-colors'
const secondary = 'rounded border border-gray-300 px-4 py-2 text-sm text-brand-navy hover:bg-gray-100 transition-colors'

export default function CreatePage() {
  const router = useRouter()
  const [document, setDocument] = useState('')
  const [markdown, setMarkdown] = useState('')
  const [fields, setFields] = useState<FieldValue[]>([])
  const [savedId, setSavedId] = useState<number | null>(null)
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null)
  const [dialog, setDialog] = useState<DialogState>(null)
  const [generating, setGenerating] = useState(false)

  const fieldsMap = useMemo(() => fieldsToMap(fields), [fields])
  const dirty = !!document && savedSnapshot !== JSON.stringify(fields)

  async function handleResult(nextDocument: string, nextFields: FieldValue[]) {
    setFields(nextFields)
    if (nextDocument && nextDocument !== document) {
      setDocument(nextDocument)
      const template = await fetchTemplate(nextDocument)
      setMarkdown(template.markdown)
    }
  }

  async function persist(name?: string) {
    if (savedId === null) {
      const doc = await createDocument(name ?? document, document, fields)
      setSavedId(doc.id)
    } else {
      await updateDocument(savedId, fields)
    }
    setSavedSnapshot(JSON.stringify(fields))
  }

  function handleSave() {
    if (savedId === null) setDialog('save')
    else persist()
  }

  async function doDownload() {
    setGenerating(true)
    try {
      await downloadPdf(markdown, fieldsMap, pdfName(document))
    } finally {
      setGenerating(false)
    }
  }

  function goHome() {
    router.push('/')
  }

  async function doLogout() {
    await logout()
    router.replace('/login')
  }

  function handleGenerate() {
    if (dirty) setDialog('pdf')
    else doDownload()
  }

  function handleHome() {
    if (dirty) setDialog('home')
    else goHome()
  }

  function handleLogout() {
    if (dirty) setDialog('logout')
    else doLogout()
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
          {document && <button onClick={handleSave} className={accent}>Save</button>}
          {document && (
            <button onClick={handleGenerate} disabled={generating} className={primary}>
              {generating ? 'Preparing PDF...' : 'Generate PDF'}
            </button>
          )}
          <button onClick={handleHome} className={secondary}>Home</button>
          <button onClick={handleLogout} className={secondary}>Log out</button>
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

      {dialog === 'save' && (
        <PromptDialog
          title="Save document"
          label="Name this document"
          onSubmit={(name) => {
            setDialog(null)
            persist(name)
          }}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog === 'pdf' && (
        <NoticeDialog
          title="Unsaved changes"
          message="You have unsaved changes — we recommend saving before exiting. Your PDF will download now."
          onOk={() => {
            setDialog(null)
            doDownload()
          }}
        />
      )}
      {dialog === 'home' && (
        <ConfirmDialog
          title="Unsaved changes"
          message="You have unsaved changes that will be lost. Continue to Home?"
          confirmLabel="Continue"
          onConfirm={() => {
            setDialog(null)
            goHome()
          }}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog === 'logout' && (
        <ConfirmDialog
          title="Unsaved changes"
          message="You have unsaved changes that will be lost. Log out anyway?"
          confirmLabel="Log out"
          onConfirm={() => {
            setDialog(null)
            doLogout()
          }}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>
  )
}
