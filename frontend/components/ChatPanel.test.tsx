import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ChatPanel from './ChatPanel'

describe('ChatPanel', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('shows the assistant greeting on mount', () => {
    render(<ChatPanel document="" fields={[]} onResult={() => {}} />)
    expect(screen.getByText(/help you draft a legal document/)).toBeInTheDocument()
  })

  it('sends a message, shows the reply, and reports the result', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ reply: 'Got it.', document: 'Mutual-NDA.md', fields: [{ name: 'Purpose', value: 'X' }] }),
            { status: 200 },
          ),
      ),
    )
    const onResult = vi.fn()
    render(<ChatPanel document="" fields={[]} onResult={onResult} />)

    await userEvent.type(screen.getByLabelText('Message'), 'I need an NDA')
    await userEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByText('Got it.')).toBeInTheDocument()
    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith('Mutual-NDA.md', [{ name: 'Purpose', value: 'X' }]),
    )
  })

  it('shows an error when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('no', { status: 500 })))
    render(<ChatPanel document="" fields={[]} onResult={() => {}} />)

    await userEvent.type(screen.getByLabelText('Message'), 'hello')
    await userEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})
