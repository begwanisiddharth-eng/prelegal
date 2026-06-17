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
})
