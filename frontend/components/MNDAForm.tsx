'use client'

import { useId } from 'react'
import type { MNDAFormData, Party } from '@/lib/mnda'

interface Props {
  data: MNDAFormData
  onChange: (data: MNDAFormData) => void
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
      />
    </div>
  )
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
      />
    </div>
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
      <Input label="Company" value={party.company} onChange={set('company')} placeholder="Acme Corp." />
      <div className="grid grid-cols-2 gap-2">
        <Input label="Print Name" value={party.printName} onChange={set('printName')} placeholder="Jane Smith" />
        <Input label="Title" value={party.title} onChange={set('title')} placeholder="CEO" />
      </div>
      <Input label="Notice Address (email or postal)" value={party.noticeAddress} onChange={set('noticeAddress')} placeholder="jane@acme.com" />
      <Input label="Date" type="date" value={party.date} onChange={set('date')} />
    </div>
  )
}

export default function MNDAForm({ data, onChange }: Props) {
  const set = <K extends keyof MNDAFormData>(key: K) =>
    (value: MNDAFormData[K]) => onChange({ ...data, [key]: value })

  return (
    <form className="p-6 space-y-0" onSubmit={(e) => e.preventDefault()}>
      <Section title="Agreement Terms">
        <Textarea label="Purpose" value={data.purpose} onChange={set('purpose')} />
        <Input label="Effective Date" type="date" value={data.effectiveDate} onChange={set('effectiveDate')} />
      </Section>

      <Section title="MNDA Term">
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="mndaTermType"
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
              name="mndaTermType"
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
              name="confidentialityTermType"
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
              name="confidentialityTermType"
              checked={data.confidentialityTermType === 'perpetuity'}
              onChange={() => onChange({ ...data, confidentialityTermType: 'perpetuity' })}
            />
            In perpetuity
          </label>
        </div>
      </Section>

      <Section title="Governing Law & Jurisdiction">
        <Input label="Governing Law (state)" value={data.governingLaw} onChange={set('governingLaw')} placeholder="Delaware" />
        <Input
          label="Jurisdiction"
          value={data.jurisdiction}
          onChange={set('jurisdiction')}
          placeholder="courts located in New Castle, DE"
        />
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
