// Empty in production (same origin as the backend); set to the backend URL in
// dev, where the Next.js server and FastAPI run on different ports.
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ''

const TOKEN_KEY = 'prelegal.token'

export function getToken(): string | null {
  return typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  if (typeof window !== 'undefined') window.localStorage.removeItem(TOKEN_KEY)
}

export function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * Fetch an authenticated API endpoint. Adds the bearer token, and on a 401
 * clears the token and redirects to /login (the token is invalid or expired).
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers ?? {}) },
  })
  if (response.status === 401) {
    clearToken()
    if (typeof window !== 'undefined') window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  return response
}
