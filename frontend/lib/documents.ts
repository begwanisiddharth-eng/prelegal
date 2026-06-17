import { apiFetch } from './api'
import type { FieldValue } from './chat'

export interface SavedDocument {
  id: number
  name: string
  document: string
  fields: FieldValue[]
  updated_at: string
}

export async function listDocuments(): Promise<SavedDocument[]> {
  const response = await apiFetch('/api/documents')
  if (!response.ok) throw new Error('Failed to load documents')
  return response.json()
}

export async function createDocument(
  name: string,
  document: string,
  fields: FieldValue[],
): Promise<SavedDocument> {
  const response = await apiFetch('/api/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, document, fields }),
  })
  if (!response.ok) throw new Error('Failed to save document')
  return response.json()
}

export async function updateDocument(id: number, fields: FieldValue[]): Promise<SavedDocument> {
  const response = await apiFetch(`/api/documents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  })
  if (!response.ok) throw new Error('Failed to update document')
  return response.json()
}
