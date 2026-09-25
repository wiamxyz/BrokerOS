"use client"

import { useSyncExternalStore } from "react"

export const SIDEBAR_MIN_WIDTH = 240
const DEFAULT_WIDTH = 320
const MAX_WIDTH = 480
const storageKey = "brokeros-sidebar-width-v1"
const serverSnapshot = { width: DEFAULT_WIDTH, maxWidth: MAX_WIDTH }
let snapshot = serverSnapshot
let preferredWidth = DEFAULT_WIDTH
let loaded = false
const listeners = new Set<() => void>()

function getSnapshot() {
  if (!loaded) {
    loaded = true
    try {
      const saved = Number(window.localStorage.getItem(storageKey))
      if (Number.isFinite(saved) && saved >= SIDEBAR_MIN_WIDTH && saved <= MAX_WIDTH) preferredWidth = saved
    } catch { /* Resizing still works when browser storage is unavailable. */ }
  }
  // Constrain the displayed width without overwriting the user's wider preference.
  const maxWidth = Math.min(MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, window.innerWidth - 360))
  const width = Math.min(preferredWidth, maxWidth)
  if (snapshot.width !== width || snapshot.maxWidth !== maxWidth) snapshot = { width, maxWidth }
  return snapshot
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const storageChanged = (event: StorageEvent) => {
    if (event.key !== storageKey && event.key !== null) return
    loaded = false
    preferredWidth = DEFAULT_WIDTH
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
  try { window.localStorage.setItem(storageKey, String(preferredWidth)) } catch { /* Keep the in-memory preference. */ }
}

function setWidth(value: number, persist = true) {
  if (!Number.isFinite(value)) return
  const { maxWidth } = getSnapshot()
  preferredWidth = Math.round(Math.min(maxWidth, Math.max(SIDEBAR_MIN_WIDTH, value)))
  if (persist) saveWidth()
  listeners.forEach(listener => listener())
}

export function useSidebarWidth() {
  const size = useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot)
  return { ...size, setWidth, saveWidth }
}
