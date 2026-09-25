"use client"

import { useEffect, useSyncExternalStore, type ReactNode } from "react"
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { getNavigationSnapshot, getServerNavigationSnapshot, goBack, goForward, startNavigationHistory, subscribeNavigationHistory } from "@/lib/navigation-history"

export function NavigationHistoryProvider({ children }: { children: ReactNode }) {
  useEffect(startNavigationHistory, [])
  return children
}

export function HistoryControls({ className = "", onNavigate }: { className?: string; onNavigate?: () => void }) {
  const { canGoBack, canGoForward } = useSyncExternalStore(subscribeNavigationHistory, getNavigationSnapshot, getServerNavigationSnapshot)
  return <div role="group" aria-label="Screen history" className={`flex items-center ${className}`}>
    <Button type="button" variant="ghost" size="icon-sm" aria-label="Go back" title="Go back" disabled={!canGoBack} onClick={() => { goBack(); onNavigate?.() }} className="rounded-lg text-muted-foreground disabled:opacity-30"><ArrowLeftIcon className="size-4"/></Button>
    <Button type="button" variant="ghost" size="icon-sm" aria-label="Go forward" title="Go forward" disabled={!canGoForward} onClick={() => { goForward(); onNavigate?.() }} className="rounded-lg text-muted-foreground disabled:opacity-30"><ArrowRightIcon className="size-4"/></Button>
  </div>
}
