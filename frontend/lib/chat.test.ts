import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchTemplate, fieldsToMap, sendChat } from './chat'

describe('chat client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('sendChat posts to /api/chat and returns the parsed response', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ reply: 'ok', document: 'Mutual-NDA.md', fields: [] }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await sendChat([{ role: 'user', content: 'hi' }], '', [])

    expect(result.document).toBe('Mutual-NDA.md')
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/chat'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('sendChat throws when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('no', { status: 500 })))
    await expect(sendChat([], '', [])).rejects.toThrow()
  })

  it('fetchTemplate returns markdown and placeholders', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ filename: 'x.md', markdown: '# X', placeholders: ['A'] }), { status: 200 })),
    )
    const template = await fetchTemplate('x.md')
    expect(template.markdown).toBe('# X')
    expect(template.placeholders).toEqual(['A'])
  })

  it('fieldsToMap converts a field list to a map', () => {
    expect(fieldsToMap([{ name: 'A', value: '1' }, { name: 'B', value: '2' }])).toEqual({ A: '1', B: '2' })
  })
})
