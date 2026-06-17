'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { signup } from '@/lib/auth'

export default function SignupPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    setError('')
    const result = await signup(username, password)
    setSubmitting(false)
    if (result.ok) {
      router.replace('/')
    } else {
      setError(result.error ?? 'Sign-up failed.')
    }
  }

  return (
    <main className="flex min-h-full items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-lg font-semibold text-brand-navy">Create your Prelegal account</h1>

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
            autoComplete="new-password"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </label>

        <label className="mt-3 block text-sm text-gray-700">
          Confirm password
          <input
            type="password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            autoComplete="new-password"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </label>

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 w-full rounded bg-brand-purple px-4 py-2 text-sm text-white hover:bg-brand-purple/90 transition-colors disabled:bg-brand-purple/50"
        >
          {submitting ? 'Creating account...' : 'Sign up'}
        </button>

        <p className="mt-4 text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-blue hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  )
}
