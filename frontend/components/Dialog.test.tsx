import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmDialog, NoticeDialog, PromptDialog } from './Dialog'

describe('dialogs', () => {
  it('ConfirmDialog fires confirm and cancel', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(<ConfirmDialog title="T" message="M" onConfirm={onConfirm} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onCancel).toHaveBeenCalled()
    expect(onConfirm).toHaveBeenCalled()
  })

  it('ConfirmDialog closes on Escape', async () => {
    const onCancel = vi.fn()
    render(<ConfirmDialog title="T" message="M" onConfirm={() => {}} onCancel={onCancel} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalled()
  })

  it('NoticeDialog fires OK', async () => {
    const onOk = vi.fn()
    render(<NoticeDialog title="T" message="M" onOk={onOk} />)
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(onOk).toHaveBeenCalled()
  })

  it('PromptDialog submits the entered value', async () => {
    const onSubmit = vi.fn()
    render(<PromptDialog title="Save" label="Name" onSubmit={onSubmit} onCancel={() => {}} />)
    await userEvent.type(screen.getByRole('textbox'), 'My Doc')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledWith('My Doc')
  })
})
