/** Token-based auth helpers backed by the FastAPI session API. */

import { API_BASE } from './api'

const TOKEN_KEY = 'prelegal.token'

export function getToken(): string | null {
  return typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

/** Authorization header for authenticated API calls. */
export function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token)
}

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
  window.localStorage.removeItem(TOKEN_KEY)
}
