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

  it('redirects to /login when not authenticated', async () => {
    render(
      <AuthGuard>
        <div>secret</div>
      </AuthGuard>,
    )
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'))
    expect(screen.queryByText('secret')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', async () => {
    window.localStorage.setItem('prelegal.loggedIn', 'true')
    render(
      <AuthGuard>
        <div>secret</div>
      </AuthGuard>,
    )
    expect(await screen.findByText('secret')).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it('renders the login page without redirecting', async () => {
    pathname = '/login'
    render(
      <AuthGuard>
        <div>login form</div>
      </AuthGuard>,
    )
    expect(await screen.findByText('login form')).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })
})
