'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ChatPanel from '@/components/ChatPanel'
import MNDAHtmlPreview from '@/components/MNDAHtmlPreview'
import { logout } from '@/lib/auth'
import { defaultFormData, type MNDAFormData } from '@/lib/mnda'

const MNDADownloadButton = dynamic(() => import('@/components/MNDADownloadButton'), {
  ssr: false,
  loading: () => (
    <button disabled className="px-4 py-2 bg-brand-purple/60 text-white text-sm rounded">
      Download PDF
    </button>
  ),
})

export default function Page() {
  const [formData, setFormData] = useState<MNDAFormData>(defaultFormData)
  const router = useRouter()

  function handleLogout() {
    logout()
    router.replace('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Chat panel */}
      <div className="w-2/5 flex flex-col bg-white border-r border-gray-200">
        <div className="border-b border-gray-100 px-6 py-4">
          <h1 className="text-lg font-semibold text-brand-navy">Mutual NDA Creator</h1>
          <p className="text-xs text-brand-gray mt-0.5">Chat with the assistant to fill in your agreement</p>
        </div>
        <div className="flex-1 min-h-0">
          <ChatPanel data={formData} onChange={setFormData} />
        </div>
      </div>

      {/* Preview panel */}
      <div className="w-3/5 flex flex-col min-w-0 bg-gray-50">
        <div className="flex justify-end items-center gap-2 border-b border-gray-200 bg-white px-3 py-2">
          <MNDADownloadButton data={formData} />
          <button
            onClick={handleLogout}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-brand-navy hover:bg-gray-100 transition-colors"
          >
            Log out
          </button>
        </div>
        <MNDAHtmlPreview data={formData} />
      </div>
    </div>
  )
}
