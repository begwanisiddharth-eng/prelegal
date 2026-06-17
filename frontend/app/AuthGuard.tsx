'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { isLoggedIn, logout } from '@/lib/auth'

/** Gates every page behind the login flag, redirecting to /login when absent. */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  const onLoginPage = pathname?.startsWith('/login') ?? false

  useEffect(() => {
    if (onLoginPage || isLoggedIn()) {
      setReady(true)
    } else {
      router.replace('/login')
    }
  }, [onLoginPage, router])

  if (!ready) return null

  return (
    <>
      {!onLoginPage && (
        <button
          onClick={() => {
            logout()
            router.replace('/login')
          }}
          className="fixed bottom-4 right-4 z-50 rounded bg-gray-800 px-3 py-1.5 text-xs text-white shadow hover:bg-gray-700"
        >
          Log out
        </button>
      )}
      {children}
    </>
  )
}
