'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { isLoggedIn } from '@/lib/auth'

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

  return <>{children}</>
}
