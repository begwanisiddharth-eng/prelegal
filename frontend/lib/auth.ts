/** Client-side login helpers. A lightweight stand-in until real sessions exist. */

const FLAG_KEY = 'prelegal.loggedIn'

// Empty in production (same origin as the backend); set to the backend URL in
// dev, where the Next.js server and FastAPI run on different ports.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ''

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
