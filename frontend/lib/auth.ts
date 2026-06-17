/** Token-based auth helpers backed by the FastAPI session API. */

import { API_BASE, authHeaders, clearToken, getToken, setToken } from './api'

// Re-exported so callers can keep importing them from '@/lib/auth'.
export { authHeaders, getToken } from './api'

export function isLoggedIn(): boolean {
  return !!getToken()
}

// login/signup use plain fetch (not apiFetch): their 401/409 responses are
// expected and handled here, and must not trigger the global redirect.
export async function login(username: string, password: string): Promise<boolean> {
  const response = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!response.ok) return false
  setToken((await response.json()).token)
  return true
}

export interface SignupResult {
  ok: boolean
  error?: string
}

export async function signup(username: string, password: string): Promise<SignupResult> {
  const response = await fetch(`${API_BASE}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (response.ok) {
    setToken((await response.json()).token)
    return { ok: true }
  }
  if (response.status === 409) return { ok: false, error: 'That username is already taken.' }
  return { ok: false, error: 'Sign-up failed. Please try again.' }
}

/** Invalidate the session on the server (best-effort) and clear the local token. */
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/logout`, { method: 'POST', headers: authHeaders() })
  } catch {
    // Clear locally regardless of network result.
  }
  clearToken()
}
