"use client"

import { useCallback, useEffect, useRef, type PointerEvent } from "react"
import { SIDEBAR_MIN_WIDTH } from "@/lib/use-sidebar-width"

type Props = {
  disabled: boolean
  sidebarId: string
  width: number
  maxWidth: number
  setWidth: (width: number, persist?: boolean) => void
  saveWidth: () => void
  setResizing: (resizing: boolean) => void
}

export function SidebarResizeHandle({ disabled, sidebarId, width, maxWidth, setWidth, saveWidth, setResizing }: Props) {
  const drag = useRef<{ pointerId: number; startX: number; startWidth: number } | null>(null)
  const finish = useCallback(() => {
    if (!drag.current) return
    drag.current = null
    setResizing(false)
    saveWidth()
  }, [saveWidth, setResizing])

  useEffect(() => {
    if (disabled) return
    const mobile = window.matchMedia("(max-width: 760px)")
    const onLayoutChange = () => { if (mobile.matches) finish() }
    window.addEventListener("blur", finish)
    mobile.addEventListener("change", onLayoutChange)
    return () => {
      window.removeEventListener("blur", finish)
      mobile.removeEventListener("change", onLayoutChange)
      finish()
    }
  }, [disabled, finish])

  if (disabled) return null
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current
    if (current?.pointerId === event.pointerId) setWidth(current.startWidth + event.clientX - current.startX, false)
  }

  return <div
    className="sidebar-resize-handle"
    role="separator"
    aria-label="Resize sidebar"
    aria-orientation="vertical"
    aria-controls={sidebarId}
    aria-valuemin={SIDEBAR_MIN_WIDTH}
    aria-valuemax={maxWidth}
    aria-valuenow={width}
    aria-valuetext={`${width} pixels`}
    tabIndex={0}
    title="Drag to resize sidebar"
    onPointerDown={event => {
      if (event.button !== 0 || !event.isPrimary) return
      event.preventDefault()
      event.currentTarget.focus()
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
      const values: Record<string, number> = { ArrowLeft: width - step, ArrowRight: width + step, Home: SIDEBAR_MIN_WIDTH, End: maxWidth }
      if (!(event.key in values)) return
      event.preventDefault()
      setWidth(values[event.key])
    }}
  />
}
