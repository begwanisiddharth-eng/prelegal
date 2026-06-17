import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const replace = vi.fn()
let pathname = '/'
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => pathname,
}))

import AuthGuard from './AuthGuard'

describe('AuthGuard', () => {
  beforeEach(() => {
    window.localStorage.clear()
    replace.mockClear()
    pathname = '/'
  })

  it('redirects to /login when there is no token', async () => {
    render(
      <AuthGuard>
        <div>secret</div>
      </AuthGuard>,
    )
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'))
    expect(screen.queryByText('secret')).not.toBeInTheDocument()
  })

  it('renders children when a token is present', async () => {
    window.localStorage.setItem('prelegal.token', 't')
    render(
      <AuthGuard>
        <div>secret</div>
      </AuthGuard>,
    )
    expect(await screen.findByText('secret')).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it('allows the signup page without a token', async () => {
    pathname = '/signup'
    render(
      <AuthGuard>
        <div>signup</div>
      </AuthGuard>,
    )
    expect(await screen.findByText('signup')).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })
})
