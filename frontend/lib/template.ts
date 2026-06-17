/**
 * Parse a CommonPaper template (markdown with inline placeholder spans) into a
 * flat list of blocks. Shared by the on-screen preview and the PDF so both
 * render the same content and handle placeholders identically.
 */

export interface Segment {
  text: string
  bold: boolean
  /** Placeholder field name, when this segment is a fill-in blank. */
  placeholder?: string
}

export type Block =
  | { type: 'heading'; level: number; segments: Segment[] }
  | { type: 'paragraph'; segments: Segment[] }
  | { type: 'listitem'; indent: number; marker: string; segments: Segment[] }
  | { type: 'table'; rows: Segment[][][] }
  | { type: 'hr' }

// Control-char sentinels wrap placeholder names once the spans are stripped.
const OPEN = String.fromCharCode(0)
const CLOSE = String.fromCharCode(1)

/** Replace placeholder spans with sentinels and strip the remaining HTML/links. */
function preprocess(markdown: string): string {
  return markdown
    .replace(/<span class="[a-z]+_link">(.*?)<\/span>/g, (_match, name) => `${OPEN}${name.trim()}${CLOSE}`)
    .replace(/<label[^>]*>[\s\S]*?<\/label>/g, '')
    .replace(/<\/?[^>]+>/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
}

/** Split text into bold/plain/placeholder segments. */
function parseInline(text: string): Segment[] {
  const segments: Segment[] = []
  const parts = text.split(new RegExp(`${OPEN}(.*?)${CLOSE}`))
  parts.forEach((part, index) => {
    if (index % 2 === 1) {
      segments.push({ text: '', bold: false, placeholder: part })
      return
    }
    for (const piece of part.split(/(\*\*[^*]+\*\*)/)) {
      if (!piece) continue
      if (piece.startsWith('**') && piece.endsWith('**')) {
        segments.push({ text: piece.slice(2, -2), bold: true })
      } else {
        segments.push({ text: piece, bold: false })
      }
    }
  })
  return segments
}

const HEADING = /^(#{1,6})\s+(.*)$/
const LIST_ITEM = /^(\s*)([-*+]|\d+\.|[a-z]\.)\s+(.*)$/
const CHECKBOX = /^\[([ xX])\]\s*/
const HR = /^(-{3,}|\*{3,}|_{3,})$/
const TABLE_SEPARATOR = /^:?-+:?$/

function tableRow(line: string): Segment[][] {
  return line
    .replace(/^\s*\||\|\s*$/g, '')
    .split('|')
    .map((cell) => parseInline(cell.trim()))
}

export function parseTemplate(markdown: string): Block[] {
  const lines = preprocess(markdown).split('\n')
  const blocks: Block[] = []
  let paragraph: string[] = []

  const flush = () => {
    if (paragraph.length) {
      blocks.push({ type: 'paragraph', segments: parseInline(paragraph.join(' ')) })
      paragraph = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/\s+$/, '')

    if (!line.trim()) {
      flush()
      continue
    }
    if (HR.test(line.trim())) {
      flush()
      blocks.push({ type: 'hr' })
      continue
    }
    const heading = line.match(HEADING)
    if (heading) {
      flush()
      blocks.push({ type: 'heading', level: heading[1].length, segments: parseInline(heading[2]) })
      continue
    }
    if (line.trimStart().startsWith('|')) {
      flush()
      const rows: Segment[][][] = []
      while (i < lines.length && lines[i].trimStart().startsWith('|')) {
        const cells = lines[i].replace(/^\s*\||\|\s*$/g, '').split('|')
        const isSeparator = cells.every((cell) => TABLE_SEPARATOR.test(cell.trim()))
        if (!isSeparator) rows.push(tableRow(lines[i].trim()))
        i++
      }
      i--
      blocks.push({ type: 'table', rows })
      continue
    }
    const item = line.match(LIST_ITEM)
    if (item) {
      flush()
      let rest = item[3]
      let marker = /^[-*+]$/.test(item[2]) ? '•' : item[2]
      const checkbox = rest.match(CHECKBOX)
      if (checkbox) {
        marker = checkbox[1] === ' ' ? '☐' : '☑'
        rest = rest.replace(CHECKBOX, '')
      }
      blocks.push({ type: 'listitem', indent: item[1].length, marker, segments: parseInline(rest) })
      continue
    }
    paragraph.push(line.trim())
  }
  flush()
  return blocks
}
