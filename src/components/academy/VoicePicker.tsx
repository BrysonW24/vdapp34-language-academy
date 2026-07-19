"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowLeft, Check, ChevronDown, Loader2, Play, Plus, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getSelectedVoice, setSelectedVoice } from "@/lib/voice-prefs"
import type { AcademyVoice, AddVoiceResponse, LibraryResponse, LibraryVoice, VoiceListResponse } from "@/lib/voices"

/**
 * Per-language premium-voice control with two modes:
 *  - "select": choose among the account's voices (native first) or the free
 *    browser voice.
 *  - "library": browse the ElevenLabs Voice Library for genuinely native /
 *    regional voices, preview them, and add one to the account in place.
 * Renders nothing when premium voices are unavailable (no server key).
 */
export function VoicePicker({
  language,
  languageName,
  accent,
}: {
  language: string
  languageName: string
  accent: string
}) {
  const [available, setAvailable] = useState(false)
  const [voices, setVoices] = useState<AcademyVoice[]>([])
  const [hasNative, setHasNative] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"select" | "library">("select")

  const [libVoices, setLibVoices] = useState<LibraryVoice[] | null>(null)
  const [libLoading, setLibLoading] = useState(false)
  const [libError, setLibError] = useState<string | null>(null)
  const [adding, setAdding] = useState<string | null>(null)
  const [addError, setAddError] = useState<string | null>(null)

  const previewRef = useRef<HTMLAudioElement | null>(null)

  const loadAccount = useCallback(async () => {
    try {
      const res = await fetch(`/api/voices?lang=${encodeURIComponent(language)}`)
      const d = (await res.json()) as VoiceListResponse
      setAvailable(d.available)
      setVoices(d.voices)
      setHasNative(d.hasNative)
    } catch {
      setAvailable(false)
    }
  }, [language])

  useEffect(() => {
    setSelected(getSelectedVoice(language))
    setMode("select")
    setLibVoices(null)
    setAddError(null)
    loadAccount()
    return () => previewRef.current?.pause()
  }, [language, loadAccount])

  if (!available) return null

  const current = voices.find((v) => v.voiceId === selected)

  const choose = (voiceId: string | null) => {
    setSelectedVoice(language, voiceId)
    setSelected(voiceId)
    setOpen(false)
    setMode("select")
  }

  const playPreview = (url: string | undefined, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!url) return
    const audio = previewRef.current ?? new Audio()
    previewRef.current = audio
    audio.src = url
    audio.play().catch(() => {})
  }

  const openLibrary = async () => {
    setMode("library")
    setAddError(null)
    if (libVoices) return
    setLibLoading(true)
    setLibError(null)
    try {
      const res = await fetch(`/api/voices/library?lang=${encodeURIComponent(language)}`)
      const d = (await res.json()) as LibraryResponse
      if (!d.available) setLibError("The Voice Library is unavailable right now.")
      setLibVoices(d.voices)
    } catch {
      setLibError("Could not load the Voice Library.")
      setLibVoices([])
    } finally {
      setLibLoading(false)
    }
  }

  const addVoice = async (v: LibraryVoice) => {
    setAdding(v.voiceId)
    setAddError(null)
    try {
      const res = await fetch("/api/voices/add", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ publicOwnerId: v.publicOwnerId, voiceId: v.voiceId, name: v.name }),
      })
      const d = (await res.json()) as AddVoiceResponse
      if (d.ok && d.voiceId) {
        await loadAccount()
        choose(d.voiceId)
      } else {
        setAddError(d.error ?? "Could not add this voice.")
      }
    } catch {
      setAddError("Could not add this voice.")
    } finally {
      setAdding(null)
    }
  }

  const meta = (v: LibraryVoice) => [v.accent ?? v.locale, v.gender, v.age].filter(Boolean).join(" · ")

  return (
    <div className="overflow-hidden rounded-[12px] border border-[rgba(44,49,59,0.1)] bg-white/60">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <Volume2 className="h-4 w-4 flex-shrink-0" style={{ color: accent }} />
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-editorial-muted">
            {languageName} voice
          </span>
          <span className="block truncate text-sm font-medium text-editorial-ink">
            {current ? `${current.name}${current.region ? ` · ${current.region}` : ""}` : "Browser voice"}
          </span>
        </span>
        <ChevronDown
          className={cn("h-4 w-4 flex-shrink-0 text-editorial-muted transition-transform", open && "rotate-180")}
        />
      </button>

      {open && mode === "select" && (
        <div className="max-h-[44vh] overflow-y-auto border-t border-[rgba(44,49,59,0.08)]">
          {!hasNative && (
            <p className="border-b border-[rgba(44,49,59,0.06)] bg-[rgba(181,101,29,0.06)] px-3 py-2 text-[11px] leading-snug text-editorial-muted">
              No native {languageName} voices in your library yet. The ones below speak {languageName} via the
              multilingual model. Browse the Voice Library for authentic regional accents.
            </p>
          )}

          <button
            type="button"
            onClick={() => choose(null)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-white/70"
          >
            <span className="flex-1 text-[13px] text-editorial-ink">
              Browser voice <span className="text-editorial-muted">(free)</span>
            </span>
            {selected === null && <Check className="h-4 w-4 flex-shrink-0" style={{ color: accent }} />}
          </button>

          {voices.map((voice) => (
            <button
              key={voice.voiceId}
              type="button"
              onClick={() => choose(voice.voiceId)}
              className="flex w-full items-center gap-2 border-t border-[rgba(44,49,59,0.05)] px-3 py-2 text-left transition-colors hover:bg-white/70"
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-[13px] text-editorial-ink">{voice.name}</span>
                  {voice.nativeMatch && (
                    <span
                      className="flex-shrink-0 rounded-full px-1.5 py-px text-[8px] font-semibold uppercase tracking-wide"
                      style={{ backgroundColor: `${accent}1f`, color: accent }}
                    >
                      Native
                    </span>
                  )}
                </span>
                <span className="block truncate text-[11px] text-editorial-muted">
                  {voice.nativeMatch
                    ? [voice.region, voice.gender].filter(Boolean).join(" · ") || "Native voice"
                    : ["Multilingual", voice.baseAccent, voice.gender].filter(Boolean).join(" · ")}
                </span>
              </span>
              {voice.previewUrl && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => playPreview(voice.previewUrl, e)}
                  aria-label={`Preview ${voice.name}`}
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[rgba(44,49,59,0.12)] text-editorial-muted transition-colors hover:text-editorial-ink"
                >
                  <Play className="h-3 w-3" />
                </span>
              )}
              {selected === voice.voiceId && <Check className="h-4 w-4 flex-shrink-0" style={{ color: accent }} />}
            </button>
          ))}

          <button
            type="button"
            onClick={openLibrary}
            className="flex w-full items-center gap-2 border-t border-[rgba(44,49,59,0.08)] px-3 py-2 text-left text-[13px] font-medium transition-colors hover:bg-white/70"
            style={{ color: accent }}
          >
            <Plus className="h-4 w-4" /> Browse the Voice Library for {languageName} voices
          </button>
        </div>
      )}

      {open && mode === "library" && (
        <div className="max-h-[50vh] overflow-y-auto border-t border-[rgba(44,49,59,0.08)]">
          <button
            type="button"
            onClick={() => setMode("select")}
            className="flex w-full items-center gap-1.5 border-b border-[rgba(44,49,59,0.06)] px-3 py-2 text-left text-[12px] font-medium text-editorial-muted transition-colors hover:text-editorial-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voices
          </button>

          {addError && (
            <p className="border-b border-[rgba(44,49,59,0.06)] bg-[rgba(192,57,43,0.06)] px-3 py-2 text-[11px] leading-snug text-editorial-amber">
              {addError}
            </p>
          )}

          {libLoading && (
            <div className="flex items-center justify-center gap-2 px-3 py-4 text-[12px] text-editorial-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> Finding {languageName} voices...
            </div>
          )}

          {!libLoading && libError && (
            <p className="px-3 py-3 text-[12px] text-editorial-muted">{libError}</p>
          )}

          {!libLoading && libVoices && libVoices.length === 0 && !libError && (
            <p className="px-3 py-3 text-[12px] text-editorial-muted">
              No {languageName} voices found in the Voice Library.
            </p>
          )}

          {!libLoading &&
            libVoices?.map((v) => (
              <div
                key={v.voiceId}
                className="flex items-center gap-2 border-t border-[rgba(44,49,59,0.05)] px-3 py-2 first:border-t-0"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-editorial-ink">{v.name}</span>
                  {meta(v) && <span className="block truncate text-[11px] text-editorial-muted">{meta(v)}</span>}
                </span>
                {v.previewUrl && (
                  <button
                    type="button"
                    onClick={(e) => playPreview(v.previewUrl, e)}
                    aria-label={`Preview ${v.name}`}
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[rgba(44,49,59,0.12)] text-editorial-muted transition-colors hover:text-editorial-ink"
                  >
                    <Play className="h-3 w-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => addVoice(v)}
                  disabled={adding !== null}
                  className="flex h-7 flex-shrink-0 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold text-white transition-all disabled:opacity-50"
                  style={{ backgroundColor: accent }}
                >
                  {adding === v.voiceId ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                  {adding === v.voiceId ? "Adding" : "Add"}
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
