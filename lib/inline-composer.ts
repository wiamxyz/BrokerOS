import type { ValueTag } from "./value-tags"
import type { JSONContent } from "@tiptap/core"

export type ComposerPart = { type: "text"; text: string } | { type: "tag"; tag: ValueTag }

/** Only text and source-identified tags can enter a saved composer. */
export function normalizeComposer(value: unknown): ComposerPart[] {
  if (!Array.isArray(value)) return []
  const result: ComposerPart[] = []
  const seen = new Set<string>()
  for (const part of value) {
    if (part?.type === "text" && typeof part.text === "string" && part.text) {
      const last = result.at(-1)
      if (last?.type === "text") last.text += part.text
      else result.push({ type: "text", text: part.text })
    } else if (part?.type === "tag" && typeof part.tag?.id === "string" && part.tag.id.trim() && typeof part.tag.value === "string" && part.tag.value.trim() && !seen.has(part.tag.id)) {
      seen.add(part.tag.id)
      result.push({ type: "tag", tag: { id: part.tag.id, value: part.tag.value, ...(typeof part.tag.label === "string" ? { label: part.tag.label } : {}) } })
    }
  }
  return result
}

export const composerTags = (parts: readonly ComposerPart[]) => parts.flatMap(part => part.type === "tag" ? [part.tag] : [])
export const composerText = (parts: readonly ComposerPart[], includeTags = true) => parts.map(part => part.type === "text" ? part.text : includeTags ? part.tag.value : "").join("")
export const composerLength = (parts: readonly ComposerPart[]) => parts.reduce((length, part) => length + (part.type === "text" ? part.text.length : 1), 0)

export function tagsOnlyComposer(tags: readonly ValueTag[]): ComposerPart[] {
  return tags.flatMap<ComposerPart>(tag => [{ type: "tag", tag }, { type: "text", text: " " }])
}

export function restoreComposer(parts: unknown, legacyDraft: unknown, tags: readonly ValueTag[]): ComposerPart[] {
  return Array.isArray(parts) ? normalizeComposer(parts) : normalizeComposer([...tagsOnlyComposer(tags), { type: "text", text: typeof legacyDraft === "string" ? legacyDraft : "" }])
}

export function composerToJSON(parts: readonly ComposerPart[]): JSONContent {
  return { type: "doc", content: [{ type: "paragraph", content: parts.flatMap<JSONContent>(part => {
    if (part.type === "tag") return [{ type: "valueTag", attrs: part.tag }]
    return part.text.split("\n").flatMap<JSONContent>((text, index) => [...(index ? [{ type: "hardBreak" }] : []), ...(text ? [{ type: "text", text }] : [])])
  }) }] }
}

export function composerFromJSON(doc: JSONContent): ComposerPart[] {
  const parts: unknown[] = []
  for (const [index, paragraph] of (doc.content ?? []).entries()) {
    if (index) parts.push({ type: "text", text: "\n" })
    for (const node of paragraph.content ?? []) {
      if (node.type === "text") parts.push({ type: "text", text: node.text })
      if (node.type === "hardBreak") parts.push({ type: "text", text: "\n" })
      if (node.type === "valueTag") parts.push({ type: "tag", tag: node.attrs })
    }
  }
  return normalizeComposer(parts)
}

/** Caret offsets count each atomic tag as one character, like the editor schema. */
export function insertComposerTag(parts: readonly ComposerPart[], tag: ValueTag, position = composerLength(parts)) {
  if (!tag.id.trim() || !tag.value.trim()) return { parts: [...parts], caret: position }
  let offset = 0
  const existing = parts.find(part => {
    if (part.type === "tag" && part.tag.id === tag.id) return true
    offset += part.type === "text" ? part.text.length : 1
    return false
  })
  if (existing) return { parts: parts.map(part => part.type === "tag" && part.tag.id === tag.id ? { type: "tag" as const, tag } : part), caret: offset + 1 }
  const before: ComposerPart[] = []
  const after: ComposerPart[] = []
  let remaining = Math.max(0, Math.min(position, composerLength(parts)))
  for (const part of parts) {
    const length = part.type === "text" ? part.text.length : 1
    if (remaining >= length) { before.push(part); remaining -= length }
    else if (part.type === "text") {
      before.push({ type: "text", text: part.text.slice(0, remaining) })
      after.push({ type: "text", text: part.text.slice(remaining) })
      remaining = 0
    } else { after.push(part); remaining = 0 }
  }
  const prefix = /\S$/.test(composerText(before)) ? " " : ""
  const insertion: ComposerPart[] = [{ type: "text", text: prefix }, { type: "tag", tag }, { type: "text", text: " " }]
  return { parts: normalizeComposer([...before, ...insertion, ...after]), caret: composerLength(before) + prefix.length + 2 }
}
