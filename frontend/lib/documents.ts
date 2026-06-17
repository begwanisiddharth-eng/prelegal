import { API_BASE } from './api'
import { authHeaders } from './auth'
import type { FieldValue } from './chat'

export interface SavedDocument {
  id: number
  name: string
  document: string
  fields: FieldValue[]
  updated_at: string
}

export async function listDocuments(): Promise<SavedDocument[]> {
  const response = await fetch(`${API_BASE}/api/documents`, { headers: authHeaders() })
  if (!response.ok) throw new Error('Failed to load documents')
  return response.json()
}

export async function createDocument(
  name: string,
  document: string,
  fields: FieldValue[],
): Promise<SavedDocument> {
  const response = await fetch(`${API_BASE}/api/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name, document, fields }),
  })
  if (!response.ok) throw new Error('Failed to save document')
  return response.json()
}

export async function updateDocument(id: number, fields: FieldValue[]): Promise<SavedDocument> {
  const response = await fetch(`${API_BASE}/api/documents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ fields }),
  })
  if (!response.ok) throw new Error('Failed to update document')
  return response.json()
}
