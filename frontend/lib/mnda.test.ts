import { describe, it, expect } from 'vitest'
import {
  defaultFormData,
  getMndaTermText,
  getConfidentialityTermText,
  getConfidentialityTermSuffix,
  getReplacements,
  parseSegments,
  STANDARD_TERMS,
  type MNDAFormData,
} from './mnda'

/** Build form data overriding only the fields a test cares about. */
function makeData(overrides: Partial<MNDAFormData> = {}): MNDAFormData {
  return { ...defaultFormData, ...overrides }
}

describe('defaultFormData', () => {
  it('uses the local calendar date for the effective date (not UTC)', () => {
    // Regression for the UTC off-by-one: must match local date, not toISOString().
    const expected = new Date().toLocaleDateString('en-CA')
    expect(defaultFormData.effectiveDate).toBe(expected)
  })

  it('produces an ISO-like YYYY-MM-DD string', () => {
    expect(defaultFormData.effectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('defaults both term types to fixed with a 1-year term', () => {
    expect(defaultFormData.mndaTermType).toBe('fixed')
    expect(defaultFormData.mndaTermYears).toBe('1')
    expect(defaultFormData.confidentialityTermType).toBe('fixed')
    expect(defaultFormData.confidentialityTermYears).toBe('1')
  })

  it('starts both parties empty', () => {
    for (const party of [defaultFormData.party1, defaultFormData.party2]) {
      expect(party).toEqual({ printName: '', title: '', company: '', noticeAddress: '', date: '' })
    }
  })
})

describe('getMndaTermText', () => {
  it('formats a fixed term using the entered number of years', () => {
    expect(getMndaTermText(makeData({ mndaTermType: 'fixed', mndaTermYears: '3' }))).toBe(
      '3 year(s) from Effective Date',
    )
  })

  it('falls back to 1 year when the years field is empty', () => {
    // Regression: empty field must not render " year(s) from Effective Date".
    expect(getMndaTermText(makeData({ mndaTermType: 'fixed', mndaTermYears: '' }))).toBe(
      '1 year(s) from Effective Date',
    )
  })

  it('describes the until-terminated case without a year count', () => {
    expect(getMndaTermText(makeData({ mndaTermType: 'until-terminated' }))).toBe(
      'the date of termination in accordance with the terms of the MNDA',
    )
  })
})

describe('getConfidentialityTermText', () => {
  it('formats a fixed term using the entered number of years', () => {
    expect(
      getConfidentialityTermText(makeData({ confidentialityTermType: 'fixed', confidentialityTermYears: '5' })),
    ).toBe('5 year(s) from Effective Date')
  })

  it('falls back to 1 year when the years field is empty', () => {
    expect(
      getConfidentialityTermText(makeData({ confidentialityTermType: 'fixed', confidentialityTermYears: '' })),
    ).toBe('1 year(s) from Effective Date')
  })

  it('returns perpetuity for the perpetuity case', () => {
    expect(getConfidentialityTermText(makeData({ confidentialityTermType: 'perpetuity' }))).toBe('perpetuity')
  })
})

describe('getConfidentialityTermSuffix', () => {
  it('appends the trade-secret carve-out for a fixed term', () => {
    expect(getConfidentialityTermSuffix(makeData({ confidentialityTermType: 'fixed' }))).toBe(
      ', but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws',
    )
  })

  it('returns an empty string for the perpetuity case', () => {
    expect(getConfidentialityTermSuffix(makeData({ confidentialityTermType: 'perpetuity' }))).toBe('')
  })
})

describe('getReplacements', () => {
  it('maps each placeholder key to the corresponding form value', () => {
    const data = makeData({
      purpose: 'Assessing a partnership',
      effectiveDate: '2026-01-01',
      governingLaw: 'Delaware',
      jurisdiction: 'New Castle County, DE',
      mndaTermType: 'fixed',
      mndaTermYears: '2',
      confidentialityTermType: 'perpetuity',
    })
    expect(getReplacements(data)).toEqual({
      Purpose: 'Assessing a partnership',
      'Effective Date': '2026-01-01',
      'MNDA Term': '2 year(s) from Effective Date',
      'Term of Confidentiality': 'perpetuity',
      'Governing Law': 'Delaware',
      Jurisdiction: 'New Castle County, DE',
    })
  })

  it('substitutes bracketed placeholders for empty free-text fields', () => {
    const data = makeData({ purpose: '', governingLaw: '', jurisdiction: '', effectiveDate: '' })
    const r = getReplacements(data)
    expect(r.Purpose).toBe('[Purpose]')
    expect(r['Effective Date']).toBe('[Effective Date]')
    expect(r['Governing Law']).toBe('[Governing Law]')
    expect(r.Jurisdiction).toBe('[Jurisdiction]')
  })
})

describe('parseSegments', () => {
  it('splits **bold** markers into bold segments and leaves the rest plain', () => {
    const segments = parseSegments('Hello **world** end', {})
    expect(segments).toEqual([
      { text: 'Hello ', bold: false },
      { text: 'world', bold: true },
      { text: ' end', bold: false },
    ])
  })

  it('replaces coverpage_link spans with the supplied replacement values', () => {
    const raw = 'Use solely for the <span class="coverpage_link">Purpose</span>.'
    const segments = parseSegments(raw, { Purpose: 'evaluating a deal' })
    expect(segments.map((s) => s.text).join('')).toBe('Use solely for the evaluating a deal.')
  })

  it('replaces every occurrence of a repeated placeholder', () => {
    const raw =
      '<span class="coverpage_link">Governing Law</span> and <span class="coverpage_link">Governing Law</span>'
    const segments = parseSegments(raw, { 'Governing Law': 'Delaware' })
    expect(segments.map((s) => s.text).join('')).toBe('Delaware and Delaware')
  })

  it('drops empty segments produced by adjacent markers', () => {
    const segments = parseSegments('**a****b**', {})
    expect(segments).toEqual([
      { text: 'a', bold: true },
      { text: 'b', bold: true },
    ])
  })

  it('returns a single plain segment when there is no markup', () => {
    expect(parseSegments('plain text', {})).toEqual([{ text: 'plain text', bold: false }])
  })
})

describe('STANDARD_TERMS', () => {
  it('splits into 11 numbered clauses on blank lines', () => {
    const clauses = STANDARD_TERMS.split('\n\n').filter(Boolean)
    expect(clauses).toHaveLength(11)
  })

  it('references all six replacement placeholders', () => {
    for (const key of Object.keys(getReplacements(defaultFormData))) {
      expect(STANDARD_TERMS).toContain(`<span class="coverpage_link">${key}</span>`)
    }
  })

  it('leaves no unreplaced placeholders after substitution', () => {
    const replacements = getReplacements(makeData({ governingLaw: 'Delaware', jurisdiction: 'DE' }))
    const rendered = STANDARD_TERMS.split('\n\n')
      .flatMap((clause) => parseSegments(clause, replacements))
      .map((s) => s.text)
      .join('')
    expect(rendered).not.toContain('coverpage_link')
  })
})
