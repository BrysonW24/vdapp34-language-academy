"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AcademyAccordionItem {
  id: string
  /** Leading emoji (topics, phrases). */
  emoji?: string
  /** Leading rank chip text (grammar, e.g. "#1"). */
  rank?: string
  title: string
  /** Native-language title/name, shown on expand. */
  subtitle?: string
  /** Small right-aligned chip on the row, e.g. a level or a count. */
  rightLabel?: string
  /** Compact stats line shown on expand, e.g. "10 phrases · 2 grammar · 5 quiz". */
  meta?: string
  description: string
  href: string
  cta: string
}

/**
 * Compact, collapsible "decision tree" list used across the academy subpages
 * (topics, grammar, phrases). Every item is one tight tappable row so the whole
 * set is visible on first screen; tapping unfolds the native title, summary,
 * stats, and the action link. Mirrors the home WordGroupLadder / LanguagePicker
 * pattern so the app feels consistent and stays dense.
 */
export function AcademyAccordion({
  items,
  accent,
}: {
  items: AcademyAccordionItem[]
  accent: string
}) {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div className="overflow-hidden rounded-[16px] border border-[rgba(44,49,59,0.1)] bg-white/55 divide-y divide-[rgba(44,49,59,0.08)]">
      {items.map((item) => {
        const isOpen = open === item.id
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className={cn(
                "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors",
                isOpen ? "bg-white/70" : "hover:bg-white/40"
              )}
            >
              {item.emoji ? (
                <span className="flex-shrink-0 text-base leading-none" aria-hidden="true">
                  {item.emoji}
                </span>
              ) : item.rank ? (
                <span
                  className="flex-shrink-0 font-mono text-[11px] tabular-nums"
                  style={{ color: accent }}
                >
                  {item.rank}
                </span>
              ) : null}

              <span className="min-w-0 flex-1 truncate font-serif text-sm font-semibold text-editorial-ink">
                {item.title}
              </span>

              {item.rightLabel && (
                <span className="flex-shrink-0 rounded-full bg-[rgba(44,49,59,0.05)] px-2 py-0.5 text-[10px] font-medium text-editorial-muted">
                  {item.rightLabel}
                </span>
              )}

              <ChevronDown
                className={cn(
                  "h-4 w-4 flex-shrink-0 text-editorial-muted transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            {isOpen && (
              <div className="space-y-1.5 px-3 pb-2.5 pt-0">
                {item.subtitle && <p className="text-[12px] italic text-editorial-muted">{item.subtitle}</p>}
                <p className="text-[13px] leading-snug text-editorial-muted">{item.description}</p>
                {item.meta && <p className="text-[11px] text-editorial-muted">{item.meta}</p>}
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 text-[13px] font-medium transition-all hover:gap-1.5"
                  style={{ color: accent }}
                >
                  {item.cta} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
