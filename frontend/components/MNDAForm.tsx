'use client'

import type { MNDAFormData, Party } from '@/lib/mnda'

interface Props {
  data: MNDAFormData
  onChange: (data: MNDAFormData) => void
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-gray-600 mb-1">{children}</label>
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
    />
  )
}

function Textarea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
    />
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3 border-b border-gray-100 pb-1">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function PartyFields({
  label,
  party,
  onChange,
}: {
  label: string
  party: Party
  onChange: (p: Party) => void
}) {
  const set = (key: keyof Party) => (v: string) => onChange({ ...party, [key]: v })
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <div>
        <Label>Company</Label>
        <Input value={party.company} onChange={set('company')} placeholder="Acme Corp." />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Print Name</Label>
          <Input value={party.printName} onChange={set('printName')} placeholder="Jane Smith" />
        </div>
        <div>
          <Label>Title</Label>
          <Input value={party.title} onChange={set('title')} placeholder="CEO" />
        </div>
      </div>
      <div>
        <Label>Notice Address (email or postal)</Label>
        <Input value={party.noticeAddress} onChange={set('noticeAddress')} placeholder="jane@acme.com" />
      </div>
      <div>
        <Label>Date</Label>
        <Input type="date" value={party.date} onChange={set('date')} />
      </div>
    </div>
  )
}

export default function MNDAForm({ data, onChange }: Props) {
  const set = <K extends keyof MNDAFormData>(key: K) =>
    (value: MNDAFormData[K]) => onChange({ ...data, [key]: value })

  return (
    <form className="p-6 space-y-0" onSubmit={(e) => e.preventDefault()}>
      <Section title="Agreement Terms">
        <div>
          <Label>Purpose</Label>
          <Textarea value={data.purpose} onChange={set('purpose')} />
        </div>
        <div>
          <Label>Effective Date</Label>
          <Input type="date" value={data.effectiveDate} onChange={set('effectiveDate')} />
        </div>
      </Section>

      <Section title="MNDA Term">
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              checked={data.mndaTermType === 'fixed'}
              onChange={() => onChange({ ...data, mndaTermType: 'fixed' })}
            />
            Expires after
            <input
              type="number"
              min={1}
              value={data.mndaTermYears}
              onChange={(e) => set('mndaTermYears')(e.target.value)}
              className="w-16 border border-gray-300 rounded px-2 py-0.5 text-sm"
              disabled={data.mndaTermType !== 'fixed'}
            />
            year(s) from Effective Date
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              checked={data.mndaTermType === 'until-terminated'}
              onChange={() => onChange({ ...data, mndaTermType: 'until-terminated' })}
            />
            Continues until terminated
          </label>
        </div>
      </Section>

      <Section title="Term of Confidentiality">
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              checked={data.confidentialityTermType === 'fixed'}
              onChange={() => onChange({ ...data, confidentialityTermType: 'fixed' })}
            />
            <input
              type="number"
              min={1}
              value={data.confidentialityTermYears}
              onChange={(e) => set('confidentialityTermYears')(e.target.value)}
              className="w-16 border border-gray-300 rounded px-2 py-0.5 text-sm"
              disabled={data.confidentialityTermType !== 'fixed'}
            />
            year(s) from Effective Date
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              checked={data.confidentialityTermType === 'perpetuity'}
              onChange={() => onChange({ ...data, confidentialityTermType: 'perpetuity' })}
            />
            In perpetuity
          </label>
        </div>
      </Section>

      <Section title="Governing Law & Jurisdiction">
        <div>
          <Label>Governing Law (state)</Label>
          <Input value={data.governingLaw} onChange={set('governingLaw')} placeholder="Delaware" />
        </div>
        <div>
          <Label>Jurisdiction</Label>
          <Input
            value={data.jurisdiction}
            onChange={set('jurisdiction')}
            placeholder="courts located in New Castle, DE"
          />
        </div>
      </Section>

      <Section title="Party 1">
        <PartyFields
          label="Party 1"
          party={data.party1}
          onChange={(p) => onChange({ ...data, party1: p })}
        />
      </Section>

      <Section title="Party 2">
        <PartyFields
          label="Party 2"
          party={data.party2}
          onChange={(p) => onChange({ ...data, party2: p })}
        />
      </Section>
    </form>
  )
}
