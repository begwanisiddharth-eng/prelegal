'use client'

import { useRouter } from 'next/navigation'
import { logout } from '@/lib/auth'

export default function Home() {
  const router = useRouter()

  async function handleLogout() {
    await logout()
    router.replace('/login')
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold text-brand-navy">Prelegal</h1>
        <button
          onClick={handleLogout}
          className="rounded border border-gray-300 px-4 py-2 text-sm text-brand-navy hover:bg-gray-100 transition-colors"
        >
          Log out
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-gray-50 p-6 sm:flex-row">
        <button
          onClick={() => router.push('/create')}
          className="w-64 rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm transition-colors hover:border-brand-blue"
        >
          <div className="text-base font-semibold text-brand-navy">Start New Conversation</div>
          <p className="mt-1 text-xs text-gray-500">Chat with the assistant to create a document</p>
        </button>
        <button
          onClick={() => router.push('/saved')}
          className="w-64 rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm transition-colors hover:border-brand-blue"
        >
          <div className="text-base font-semibold text-brand-navy">Download Saved Documents</div>
          <p className="mt-1 text-xs text-gray-500">View and download your saved documents</p>
        </button>
      </main>
    </div>
  )
}
