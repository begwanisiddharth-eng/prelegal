'use client'

import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer'
import MNDAPdfDocument from './MNDAPdfDocument'
import type { MNDAFormData } from '@/lib/mnda'

export default function MNDAPdfViewer({ data }: { data: MNDAFormData }) {
  return (
    <div className="flex flex-col h-full gap-3">
      <PDFDownloadLink
        document={<MNDAPdfDocument data={data} />}
        fileName="mutual-nda.pdf"
        className="self-end px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-700 transition-colors"
      >
        {({ loading }) => (loading ? 'Preparing PDF...' : 'Download PDF')}
      </PDFDownloadLink>
      <PDFViewer className="flex-1 w-full rounded border border-gray-200" showToolbar={false}>
        <MNDAPdfDocument data={data} />
      </PDFViewer>
    </div>
  )
}
