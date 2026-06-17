'use client'

import { useEffect, useRef, useState } from 'react'
import { sendChat, type ChatMessage, type FieldValue } from '@/lib/chat'

const GREETING = "Hi! I can help you draft a legal document. What kind of document do you need?"

export default function ChatPanel({
  document,
  fields,
  onResult,
}: {
  document: string
  fields: FieldValue[]
  onResult: (document: string, fields: FieldValue[]) => void | Promise<void>
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: GREETING },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Keep the conversation pinned to the latest message.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, busy])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const text = input.trim()
    if (!text || busy) return

    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setBusy(true)
    setError(false)
    try {
      const result = await sendChat(next, document, fields)
      setMessages([...next, { role: 'assistant', content: result.reply }])
      await onResult(result.document, result.fields)
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.map((message, index) => (
          <div key={index} className={message.role === 'user' ? 'text-right' : 'text-left'}>
            <span
              className={
                'inline-block rounded-lg px-3 py-2 text-sm ' +
                (message.role === 'user' ? 'bg-brand-blue text-white' : 'bg-gray-100 text-brand-navy')
              }
            >
              {message.content}
            </span>
          </div>
        ))}
        {busy && <p className="text-xs text-gray-400">Thinking...</p>}
        {error && (
          <p role="alert" className="text-sm text-red-600">
            Something went wrong. Please try again.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-gray-100 p-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type your answer..."
          aria-label="Message"
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-brand-purple px-4 py-2 text-sm text-white hover:bg-brand-purple/90 transition-colors disabled:bg-brand-purple/50"
        >
          Send
        </button>
      </form>
    </div>
  )
}
