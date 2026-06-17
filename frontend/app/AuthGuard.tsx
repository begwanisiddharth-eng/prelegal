'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { isLoggedIn } from '@/lib/auth'

/** Gates every page behind the login flag, redirecting to /login when absent. */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  const isPublic = pathname?.startsWith('/login') || pathname?.startsWith('/signup') || false

  useEffect(() => {
    if (isPublic || isLoggedIn()) {
      setReady(true)
    } else {
      router.replace('/login')
    }
  }, [isPublic, router])

  if (!ready) return null

  return <>{children}</>
}
