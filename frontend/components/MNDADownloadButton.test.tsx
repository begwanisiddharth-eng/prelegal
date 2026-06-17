import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MNDADownloadButton from './MNDADownloadButton'
import { defaultFormData } from '@/lib/mnda'

// Stub react-pdf so no real PDF engine runs; StyleSheet.create is needed at
// import time by MNDAPdfDocument.
const { toBlob } = vi.hoisted(() => ({ toBlob: vi.fn() }))
vi.mock('@react-pdf/renderer', () => ({
  pdf: () => ({ toBlob }),
  StyleSheet: { create: (s: unknown) => s },
  Document: () => null,
  Page: () => null,
  Text: () => null,
  View: () => null,
}))

const createObjectURL = vi.fn(() => 'blob:mock-url')
const revokeObjectURL = vi.fn()

describe('MNDADownloadButton', () => {
  beforeEach(() => {
    toBlob.mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }))
    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    createObjectURL.mockClear()
    revokeObjectURL.mockClear()
    toBlob.mockReset()
  })

  it('renders the download button', () => {
    render(<MNDADownloadButton data={defaultFormData} />)
    expect(screen.getByRole('button', { name: 'Download PDF' })).toBeEnabled()
  })

  it('generates a PDF and triggers a named download on click', async () => {
    const user = userEvent.setup()
    let anchor: HTMLAnchorElement | undefined
    const realCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = realCreate(tag)
      if (tag === 'a') anchor = el as HTMLAnchorElement
      return el
    })

    render(<MNDADownloadButton data={defaultFormData} />)
    await user.click(screen.getByRole('button', { name: 'Download PDF' }))

    expect(toBlob).toHaveBeenCalledOnce()
    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(anchor?.download).toBe('mutual-nda.pdf')
    expect(anchor?.href).toBe('blob:mock-url')
  })

  it('resets to the idle label after a successful download (finally branch)', async () => {
    const user = userEvent.setup()
    render(<MNDADownloadButton data={defaultFormData} />)
    await user.click(screen.getByRole('button', { name: 'Download PDF' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Download PDF' })).toBeEnabled(),
    )
  })

  it('revokes the object URL after the click (deferred cleanup)', async () => {
    const user = userEvent.setup()
    render(<MNDADownloadButton data={defaultFormData} />)
    await user.click(screen.getByRole('button', { name: 'Download PDF' }))
    await waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url'))
  })
})
