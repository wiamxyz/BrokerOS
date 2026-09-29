"use client"

import { useEffect, useLayoutEffect, useImperativeHandle, useRef, useState, type Ref } from "react"
import { Node, type Editor, type NodeViewProps } from "@tiptap/core"
import { EditorContent, NodeViewWrapper, ReactNodeViewRenderer, useEditor } from "@tiptap/react"
import Document from "@tiptap/extension-document"
import Paragraph from "@tiptap/extension-paragraph"
import Text from "@tiptap/extension-text"
import HardBreak from "@tiptap/extension-hard-break"
import { Placeholder, UndoRedo } from "@tiptap/extensions"
import { Fragment, Slice } from "@tiptap/pm/model"
import { closeHistory } from "@tiptap/pm/history"
import { TextSelection } from "@tiptap/pm/state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { XIcon } from "@/components/icons"
import { composerFromJSON, composerToJSON, type ComposerPart } from "@/lib/inline-composer"

function InlineTag({ node, editor, getPos, selected }: NodeViewProps) {
  const { id, value, label } = node.attrs
  return <NodeViewWrapper as="span" contentEditable={false} data-tag-pill={id} className={`inline-value-tag ${selected ? "is-selected" : ""}`}>
    <Badge variant="secondary" className="inline-value-tag-badge gap-1 rounded-full py-0 pl-2 pr-0.5 text-xs font-normal">
      <span className="min-w-0 whitespace-normal break-words [overflow-wrap:anywhere]">{value}</span>
      <Button type="button" variant="ghost" size="icon-xs" className="inline-tag-remove shrink-0" aria-label={`Remove ${value}${label ? ` (${label})` : ""}`} onMouseDown={event => event.preventDefault()} onClick={() => {
        const position = getPos()
        if (typeof position === "number") {
          editor.view.dispatch(closeHistory(editor.state.tr))
          editor.chain().focus().deleteRange({ from: position, to: position + node.nodeSize }).run()
        }
      }}><XIcon aria-hidden className="size-3"/></Button>
    </Badge>
  </NodeViewWrapper>
}

const ValueTagNode = Node.create({
  name: "valueTag",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,
  addAttributes: () => ({ id: { default: "" }, value: { default: "" }, label: { default: null } }),
  renderHTML: ({ node }) => ["span", { "data-value-tag": node.attrs.id }, node.attrs.value],
  renderText: ({ node }) => node.attrs.value,
  addNodeView: () => ReactNodeViewRenderer(InlineTag),
})

const extensions = [
  Document.extend({ content: "paragraph" }), Paragraph, Text, HardBreak, ValueTagNode, UndoRedo,
  Placeholder.configure({ placeholder: "Ask about your workspace…" }),
]

export type InlineComposerHandle = { focus: (options?: FocusOptions) => void }

/** One text flow with atomic tags; editor transactions own selection and undo. */
export function InlineValueComposer({ parts, caret, insertion, onChange, onCaret, ref }: {
  parts: ComposerPart[]
  caret: number
  insertion: number
  onChange: (parts: ComposerPart[], caret: number) => void
  onCaret: (caret: number) => void
  ref: Ref<InlineComposerHandle>
}) {
  const [announcement, setAnnouncement] = useState("")
  const synchronized = useRef<{ editor: Editor; insertion: number } | null>(null)
  const editor = useEditor({
    extensions,
    content: composerToJSON(parts),
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        id: "value-chat-message", role: "textbox", "aria-label": "Message about tagged values", "aria-multiline": "true",
        "aria-describedby": "inline-composer-help", class: "inline-value-editor", spellcheck: "true",
      },
      handleKeyDown: (view, event) => {
        if (event.isComposing || view.composing || event.keyCode === 229) return false
        if ((event.key === "Backspace" || event.key === "Delete") && !event.metaKey && !event.ctrlKey && !event.altKey) {
          // Native arrow movement can precede the browser's selectionchange event.
          // Resolve the visible caret before deciding which atomic tag to remove.
          const selection = view.dom.ownerDocument.getSelection()
          if (selection?.isCollapsed && selection.anchorNode && view.dom.contains(selection.anchorNode)) {
            const position = view.posAtDOM(selection.anchorNode, selection.anchorOffset)
            const $position = view.state.doc.resolve(position)
            const backward = event.key === "Backspace"
            const node = backward ? $position.nodeBefore : $position.nodeAfter
            if (node?.type.name === "valueTag") {
              event.preventDefault()
              const from = backward ? position - node.nodeSize : position
              const transaction = closeHistory(view.state.tr).setSelection(TextSelection.create(view.state.doc, position)).delete(from, from + node.nodeSize)
              view.dispatch(transaction.scrollIntoView())
              return true
            }
          }
        }
        if (event.key !== "Enter" || event.shiftKey) return false
        event.preventDefault()
        view.dom.closest("form")?.requestSubmit()
        return true
      },
      // Paste text only. Foreign HTML cannot introduce tags, controls or styling.
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData("text/plain")
        if (text === undefined) return false
        event.preventDefault()
        const content = composerToJSON([{ type: "text", text: text.replace(/\r\n?/g, "\n") }]).content?.[0].content ?? []
        const nodes = content.map(node => view.state.schema.nodeFromJSON(node))
        view.dispatch(view.state.tr.replaceSelection(new Slice(Fragment.fromArray(nodes), 0, 0)).scrollIntoView())
        return true
      },
      handleDrop: () => true,
      clipboardTextSerializer: slice => slice.content.textBetween(0, slice.content.size, "\n", node => node.type.name === "valueTag" ? node.attrs.value : node.type.name === "hardBreak" ? "\n" : ""),
    },
    onSelectionUpdate: ({ editor }) => onCaret(editor.state.selection.head - 1),
    onUpdate: ({ editor, transaction }) => {
      const next = composerFromJSON(editor.getJSON())
      const previous = composerFromJSON(transaction.before.toJSON())
      const removed = previous.filter(part => part.type === "tag" && !next.some(item => item.type === "tag" && item.tag.id === part.tag.id))
      if (removed.length) setAnnouncement(`Removed ${removed.map(part => part.type === "tag" ? part.tag.value : "").join(", ")}.`)
      onChange(next, editor.state.selection.head - 1)
    },
  })

  useImperativeHandle(ref, () => ({ focus: options => { editor?.commands.focus(undefined, { scrollIntoView: !options?.preventScroll }) } }), [editor])

  // Tiptap attaches its DOM after the initial React layout pass. Focus once the
  // editable element is connected, including keyboard-triggered sheet opening.
  useEffect(() => {
    if (!editor) return
    const frame = requestAnimationFrame(() => {
      if (!editor.isDestroyed && !editor.view.hasFocus()) editor.view.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [editor, insertion])

  useLayoutEffect(() => {
    if (!editor || (synchronized.current?.editor === editor && synchronized.current.insertion === insertion)) return
    const initial = synchronized.current?.editor !== editor
    synchronized.current = { editor, insertion }
    // React's mirrored draft may lag a typing transaction. Only external tagging
    // may replace content, never a state update echoed from the editor itself.
    if (!initial && JSON.stringify(composerFromJSON(editor.getJSON())) !== JSON.stringify(parts)) {
      editor.view.dispatch(closeHistory(editor.state.tr))
      editor.commands.setContent(composerToJSON(parts), { emitUpdate: false })
    }
    editor.commands.setTextSelection(Math.min(caret + 1, editor.state.doc.content.size - 1))
    editor.view.focus()
  }, [editor, parts, caret, insertion])

  return <>
    <EditorContent editor={editor}/>
    <span id="inline-composer-help" className="sr-only">Type before or after a tagged value. Use arrow keys to move around tags, Backspace or Delete to remove them. Enter sends; Shift+Enter adds a line.</span>
    <span role="status" className="sr-only">{announcement}</span>
  </>
}
