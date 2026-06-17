'use client'

import { useState } from 'react'

function Backdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">{children}</div>
    </div>
  )
}

const primaryButton =
  'rounded bg-brand-purple px-4 py-2 text-sm text-white hover:bg-brand-purple/90 transition-colors disabled:opacity-50'
const secondaryButton =
  'rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors'

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Continue',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Backdrop>
      <h2 className="text-base font-semibold text-brand-navy">{title}</h2>
      <p className="mt-2 text-sm text-gray-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onCancel} className={secondaryButton}>{cancelLabel}</button>
        <button onClick={onConfirm} className={primaryButton}>{confirmLabel}</button>
      </div>
    </Backdrop>
  )
}

export function NoticeDialog({
  title,
  message,
  okLabel = 'OK',
  onOk,
}: {
  title: string
  message: string
  okLabel?: string
  onOk: () => void
}) {
  return (
    <Backdrop>
      <h2 className="text-base font-semibold text-brand-navy">{title}</h2>
      <p className="mt-2 text-sm text-gray-600">{message}</p>
      <div className="mt-5 flex justify-end">
        <button onClick={onOk} className={primaryButton}>{okLabel}</button>
      </div>
    </Backdrop>
  )
}

export function PromptDialog({
  title,
  label,
  initialValue = '',
  submitLabel = 'Save',
  onSubmit,
  onCancel,
}: {
  title: string
  label: string
  initialValue?: string
  submitLabel?: string
  onSubmit: (value: string) => void
  onCancel: () => void
}) {
  const [value, setValue] = useState(initialValue)
  return (
    <Backdrop>
      <h2 className="text-base font-semibold text-brand-navy">{title}</h2>
      <label className="mt-3 block text-sm text-gray-700">
        {label}
        <input
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
        />
      </label>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onCancel} className={secondaryButton}>Cancel</button>
        <button onClick={() => onSubmit(value.trim())} disabled={!value.trim()} className={primaryButton}>
          {submitLabel}
        </button>
      </div>
    </Backdrop>
  )
}
