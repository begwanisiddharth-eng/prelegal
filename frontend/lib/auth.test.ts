import { beforeEach, describe, expect, it, vi } from 'vitest'
import { isLoggedIn, login, logout } from './auth'

describe('auth', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('reports logged out by default', () => {
    expect(isLoggedIn()).toBe(false)
  })

  it('sets the flag on a successful login', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{"ok":true}', { status: 200 })))
    expect(await login('demo', 'demo')).toBe(true)
    expect(isLoggedIn()).toBe(true)
  })

  it('does not set the flag when login fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('no', { status: 401 })))
    expect(await login('demo', 'bad')).toBe(false)
    expect(isLoggedIn()).toBe(false)
  })

  it('logout clears the flag', () => {
    window.localStorage.setItem('prelegal.loggedIn', 'true')
    logout()
    expect(isLoggedIn()).toBe(false)
  })
})
