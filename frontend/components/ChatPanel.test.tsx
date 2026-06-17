import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ChatPanel from './ChatPanel'
import { defaultFormData, type MNDAFormData } from '@/lib/mnda'

describe('ChatPanel', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('shows the assistant greeting on mount', () => {
    render(<ChatPanel data={defaultFormData} onChange={() => {}} />)
    expect(screen.getByText(/help you put together a Mutual NDA/)).toBeInTheDocument()
  })

  it('sends a message, shows the reply, and updates fields', async () => {
    const updated: MNDAFormData = { ...defaultFormData, governingLaw: 'Delaware' }
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ reply: 'Got it.', fields: updated }), { status: 200 })),
    )
    const onChange = vi.fn()
    render(<ChatPanel data={defaultFormData} onChange={onChange} />)

    await userEvent.type(screen.getByLabelText('Message'), 'Use Delaware law')
    await userEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByText('Got it.')).toBeInTheDocument()
    expect(screen.getByText('Use Delaware law')).toBeInTheDocument()
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(updated))
  })

  it('shows an error when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('no', { status: 500 })))
    render(<ChatPanel data={defaultFormData} onChange={() => {}} />)

    await userEvent.type(screen.getByLabelText('Message'), 'hello')
    await userEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})
