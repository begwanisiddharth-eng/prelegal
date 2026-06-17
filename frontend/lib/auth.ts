/** Client-side login helpers. A lightweight stand-in until real sessions exist. */

import { API_BASE } from './api'

const FLAG_KEY = 'prelegal.loggedIn'

export function isLoggedIn(): boolean {
  return typeof window !== 'undefined' && window.localStorage.getItem(FLAG_KEY) === 'true'
}

export function logout(): void {
  window.localStorage.removeItem(FLAG_KEY)
}

/** Verify credentials against the backend and record the logged-in flag. */
export async function login(username: string, password: string): Promise<boolean> {
  const response = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!response.ok) return false
  window.localStorage.setItem(FLAG_KEY, 'true')
  return true
}
