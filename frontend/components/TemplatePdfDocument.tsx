'use client'

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { parseTemplate, type Block, type Segment } from '@/lib/template'

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, fontFamily: 'Helvetica', lineHeight: 1.4, color: '#111' },
  h1: { fontSize: 16, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginTop: 10, marginBottom: 6 },
  h2: { fontSize: 13, fontFamily: 'Helvetica-Bold', marginTop: 10, marginBottom: 4 },
  h3: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 8, marginBottom: 3 },
  paragraph: { marginBottom: 6 },
  listItem: { flexDirection: 'row', marginBottom: 3 },
  marker: { width: 18 },
  divider: { borderBottomWidth: 0.5, borderBottomColor: '#ccc', marginVertical: 12 },
  table: { borderWidth: 0.5, borderColor: '#aaa', marginVertical: 8 },
  tableRow: { flexDirection: 'row' },
  tableCell: { flex: 1, padding: 4, fontSize: 9, borderRightWidth: 0.5, borderRightColor: '#aaa', borderBottomWidth: 0.5, borderBottomColor: '#aaa' },
})

function headingStyle(level: number) {
  if (level <= 1) return styles.h1
  if (level === 2) return styles.h2
  return styles.h3
}

/** Render inline segments; unfilled placeholders get a red underline (PDF only). */
function Inline({ segments, fields }: { segments: Segment[]; fields: Record<string, string> }) {
  return (
    <>
      {segments.map((segment, index) => {
        if (segment.placeholder !== undefined) {
          const value = fields[segment.placeholder] ?? ''
          if (value) {
            return (
              <Text key={index} style={{ textDecoration: 'underline' }}>{value}</Text>
            )
          }
          return (
            <Text key={index} style={{ textDecoration: 'underline', color: '#d40000' }}>
              {'        '}
            </Text>
          )
        }
        return (
          <Text key={index} style={segment.bold ? { fontFamily: 'Helvetica-Bold' } : undefined}>
            {segment.text}
          </Text>
        )
      })}
    </>
  )
}

function BlockView({ block, fields }: { block: Block; fields: Record<string, string> }) {
  switch (block.type) {
    case 'heading':
      return (
        <Text style={headingStyle(block.level)}>
          <Inline segments={block.segments} fields={fields} />
        </Text>
      )
    case 'paragraph':
      return (
        <Text style={styles.paragraph}>
          <Inline segments={block.segments} fields={fields} />
        </Text>
      )
    case 'listitem':
      return (
        <View style={[styles.listItem, { marginLeft: block.indent * 6 }]}>
          <Text style={styles.marker}>{block.marker}</Text>
          <Text style={{ flex: 1 }}>
            <Inline segments={block.segments} fields={fields} />
          </Text>
        </View>
      )
    case 'table':
      return (
        <View style={styles.table}>
          {block.rows.map((row, r) => (
            <View key={r} style={styles.tableRow}>
              {row.map((cell, c) => (
                <Text key={c} style={styles.tableCell}>
                  <Inline segments={cell} fields={fields} />
                </Text>
              ))}
            </View>
          ))}
        </View>
      )
    case 'hr':
      return <View style={styles.divider} />
  }
}

export default function TemplatePdfDocument({
  markdown,
  fields,
}: {
  markdown: string
  fields: Record<string, string>
}) {
  const blocks = parseTemplate(markdown)
  return (
    <Document>
      <Page size="LETTER" style={styles.page} wrap>
        {blocks.map((block, index) => (
          <BlockView key={index} block={block} fields={fields} />
        ))}
      </Page>
    </Document>
  )
}
