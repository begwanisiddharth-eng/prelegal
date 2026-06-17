import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const replace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}))

import SignupPage from './page'

describe('SignupPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    replace.mockClear()
    vi.restoreAllMocks()
  })

  it('shows an error when passwords do not match', async () => {
    render(<SignupPage />)
    await userEvent.type(screen.getByLabelText('Username'), 'u')
    await userEvent.type(screen.getByLabelText('Password'), 'a')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'b')
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/do not match/)
    expect(replace).not.toHaveBeenCalled()
  })

  it('signs up and redirects home', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ token: 't' }), { status: 200 })))
    render(<SignupPage />)
    await userEvent.type(screen.getByLabelText('Username'), 'u')
    await userEvent.type(screen.getByLabelText('Password'), 'pw')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'pw')
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'))
  })
})
