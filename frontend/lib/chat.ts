import { apiFetch } from './api'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface FieldValue {
  name: string
  value: string
}

export interface ChatResponse {
  reply: string
  document: string
  fields: FieldValue[]
}

/** Send the conversation, chosen document, and current fields; get the model's response. */
export async function sendChat(
  messages: ChatMessage[],
  document: string,
  fields: FieldValue[],
): Promise<ChatResponse> {
  const response = await apiFetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, document, fields }),
  })
  if (!response.ok) throw new Error('Chat request failed')
  return response.json()
}

export interface Template {
  filename: string
  markdown: string
  placeholders: string[]
}

/** Fetch a template's markdown and parsed placeholder list by filename. */
export async function fetchTemplate(filename: string): Promise<Template> {
  const response = await apiFetch(`/api/templates/${encodeURIComponent(filename)}`)
  if (!response.ok) throw new Error('Template fetch failed')
  return response.json()
}

/** Convert the field list into a name -> value map for rendering. */
export function fieldsToMap(fields: FieldValue[]): Record<string, string> {
  return Object.fromEntries(fields.map((field) => [field.name, field.value]))
}
