"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PickerLanguage {
  code: string
  name: string
  nativeName: string
  flag: string
  accent: string
  /** Flag-derived CSS gradient for the primary "Enter academy" button. */
  gradient: string
  description: string
  stats: { words: number; topics: number; grammar: number; phrases: number }
  total: number
  status: "full" | "words" | "soon"
}

const STATUS_LABEL: Record<PickerLanguage["status"], string> = {
  full: "Full course",
  words: "1,000 words",
  soon: "Coming soon",
}

/**
 * Compact, expandable language picker. Every language shows as a single tappable
 * row (flag + name); tapping unravels its stats and an enter button. Built for
 * mobile density: all tracks are visible at once instead of large wide tiles.
 */
export function LanguagePicker({ languages }: { languages: PickerLanguage[] }) {
  const [open, setOpen] = useState<string | null>(languages[0]?.code ?? null)

  return (
    <div className="rounded-[18px] border border-[rgba(44,49,59,0.1)] bg-white/55 overflow-hidden divide-y divide-[rgba(44,49,59,0.08)]">
      {languages.map((lang) => {
        const isOpen = open === lang.code
        return (
          <div key={lang.code}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : lang.code)}
              aria-expanded={isOpen}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors",
                isOpen ? "bg-white/70" : "hover:bg-white/40"
              )}
            >
              <span
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[11px] text-lg"
                style={{ backgroundColor: `${lang.accent}1a` }}
                aria-hidden="true"
              >
                {lang.flag}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className="font-serif text-base font-semibold text-editorial-ink">{lang.name}</span>
                  <span className="truncate text-xs text-editorial-muted italic">{lang.nativeName}</span>
                </span>
              </span>
              <span
                className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: `${lang.accent}14`, color: lang.accent }}
              >
                {STATUS_LABEL[lang.status]}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 flex-shrink-0 text-editorial-muted transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            {isOpen && (
              <div className="px-3.5 pb-3.5 pt-0.5 space-y-3">
                <p className="text-sm text-editorial-muted leading-relaxed">{lang.description}</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Words", value: lang.stats.words },
                    { label: "Topics", value: lang.stats.topics },
                    { label: "Grammar", value: lang.stats.grammar },
                    { label: "Phrases", value: lang.stats.phrases },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-[10px] border border-[rgba(44,49,59,0.08)] bg-white/70 px-2 py-1.5 text-center"
                    >
                      <p className="font-serif text-base leading-none text-editorial-ink">{s.value}</p>
                      <p className="mt-0.5 text-[10px] text-editorial-muted">{s.label}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/${lang.code}`}
                  className="group/cta relative flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-full px-4 py-1.5 text-[13px] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    backgroundImage: lang.gradient,
                    boxShadow: `0 3px 10px -4px ${lang.accent}99`,
                  }}
                >
                  {/* Soft top sheen for a modern, glassy finish */}
                  <span
                    className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"
                    aria-hidden="true"
                  />
                  <span className="relative">
                    Enter {lang.name} {lang.status === "soon" ? "track" : "academy"}
                  </span>
                  <ArrowRight className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
                </Link>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
