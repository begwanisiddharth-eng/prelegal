import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sendChat } from './chat'
import { defaultFormData } from './mnda'

describe('sendChat', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('posts to /api/chat and returns the parsed response', async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ reply: 'ok', fields: defaultFormData }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await sendChat([{ role: 'user', content: 'hi' }], defaultFormData)

    expect(result.reply).toBe('ok')
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/chat'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('throws when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('no', { status: 500 })))
    await expect(sendChat([], defaultFormData)).rejects.toThrow()
  })
})
