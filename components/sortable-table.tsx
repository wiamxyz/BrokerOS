"use client"

import { useState, type ReactNode } from "react"
import { ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TableHead } from "@/components/ui/table"

type Value = string | number | null | undefined
export function useTableSort<T>(rows: T[], columns: Record<string, (row: T) => Value>) {
  const [sort, setSort] = useState<{ key: string; direction: "ascending" | "descending" } | null>(null)
  const sorted = sort ? [...rows].sort((a, b) => {
    const left = columns[sort.key](a), right = columns[sort.key](b)
    if (left == null) return right == null ? 0 : 1
    if (right == null) return -1
    const result = typeof left === "number" && typeof right === "number" ? left - right : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: "base" })
    return sort.direction === "ascending" ? result : -result
  }) : rows
  return { rows: sorted, sort, toggle: (key: string) => setSort(current => ({ key, direction: current?.key === key && current.direction === "ascending" ? "descending" : "ascending" })) }
}
export function SortHead({ column, sorting, children, right = false }: { column: string; sorting: { sort: { key: string; direction: "ascending" | "descending" } | null; toggle: (key: string) => void }; children: ReactNode; right?: boolean }) {
  const direction = sorting.sort?.key === column ? sorting.sort.direction : "none"
  const Icon = direction === "ascending" ? ArrowUpIcon : direction === "descending" ? ArrowDownIcon : ArrowUpDownIcon
  return <TableHead aria-sort={direction} className={right ? "text-right" : undefined}><Button variant="ghost" type="button" onClick={() => sorting.toggle(column)} className={`flex min-h-11 w-full justify-start items-center gap-1.5 rounded-sm text-left hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring ${right ? "justify-end" : ""}`} title={`Sort ${direction === "ascending" ? "descending" : "ascending"}`}>{children}<Icon aria-hidden className={`size-3 shrink-0 ${direction === "none" ? "opacity-40" : ""}`}/></Button></TableHead>
}
