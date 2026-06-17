import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authHeaders, getToken, isLoggedIn, login, logout, signup } from './auth'

describe('auth', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('reports logged out by default', () => {
    expect(isLoggedIn()).toBe(false)
  })

  it('login stores the token and builds auth headers', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ token: 't1' }), { status: 200 })))
    expect(await login('demo', 'demo')).toBe(true)
    expect(getToken()).toBe('t1')
    expect(isLoggedIn()).toBe(true)
    expect(authHeaders()).toEqual({ Authorization: 'Bearer t1' })
  })

  it('login returns false on bad credentials', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('no', { status: 401 })))
    expect(await login('demo', 'x')).toBe(false)
    expect(isLoggedIn()).toBe(false)
  })

  it('signup stores the token on success', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ token: 't2' }), { status: 200 })))
    const result = await signup('newbie', 'pw')
    expect(result.ok).toBe(true)
    expect(getToken()).toBe('t2')
  })

  it('signup reports a duplicate username', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('dup', { status: 409 })))
    const result = await signup('demo', 'pw')
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/taken/)
  })

  it('logout clears the token', async () => {
    window.localStorage.setItem('prelegal.token', 't')
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 200 })))
    await logout()
    expect(getToken()).toBeNull()
  })
})
