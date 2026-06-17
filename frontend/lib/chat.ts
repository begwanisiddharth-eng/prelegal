import { API_BASE } from './api'
import type { MNDAFormData } from './mnda'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatResponse {
  reply: string
  fields: MNDAFormData
}

/** Send the conversation and current fields to the backend; get the reply and updated fields. */
export async function sendChat(
  messages: ChatMessage[],
  fields: MNDAFormData,
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, fields }),
  })
  if (!response.ok) throw new Error('Chat request failed')
  return response.json()
}
