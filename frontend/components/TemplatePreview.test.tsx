import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TemplatePreview from './TemplatePreview'

describe('TemplatePreview', () => {
  it('renders template text and fills placeholders from fields', () => {
    const markdown = '# Sample\n\nThe <span class="orderform_link">Customer</span> agrees.'
    const { container } = render(<TemplatePreview markdown={markdown} fields={{ Customer: 'Acme' }} />)
    expect(screen.getByText('Sample')).toBeInTheDocument()
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(container.textContent).toContain('agrees')
  })

  it('renders an empty blank (not the field name) when a placeholder is unfilled', () => {
    const markdown = 'Hi <span class="orderform_link">Customer</span>.'
    const { container } = render(<TemplatePreview markdown={markdown} fields={{}} />)
    expect(container.textContent).not.toContain('Customer')
  })

  it('renders tables, list items, and bold text', () => {
    const markdown = '| A | B |\n|---|---|\n| 1 | 2 |\n\n- Item one\n\nSome **bold** word.'
    const { container } = render(<TemplatePreview markdown={markdown} fields={{}} />)
    expect(container.querySelector('table')).toBeTruthy()
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('Item one')).toBeInTheDocument()
    expect(container.querySelector('strong')?.textContent).toBe('bold')
  })
})
