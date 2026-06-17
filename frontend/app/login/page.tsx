'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { login } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(false)
    const ok = await login(username, password)
    setSubmitting(false)
    if (ok) {
      router.replace('/')
    } else {
      setError(true)
    }
  }

  return (
    <main className="flex min-h-full items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-lg font-semibold text-brand-navy">Sign in to Prelegal</h1>
        <p className="mt-0.5 text-xs text-brand-gray">Use demo / demo for now.</p>

        <label className="mt-4 block text-sm text-gray-700">
          Username
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </label>

        <label className="mt-3 block text-sm text-gray-700">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </label>

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            Invalid username or password.
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 w-full rounded bg-brand-purple px-4 py-2 text-sm text-white hover:bg-brand-purple/90 transition-colors disabled:bg-brand-purple/50"
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
