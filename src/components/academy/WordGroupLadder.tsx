"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface LadderGroup {
  id: string
  name: string
  range: string
  desc: string
  color: string
  count: number
  href: string
}

/**
 * Compact, collapsible rendering of the Pareto word-frequency ladder. Each group
 * is a single dense row (range badge + name + loaded count); tapping unfolds the
 * short description and the start link. Replaces five large cards with one tight
 * stack so the language page stays short.
 */
export function WordGroupLadder({ groups }: { groups: LadderGroup[] }) {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div className="rounded-[16px] border border-[rgba(44,49,59,0.1)] bg-white/55 overflow-hidden divide-y divide-[rgba(44,49,59,0.08)]">
      {groups.map((group) => {
        const isOpen = open === group.id
        return (
          <div key={group.id}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : group.id)}
              aria-expanded={isOpen}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors",
                isOpen ? "bg-white/70" : "hover:bg-white/40"
              )}
            >
              <span
                className="flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums"
                style={{ backgroundColor: `${group.color}14`, color: group.color }}
              >
                {group.range}
              </span>
              <span className="min-w-0 flex-1 truncate font-serif text-sm font-semibold text-editorial-ink">
                {group.name}
              </span>
              <span className="flex-shrink-0 text-[11px] text-editorial-muted">{group.count} loaded</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 flex-shrink-0 text-editorial-muted transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            {isOpen && (
              <div className="space-y-1.5 px-3 pb-2.5 pt-0">
                <p className="text-[13px] leading-snug text-editorial-muted">{group.desc}</p>
                <Link
                  href={group.href}
                  className="inline-flex items-center gap-1 text-[13px] font-medium transition-all hover:gap-1.5"
                  style={{ color: group.color }}
                >
                  Start learning <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
