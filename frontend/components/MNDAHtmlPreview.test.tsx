import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import MNDAHtmlPreview from './MNDAHtmlPreview'
import { defaultFormData, type MNDAFormData } from '@/lib/mnda'

function makeData(overrides: Partial<MNDAFormData> = {}): MNDAFormData {
  return { ...defaultFormData, ...overrides }
}

describe('MNDAHtmlPreview', () => {
  it('renders the cover page and standard terms headings', () => {
    render(<MNDAHtmlPreview data={makeData()} />)
    expect(screen.getByRole('heading', { name: 'Mutual Non-Disclosure Agreement' })).toBeInTheDocument()
    // "Cover Page" appears as the subtitle and (bolded) inside clause 1.
    expect(screen.getAllByText('Cover Page').length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: 'Standard Terms' })).toBeInTheDocument()
  })

  it('shows the entered purpose text', () => {
    render(<MNDAHtmlPreview data={makeData({ purpose: 'Assessing a partnership' })} />)
    expect(screen.getByText('Assessing a partnership')).toBeInTheDocument()
  })

  it('renders the fixed MNDA term with the chosen number of years', () => {
    render(<MNDAHtmlPreview data={makeData({ mndaTermType: 'fixed', mndaTermYears: '4' })} />)
    expect(screen.getByText('4 year(s) from Effective Date')).toBeInTheDocument()
  })

  it('appends the trade-secret carve-out only for a fixed confidentiality term', () => {
    const { rerender } = render(
      <MNDAHtmlPreview data={makeData({ confidentialityTermType: 'fixed', confidentialityTermYears: '2' })} />,
    )
    expect(screen.getByText(/in the case of trade secrets/)).toBeInTheDocument()

    rerender(<MNDAHtmlPreview data={makeData({ confidentialityTermType: 'perpetuity' })} />)
    expect(screen.queryByText(/in the case of trade secrets/)).not.toBeInTheDocument()
  })

  it('substitutes governing law and jurisdiction into the standard terms', () => {
    render(<MNDAHtmlPreview data={makeData({ governingLaw: 'Delaware', jurisdiction: 'New Castle County, DE' })} />)
    expect(screen.getByText(/laws of the State of Delaware/)).toBeInTheDocument()
    expect(screen.getByText(/courts located in New Castle County, DE/)).toBeInTheDocument()
  })

  it('renders party details in the signature table', () => {
    render(
      <MNDAHtmlPreview
        data={makeData({
          party1: { company: 'Acme', printName: 'Jane', title: 'CEO', noticeAddress: 'jane@acme.com', date: '2026-01-01' },
          party2: { company: 'Globex', printName: 'John', title: 'CTO', noticeAddress: 'john@globex.com', date: '2026-01-02' },
        })}
      />,
    )
    const table = screen.getByRole('table')
    expect(within(table).getByText('Acme')).toBeInTheDocument()
    expect(within(table).getByText('Globex')).toBeInTheDocument()
    expect(within(table).getByText('jane@acme.com')).toBeInTheDocument()
  })

  it('does not leave raw placeholder markup in the output', () => {
    const { container } = render(<MNDAHtmlPreview data={makeData()} />)
    expect(container.innerHTML).not.toContain('coverpage_link')
  })
})
