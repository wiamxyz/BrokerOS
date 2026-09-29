"use client"

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react"
import { CHAT_SIDEBAR_MIN_WIDTH, type useChatSidebarWidth } from "@/lib/use-chat-sidebar-width"

export function ValueChatResizeHandle({ width, maxWidth, setWidth, saveWidth }: ReturnType<typeof useChatSidebarWidth>) {
  const handle = useRef<HTMLDivElement>(null)
  const drag = useRef<{ pointerId: number; startX: number; startWidth: number } | null>(null)
  const [resizing, setResizing] = useState(false)
  const finish = useCallback(() => {
    const current = drag.current
    if (!current) return
    drag.current = null
    if (handle.current?.hasPointerCapture(current.pointerId)) handle.current.releasePointerCapture(current.pointerId)
    setResizing(false)
    saveWidth()
  }, [saveWidth])

  useEffect(() => {
    window.addEventListener("blur", finish)
    return () => { window.removeEventListener("blur", finish); finish() }
  }, [finish])

  function move(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current
    if (!current || current.pointerId !== event.pointerId) return
    setWidth(current.startWidth + current.startX - event.clientX, false)
  }

  return <div
    ref={handle}
    data-slot="value-chat-resize-handle"
    data-resizing={resizing}
    role="separator"
    aria-label="Resize AI sidebar"
    aria-orientation="vertical"
    aria-controls="value-chat"
    aria-valuemin={CHAT_SIDEBAR_MIN_WIDTH}
    aria-valuemax={maxWidth}
    aria-valuenow={width}
    aria-valuetext={`${width} pixels`}
    tabIndex={0}
    title="Drag or use arrow keys to resize AI sidebar"
    onPointerDown={event => {
      if (event.button !== 0 || !event.isPrimary) return
      event.preventDefault()
      event.currentTarget.focus({ preventScroll: true })
      event.currentTarget.setPointerCapture(event.pointerId)
      drag.current = { pointerId: event.pointerId, startX: event.clientX, startWidth: width }
      setResizing(true)
    }}
    onPointerMove={move}
    onPointerUp={event => { move(event); finish() }}
    onPointerCancel={finish}
    onLostPointerCapture={finish}
    onKeyDown={event => {
      const step = event.shiftKey ? 32 : 16
      const values: Record<string, number> = { ArrowLeft: width + step, ArrowRight: width - step, Home: CHAT_SIDEBAR_MIN_WIDTH, End: maxWidth }
      if (!(event.key in values)) return
      event.preventDefault()
      setWidth(values[event.key])
    }}
    className="absolute inset-y-0 -left-1.5 z-10 w-3 cursor-col-resize touch-none outline-none after:absolute after:inset-y-0 after:left-1/2 after:w-px hover:after:bg-ring focus-visible:after:bg-ring focus-visible:after:w-0.5 data-[resizing=true]:after:bg-ring"
  />
}
