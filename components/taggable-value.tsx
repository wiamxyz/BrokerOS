"use client"

import { createContext, useContext, type ComponentProps, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { cn } from "cn"
import { CheckIcon, PlusIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { TableCell } from "@/components/ui/table"
import { useValueTags } from "@/components/value-tags-provider"
import { valueTagId } from "@/lib/value-tags"

const TagScopeContext = createContext<{id:string;onTag?:()=>void} | null>(null)

/** Use an entity scope for detail routes, particularly those with an ?id= query. */
export function TagScope({ id, children, onTag }: { id: string; children: ReactNode; onTag?:()=>void }) {
  return <TagScopeContext.Provider value={{id,onTag}}>{children}</TagScopeContext.Provider>
}
export function useValueTagId(field: string) {
  const scope = useContext(TagScopeContext)
  const pathname = usePathname()
  return valueTagId(scope?.id ?? pathname.replace(/\/$/, ""), field)
}

export function TaggedCell({ scope, field, value, children, ...props }: ComponentProps<typeof TableCell> & {
  scope: string; field: string; value: string | number
}) {
  return <TableCell {...props}><TaggableValue tagId={valueTagId(scope, field)} value={value} label={field}>{children}</TaggableValue></TableCell>
}

/** Wrap a link/badge with this component; never put this component inside a link/button. */
export function TaggableValue({ tagId, value, label, children, className }: {
  tagId: string
  value: string | number
  label?: string
  children?: ReactNode
  className?: string
}) {
  const scope = useContext(TagScopeContext)
  const { enabled, tags, open, addTag } = useValueTags()
  const text = String(value)
  const selected = tags.some(tag => tag.id === tagId)
  if (!enabled || !text.trim() || text === "—") return <>{children ?? text}</>
  return <span className={cn("taggable-value", className)} data-tag-id={tagId}>
    <span className="taggable-value-content">{children ?? text}</span>
    <Button
      type="button"
      variant="outline"
      size="icon-xs"
      className="taggable-value-trigger"
      data-selected={selected}
      aria-label={`${selected ? "Tagged" : "Tag"} ${label ? `${label}: ` : ""}${text}${selected ? ". Open AI chat" : " for AI chat"}`}
      aria-controls={open ? "value-chat" : undefined}
      title={selected ? "Already tagged · Open AI chat" : "Tag for AI chat"}
      onKeyDown={event => event.stopPropagation()}
      onClick={event => {
        event.preventDefault()
        event.stopPropagation()
        const origin = event.currentTarget
        if(scope?.onTag){scope.onTag(); requestAnimationFrame(()=>addTag({id:tagId,value:text,label},origin))}
        else addTag({ id: tagId, value: text, label }, origin)
      }}
    >{selected ? <CheckIcon aria-hidden className="size-3"/> : <PlusIcon aria-hidden className="size-3"/>}</Button>
  </span>
}

export function Value({field,value,children}:{field:string;value:string|number;children?:ReactNode}) { const id=useValueTagId(field); return <TaggableValue tagId={id} value={value} label={field}>{children}</TaggableValue> }
