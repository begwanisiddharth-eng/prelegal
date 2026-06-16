'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import {
  type MNDAFormData,
  type TextSegment,
  STANDARD_TERMS,
  getReplacements,
  getMndaTermText,
  getConfidentialityTermText,
  parseSegments,
} from '@/lib/mnda'

const styles = StyleSheet.create({
  page: { padding: 56, fontSize: 10, fontFamily: 'Helvetica', lineHeight: 1.5, color: '#111' },
  title: { fontSize: 16, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 16 },
  sectionHeader: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 14, marginBottom: 3 },
  label: { fontSize: 8, color: '#555', marginBottom: 1 },
  value: { fontSize: 10, borderBottomWidth: 0.5, borderBottomColor: '#999', paddingBottom: 2, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 16 },
  col: { flex: 1 },
  paragraph: { marginBottom: 8 },
  divider: { borderBottomWidth: 0.5, borderBottomColor: '#ccc', marginVertical: 16 },
  table: { marginTop: 12 },
  tableRow: { flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: '#aaa' },
  tableHeader: { backgroundColor: '#f3f3f3' },
  tableCell: { flex: 1, padding: 5, fontSize: 9, borderRightWidth: 0.5, borderRightColor: '#aaa' },
  tableCellLast: { flex: 1, padding: 5, fontSize: 9 },
  tableLabelCell: { width: 100, padding: 5, fontSize: 9, borderRightWidth: 0.5, borderRightColor: '#aaa', fontFamily: 'Helvetica-Bold' },
  footer: { fontSize: 8, color: '#666', textAlign: 'center', marginTop: 24 },
})

function RichText({ segments }: { segments: TextSegment[] }) {
  return (
    <Text>
      {segments.map((seg, i) =>
        seg.bold ? (
          <Text key={i} style={{ fontFamily: 'Helvetica-Bold' }}>{seg.text}</Text>
        ) : (
          <Text key={i}>{seg.text}</Text>
        )
      )}
    </Text>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || ' '}</Text>
    </View>
  )
}

export default function MNDAPdfDocument({ data }: { data: MNDAFormData }) {
  const replacements = getReplacements(data)
  const clauses = STANDARD_TERMS.split('\n\n').filter(Boolean)

  return (
    <Document>
      {/* Cover Page */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>Mutual Non-Disclosure Agreement</Text>
        <Text style={styles.subtitle}>Cover Page</Text>

        <Text style={styles.sectionHeader}>Purpose</Text>
        <Text style={styles.label}>How Confidential Information may be used</Text>
        <Text style={styles.value}>{data.purpose}</Text>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.sectionHeader}>Effective Date</Text>
            <Text style={styles.value}>{data.effectiveDate}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionHeader}>MNDA Term</Text>
            <Text style={styles.value}>{getMndaTermText(data)}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Term of Confidentiality</Text>
        <Text style={styles.value}>
          {getConfidentialityTermText(data)}
          {data.confidentialityTermType === 'fixed'
            ? ', but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws'
            : ''}
        </Text>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.sectionHeader}>Governing Law</Text>
            <Text style={styles.value}>{data.governingLaw || ' '}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionHeader}>Jurisdiction</Text>
            <Text style={styles.value}>{data.jurisdiction || ' '}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Signatures</Text>
        <View style={[styles.table, { borderBottomWidth: 0.5, borderBottomColor: '#aaa', borderLeftWidth: 0.5, borderLeftColor: '#aaa' }]}>
          {/* Header row */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableLabelCell}> </Text>
            <Text style={styles.tableCell}>Party 1</Text>
            <Text style={styles.tableCellLast}>Party 2</Text>
          </View>
          {[
            ['Company', data.party1.company, data.party2.company],
            ['Print Name', data.party1.printName, data.party2.printName],
            ['Title', data.party1.title, data.party2.title],
            ['Notice Address', data.party1.noticeAddress, data.party2.noticeAddress],
            ['Date', data.party1.date, data.party2.date],
            ['Signature', ' ', ' '],
          ].map(([label, v1, v2]) => (
            <View key={label} style={styles.tableRow}>
              <Text style={styles.tableLabelCell}>{label}</Text>
              <Text style={styles.tableCell}>{v1 || ' '}</Text>
              <Text style={styles.tableCellLast}>{v2 || ' '}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under CC BY 4.0
        </Text>
      </Page>

      {/* Standard Terms */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>Standard Terms</Text>
        <View style={styles.divider} />
        {clauses.map((clause, i) => (
          <View key={i} style={styles.paragraph}>
            <RichText segments={parseSegments(clause, replacements)} />
          </View>
        ))}
        <Text style={styles.footer}>
          Common Paper Mutual Non-Disclosure Agreement Version 1.0 — commonpaper.com/standards/mutual-nda/1.0 — CC BY 4.0
        </Text>
      </Page>
    </Document>
  )
}
