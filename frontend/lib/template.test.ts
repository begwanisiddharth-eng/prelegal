import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseTemplate, type Block } from './template'

describe('parseTemplate', () => {
  it('parses headings, paragraphs, and bold', () => {
    const blocks = parseTemplate('# Title\n\nSome **bold** text.')
    expect(blocks[0]).toEqual({ type: 'heading', level: 1, segments: [{ text: 'Title', bold: false }] })
    const para = blocks[1] as Extract<Block, { type: 'paragraph' }>
    expect(para.type).toBe('paragraph')
    expect(para.segments).toContainEqual({ text: 'bold', bold: true })
  })

  it('turns *_link spans into placeholder segments', () => {
    const blocks = parseTemplate('The <span class="orderform_link">Customer</span> agrees.')
    const para = blocks[0] as Extract<Block, { type: 'paragraph' }>
    expect(para.segments).toContainEqual({ text: '', bold: false, placeholder: 'Customer' })
  })

  it('parses list items with markers, indentation, and checkboxes', () => {
    const blocks = parseTemplate('1. First\n    a. Nested\n- [x] Done\n- [ ] Todo')
    const items = blocks.filter((b) => b.type === 'listitem') as Extract<Block, { type: 'listitem' }>[]
    expect(items).toHaveLength(4)
    expect(items[0].marker).toBe('1.')
    expect(items[1].indent).toBe(4)
    expect(items[1].marker).toBe('a.')
    expect(items[2].marker).toBe('☑')
    expect(items[3].marker).toBe('☐')
  })

  it('parses tables and drops the separator row', () => {
    const blocks = parseTemplate('| A | B |\n|---|---|\n| 1 | 2 |')
    const table = blocks.find((b) => b.type === 'table') as Extract<Block, { type: 'table' }>
    expect(table.rows).toHaveLength(2)
    expect(table.rows[0][0][0].text).toBe('A')
    expect(table.rows[1][1][0].text).toBe('2')
  })

  it('strips labels and other HTML but keeps inner text', () => {
    const blocks = parseTemplate('<span class="header_2" id="1">Access</span>\n<label>help</label>')
    const para = blocks[0] as Extract<Block, { type: 'paragraph' }>
    expect(para.segments[0].text).toBe('Access')
    expect(JSON.stringify(blocks)).not.toContain('help')
  })

  it('parses a real full template without leaking HTML', () => {
    const markdown = readFileSync(resolve(process.cwd(), '../templates/Pilot-Agreement.md'), 'utf8')
    const json = JSON.stringify(parseTemplate(markdown))
    expect(json).not.toContain('<span')
    expect(json).toContain('"placeholder":"Customer"')
  })
})
