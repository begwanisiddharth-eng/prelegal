import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createDocument, listDocuments, updateDocument } from './documents'

describe('documents client', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.localStorage.setItem('prelegal.token', 'tok')
    vi.restoreAllMocks()
  })

  it('listDocuments sends the auth header', async () => {
    const fetchMock = vi.fn(async () => new Response('[]', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    await listDocuments()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/documents'),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer tok' }) }),
    )
  })

  it('createDocument posts name, document, and fields', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: 1 }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    await createDocument('N', 'Mutual-NDA.md', [{ name: 'A', value: '1' }])
    const options = fetchMock.mock.calls[0][1] as RequestInit
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body as string)).toEqual({
      name: 'N',
      document: 'Mutual-NDA.md',
      fields: [{ name: 'A', value: '1' }],
    })
  })

  it('updateDocument PUTs to the document id', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: 5 }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    await updateDocument(5, [])
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/documents/5'),
      expect.objectContaining({ method: 'PUT' }),
    )
  })
})
