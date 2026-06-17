'use client'

import {
  type MNDAFormData,
  STANDARD_TERMS,
  getReplacements,
  getMndaTermText,
  getConfidentialityTermText,
  getConfidentialityTermSuffix,
  parseSegments,
} from '@/lib/mnda'

const NBSP = ' '

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1">
      <p className="text-[9px] text-gray-500">{label}</p>
      <p className="text-[11px] border-b border-gray-300 pb-1 min-h-[18px]">{value || NBSP}</p>
    </div>
  )
}

function Clause({ text, replacements }: { text: string; replacements: Record<string, string> }) {
  const segments = parseSegments(text, replacements)
  return (
    <p className="mb-3 text-[11px] leading-relaxed text-gray-800">
      {segments.map((seg, i) =>
        seg.bold ? (
          <strong key={i} className="font-semibold">{seg.text}</strong>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </p>
  )
}

export default function MNDAHtmlPreview({ data }: { data: MNDAFormData }) {
  const replacements = getReplacements(data)
  const clauses = STANDARD_TERMS.split('\n\n').filter(Boolean)
  const confTermSuffix = getConfidentialityTermSuffix(data)

  const signatureRows: [string, string, string][] = [
    ['Company', data.party1.company, data.party2.company],
    ['Print Name', data.party1.printName, data.party2.printName],
    ['Title', data.party1.title, data.party2.title],
    ['Notice Address', data.party1.noticeAddress, data.party2.noticeAddress],
    ['Date', data.party1.date, data.party2.date],
    ['Signature', '', ''],
  ]

  return (
    <div className="flex-1 overflow-y-auto bg-gray-100 p-3 space-y-4">
      {/* Cover Page */}
      <div className="mx-auto max-w-[820px] bg-white shadow-sm p-10">
        <h2 className="text-center text-lg font-bold">Mutual Non-Disclosure Agreement</h2>
        <p className="text-center text-sm font-bold mb-6">Cover Page</p>

        <h3 className="text-[11px] font-bold mt-4 mb-1">Purpose</h3>
        <p className="text-[9px] text-gray-500">How Confidential Information may be used</p>
        <p className="text-[11px] border-b border-gray-300 pb-1 mb-3 min-h-[18px]">{data.purpose || NBSP}</p>

        <div className="flex gap-4 mb-3">
          <Field label="Effective Date" value={data.effectiveDate} />
          <Field label="MNDA Term" value={getMndaTermText(data)} />
        </div>

        <h3 className="text-[11px] font-bold mb-1">Term of Confidentiality</h3>
        <p className="text-[11px] border-b border-gray-300 pb-1 mb-3 min-h-[18px]">
          {getConfidentialityTermText(data)}
          {confTermSuffix}
        </p>

        <div className="flex gap-4 mb-3">
          <Field label="Governing Law" value={data.governingLaw} />
          <Field label="Jurisdiction" value={data.jurisdiction} />
        </div>

        <h3 className="text-[11px] font-bold mt-4 mb-2">Signatures</h3>
        <table className="w-full border border-gray-400 border-collapse text-[9px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 p-1 w-24"></th>
              <th className="border border-gray-400 p-1 text-left">Party 1</th>
              <th className="border border-gray-400 p-1 text-left">Party 2</th>
            </tr>
          </thead>
          <tbody>
            {signatureRows.map(([label, v1, v2]) => (
              <tr key={label}>
                <td className="border border-gray-400 p-1 font-bold">{label}</td>
                <td className="border border-gray-400 p-1">{v1 || NBSP}</td>
                <td className="border border-gray-400 p-1">{v2 || NBSP}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-center text-[8px] text-gray-500 mt-6">
          Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under CC BY 4.0
        </p>
      </div>

      {/* Standard Terms */}
      <div className="mx-auto max-w-[820px] bg-white shadow-sm p-10">
        <h2 className="text-center text-lg font-bold mb-3">Standard Terms</h2>
        <hr className="border-gray-300 mb-4" />
        {clauses.map((clause, i) => (
          <Clause key={i} text={clause} replacements={replacements} />
        ))}
        <p className="text-center text-[8px] text-gray-500 mt-6">
          Common Paper Mutual Non-Disclosure Agreement Version 1.0 — commonpaper.com/standards/mutual-nda/1.0 — CC BY 4.0
        </p>
      </div>
    </div>
  )
}
