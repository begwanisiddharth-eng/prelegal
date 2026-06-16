'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import MNDAForm from '@/components/MNDAForm'
import MNDAHtmlPreview from '@/components/MNDAHtmlPreview'
import { defaultFormData, type MNDAFormData } from '@/lib/mnda'

const MNDADownloadButton = dynamic(() => import('@/components/MNDADownloadButton'), {
  ssr: false,
  loading: () => (
    <button disabled className="self-end px-4 py-2 bg-gray-400 text-white text-sm rounded">
      Download PDF
    </button>
  ),
})

export default function Page() {
  const [formData, setFormData] = useState<MNDAFormData>(defaultFormData)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Form panel */}
      <div className="w-1/2 overflow-y-auto bg-white border-r border-gray-200">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 z-10">
          <h1 className="text-lg font-semibold text-gray-900">Mutual NDA Creator</h1>
          <p className="text-xs text-gray-500 mt-0.5">Fill in the details to generate your agreement</p>
        </div>
        <MNDAForm data={formData} onChange={setFormData} />
      </div>

      {/* Preview panel */}
      <div className="w-1/2 flex flex-col p-4 gap-3">
        <MNDADownloadButton data={formData} />
        <MNDAHtmlPreview data={formData} />
      </div>
    </div>
  )
}
