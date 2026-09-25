export type NavigationSnapshot = { canGoBack: boolean; canGoForward: boolean }

const stateKey = "__brokerosHistory"
const storageKey = "brokeros-navigation-v1"
type Marker = { trail: string; index: number }
type Trail = { id: string; lastIndex: number }
const emptySnapshot: NavigationSnapshot = { canGoBack: false, canGoForward: false }

function markerFrom(state: unknown): Marker | undefined {
  if (!state || typeof state !== "object" || !(stateKey in state)) return
  const marker = (state as Record<string, unknown>)[stateKey] as Partial<Marker> | undefined
  if (marker && typeof marker.trail === "string" && Number.isInteger(marker.index) && marker.index! >= 0) return marker as Marker
}

// Tag existing browser entries without replacing the router's own state. Only
// entries from the current BrokerOS trail enable the in-app history controls.
export function trackNavigationHistory(host: Window, onChange: (snapshot: NavigationSnapshot) => void) {
  const history = host.history
  const originalPush = history.pushState
  const originalReplace = history.replaceState
  let active = true
  let navigating = false
  let trail: Trail | undefined
  let snapshot = emptySnapshot
  try {
    const saved = JSON.parse(host.sessionStorage.getItem(storageKey) || "null") as Partial<Trail> | null
    if (saved && typeof saved.id === "string" && Number.isInteger(saved.lastIndex) && saved.lastIndex! >= 0) trail = saved as Trail
  } catch { /* Navigation still works when session storage is unavailable. */ }

  const persist = () => {
    try { host.sessionStorage.setItem(storageKey, JSON.stringify(trail)) } catch { /* Keep the current tab's in-memory trail. */ }
  }
  const tag = (data: unknown, marker: Marker) => ({ ...(data && typeof data === "object" ? data : {}), [stateKey]: marker })
  const current = () => {
    const marker = markerFrom(history.state)
    if (marker && marker.trail === trail?.id && marker.index <= trail.lastIndex) return marker
    trail = { id: host.crypto.randomUUID(), lastIndex: 0 }
    const initial = { trail: trail.id, index: 0 }
    originalReplace.call(history, tag(history.state, initial), "")
    persist()
    return initial
  }
  const publish = () => {
    navigating = false
    const marker = current()
    snapshot = { canGoBack: marker.index > 0, canGoForward: marker.index < trail!.lastIndex }
    onChange(snapshot)
  }
  const push: History["pushState"] = function (data, unused, url) {
    if (!active) return originalPush.call(history, data, unused, url)
    const marker = current()
    const next = { trail: marker.trail, index: marker.index + 1 }
    originalPush.call(history, tag(data, next), unused, url)
    // Opening another screen after going back discards the old forward branch.
    trail = { id: marker.trail, lastIndex: next.index }
    persist()
    publish()
  }
  const replace: History["replaceState"] = function (data, unused, url) {
    if (!active) return originalReplace.call(history, data, unused, url)
    const marker = current()
    originalReplace.call(history, tag(data, marker), unused, url)
    publish()
  }
  publish()
  history.pushState = push
  history.replaceState = replace
  host.addEventListener("popstate", publish)
  host.addEventListener("pageshow", publish)

  return {
    go(delta: -1 | 1) {
      if (!navigating && (delta === -1 ? snapshot.canGoBack : snapshot.canGoForward)) {
        navigating = true
        history.go(delta)
      }
    },
    dispose() {
      active = false
      host.removeEventListener("popstate", publish)
      host.removeEventListener("pageshow", publish)
      if (history.pushState === push) history.pushState = originalPush
      if (history.replaceState === replace) history.replaceState = originalReplace
    },
  }
}

let snapshot = emptySnapshot
const listeners = new Set<() => void>()
let tracker: ReturnType<typeof trackNavigationHistory> | undefined
export function startNavigationHistory() {
  tracker = trackNavigationHistory(window, next => {
    if (snapshot.canGoBack === next.canGoBack && snapshot.canGoForward === next.canGoForward) return
    snapshot = next
    listeners.forEach(listener => listener())
  })
  return () => { tracker?.dispose(); tracker = undefined }
}
export function subscribeNavigationHistory(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}
export const getNavigationSnapshot = () => snapshot
export const getServerNavigationSnapshot = () => emptySnapshot
export const goBack = () => tracker?.go(-1)
export const goForward = () => tracker?.go(1)
