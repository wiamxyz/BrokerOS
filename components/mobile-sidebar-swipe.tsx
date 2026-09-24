"use client"

import { useEffect } from "react"
import { completesSidebarSwipe, sidebarSwipeDirection } from "@/lib/sidebar-swipe"

export function MobileSidebarSwipe({openMobile,setOpenMobile}:{openMobile:boolean;setOpenMobile:(open:boolean)=>void}) {
  useEffect(() => {
    if (openMobile) return
    let start: { x: number; y: number; id: number; locked: boolean } | null = null
    function reset() { start = null }
    function begin(event: TouchEvent) {
      reset()
      if (!window.matchMedia("(max-width: 760px)").matches || event.touches.length !== 1 || !(event.target instanceof Element)) return
      const target = event.target
      if (!target.closest('.main-shell') || target.closest('input, textarea, select, button, a, [contenteditable="true"], [role="dialog"], [role="slider"], [role="combobox"]')) return
      // Leave nested horizontal scrollers, such as tables, in control of their gestures.
      for (let element: Element | null = target; element && element !== document.body; element = element.parentElement) {
        if (element.scrollWidth > element.clientWidth + 1 && /auto|scroll/.test(getComputedStyle(element).overflowX)) return
      }
      if (window.getSelection()?.toString()) return
      const touch = event.touches[0]
      start = { x: touch.clientX, y: touch.clientY, id: touch.identifier, locked: false }
    }
    function move(event: TouchEvent) {
      if (!start) return
      if (event.touches.length !== 1) { reset(); return }
      const touch = event.touches[0]
      if (touch.identifier !== start.id) { reset(); return }
      const direction = sidebarSwipeDirection(touch.clientX - start.x, touch.clientY - start.y)
      if (direction === "cancel") { reset(); return }
      if (direction === "right") start.locked = true
      if (start.locked && event.cancelable) event.preventDefault()
    }
    function finish(event: TouchEvent) {
      const gesture = start
      reset()
      if (!gesture || event.touches.length) return
      const touch = Array.from(event.changedTouches).find(t => t.identifier === gesture.id)
      if (touch && completesSidebarSwipe(touch.clientX - gesture.x, touch.clientY - gesture.y)) setOpenMobile(true)
    }
    document.addEventListener("touchstart", begin, { passive: true })
    document.addEventListener("touchmove", move, { passive: false })
    document.addEventListener("touchend", finish, { passive: true })
    document.addEventListener("touchcancel", reset, { passive: true })
    return () => {
      document.removeEventListener("touchstart", begin)
      document.removeEventListener("touchmove", move)
      document.removeEventListener("touchend", finish)
      document.removeEventListener("touchcancel", reset)
    }
  }, [openMobile, setOpenMobile])
  return null
}
