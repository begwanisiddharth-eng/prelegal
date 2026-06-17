import { describe, it, expect } from 'vitest'
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MNDAForm from './MNDAForm'
import { defaultFormData, type MNDAFormData } from '@/lib/mnda'

/** Stateful wrapper so interactions flow through real onChange state updates. */
function Harness({ initial = defaultFormData }: { initial?: MNDAFormData }) {
  const [data, setData] = useState<MNDAFormData>(initial)
  return (
    <>
      <MNDAForm data={data} onChange={setData} />
      <output data-testid="state">{JSON.stringify(data)}</output>
    </>
  )
}

function readState(): MNDAFormData {
  return JSON.parse(screen.getByTestId('state').textContent!)
}

describe('MNDAForm', () => {
  it('renders every section heading', () => {
    render(<Harness />)
    for (const title of [
      'Agreement Terms',
      'MNDA Term',
      'Term of Confidentiality',
      'Governing Law & Jurisdiction',
      'Party 1',
      'Party 2',
    ]) {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    }
  })

  it('associates labels with their inputs (getByLabelText resolves)', () => {
    // Regression for the a11y fix: useId wires htmlFor/id together.
    render(<Harness />)
    expect(screen.getByLabelText('Purpose')).toHaveValue(defaultFormData.purpose)
    expect(screen.getByLabelText('Governing Law (state)')).toBeInTheDocument()
    expect(screen.getByLabelText('Jurisdiction')).toBeInTheDocument()
    // Company/Print Name/etc. appear once per party, so there are two of each.
    expect(screen.getAllByLabelText('Company')).toHaveLength(2)
  })

  it('updates the purpose through onChange when typing', async () => {
    const user = userEvent.setup()
    render(<Harness initial={{ ...defaultFormData, purpose: '' }} />)
    await user.type(screen.getByLabelText('Purpose'), 'Evaluating a deal')
    expect(readState().purpose).toBe('Evaluating a deal')
  })

  it('groups the MNDA-term radios under a shared name', () => {
    // Regression for the a11y fix: radios must share a name to form one group.
    const { container } = render(<Harness />)
    const radios = container.querySelectorAll<HTMLInputElement>('input[name="mndaTermType"]')
    expect(radios).toHaveLength(2)
  })

  it('groups the confidentiality radios under a shared name', () => {
    const { container } = render(<Harness />)
    const radios = container.querySelectorAll<HTMLInputElement>('input[name="confidentialityTermType"]')
    expect(radios).toHaveLength(2)
  })

  it('disables the MNDA-term years input when "until terminated" is selected', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    // First spinbutton in the DOM is the MNDA-term years input.
    const yearsInput = screen.getAllByRole('spinbutton')[0]
    expect(yearsInput).toBeEnabled()

    await user.click(screen.getByText('Continues until terminated'))
    expect(yearsInput).toBeDisabled()
    expect(readState().mndaTermType).toBe('until-terminated')
  })

  it('switches the confidentiality term to perpetuity', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByText('In perpetuity'))
    expect(readState().confidentialityTermType).toBe('perpetuity')
  })

  it('updates a party field independently of the other party', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const [party1Company, party2Company] = screen.getAllByLabelText('Company')
    await user.type(party1Company, 'Acme')
    expect(readState().party1.company).toBe('Acme')
    expect(readState().party2.company).toBe('')
    expect(party2Company).toHaveValue('')
  })
})
