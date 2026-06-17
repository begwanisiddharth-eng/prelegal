import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const replace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}))

import LoginPage from './page'

describe('LoginPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    replace.mockClear()
    vi.restoreAllMocks()
  })

  it('logs in and redirects home on success', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{"token":"t"}', { status: 200 })))
    render(<LoginPage />)
    await userEvent.type(screen.getByLabelText('Username'), 'demo')
    await userEvent.type(screen.getByLabelText('Password'), 'demo')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'))
  })

  it('shows an error and does not redirect on failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('no', { status: 401 })))
    render(<LoginPage />)
    await userEvent.type(screen.getByLabelText('Username'), 'demo')
    await userEvent.type(screen.getByLabelText('Password'), 'bad')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })
})
