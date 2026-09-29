"use client"

import { useCallback, useSyncExternalStore } from "react"

export const CHAT_SIDEBAR_MIN_WIDTH = 320
const MAX_WIDTH = 640
const storageKey = "brokeros-chat-sidebar-width-v1"
const serverSnapshot = { preferredWidth: null as number | null, viewportWidth: 1440 }
let snapshot = serverSnapshot
let preferredWidth: number | null = null
let loaded = false
const listeners = new Set<() => void>()

function getSnapshot() {
  if (!loaded) {
    loaded = true
    try {
      const saved = Number(window.localStorage.getItem(storageKey))
      if (Number.isFinite(saved) && saved >= CHAT_SIDEBAR_MIN_WIDTH && saved <= MAX_WIDTH) preferredWidth = saved
    } catch { /* The sidebar remains resizable when storage is unavailable. */ }
  }
  if (snapshot.preferredWidth !== preferredWidth || snapshot.viewportWidth !== window.innerWidth) {
    snapshot = { preferredWidth, viewportWidth: window.innerWidth }
  }
  return snapshot
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const storageChanged = (event: StorageEvent) => {
    if (event.key !== storageKey && event.key !== null) return
    loaded = false
    preferredWidth = null
    listener()
  }
  window.addEventListener("resize", listener)
  window.addEventListener("storage", storageChanged)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("resize", listener)
    window.removeEventListener("storage", storageChanged)
  }
}

function saveWidth() {
  if (preferredWidth === null) return
  try { window.localStorage.setItem(storageKey, String(preferredWidth)) } catch { /* Keep the in-memory preference. */ }
}

export function useChatSidebarWidth(leftSidebarWidth: number) {
  const size = useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot)
  // Leave room for the workspace and left navigation. Viewport changes only clamp
  // the displayed width; they never replace the user's saved desktop preference.
  const maxWidth = Math.min(MAX_WIDTH, Math.max(CHAT_SIDEBAR_MIN_WIDTH, size.viewportWidth - leftSidebarWidth - 320))
  const width = Math.min(size.preferredWidth ?? (size.viewportWidth < 1280 ? 360 : 384), maxWidth)
  const setWidth = useCallback((value: number, persist = true) => {
    if (!Number.isFinite(value)) return
    preferredWidth = Math.round(Math.min(maxWidth, Math.max(CHAT_SIDEBAR_MIN_WIDTH, value)))
    if (persist) saveWidth()
    listeners.forEach(listener => listener())
  }, [maxWidth])
  return { width, maxWidth, setWidth, saveWidth }
}
