'use client'

import { useMemo } from 'react'
import { parseTemplate, type Block, type Segment } from '@/lib/template'

const HEADING_SIZE: Record<number, string> = {
  1: 'text-xl font-bold text-center',
  2: 'text-lg font-bold',
  3: 'text-base font-semibold',
}

function Inline({ segments, fields }: { segments: Segment[]; fields: Record<string, string> }) {
  return (
    <>
      {segments.map((segment, index) => {
        if (segment.placeholder !== undefined) {
          const value = fields[segment.placeholder] ?? ''
          return value ? (
            <span key={index} className="border-b border-gray-400">{value}</span>
          ) : (
            // Fixed-width underlined blank (never red on screen — that is PDF-only).
            <span key={index} className="mx-0.5 inline-block min-w-[90px] border-b border-gray-400 align-baseline">
              {' '}
            </span>
          )
        }
        return segment.bold ? (
          <strong key={index} className="font-semibold">{segment.text}</strong>
        ) : (
          <span key={index}>{segment.text}</span>
        )
      })}
    </>
  )
}

function BlockView({ block, fields }: { block: Block; fields: Record<string, string> }) {
  switch (block.type) {
    case 'heading':
      return (
        <p className={`${HEADING_SIZE[block.level] ?? 'font-semibold'} mb-2 mt-4`}>
          <Inline segments={block.segments} fields={fields} />
        </p>
      )
    case 'paragraph':
      return (
        <p className="mb-3">
          <Inline segments={block.segments} fields={fields} />
        </p>
      )
    case 'listitem':
      return (
        <div className="mb-1.5 flex gap-2" style={{ marginLeft: `${block.indent * 0.4}rem` }}>
          <span className="shrink-0">{block.marker}</span>
          <span>
            <Inline segments={block.segments} fields={fields} />
          </span>
        </div>
      )
    case 'table':
      return (
        <table className="my-3 w-full border-collapse border border-gray-400 text-[11px]">
          <tbody>
            {block.rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c} className="border border-gray-400 p-1 align-top">
                    <Inline segments={cell} fields={fields} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )
    case 'hr':
      return <hr className="my-4 border-gray-300" />
  }
}

export default function TemplatePreview({
  markdown,
  fields,
}: {
  markdown: string
  fields: Record<string, string>
}) {
  const blocks = useMemo(() => parseTemplate(markdown), [markdown])
  return (
    <div className="mx-auto max-w-[820px] bg-white p-10 text-[12px] leading-relaxed text-gray-800 shadow-sm">
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} fields={fields} />
      ))}
    </div>
  )
}
