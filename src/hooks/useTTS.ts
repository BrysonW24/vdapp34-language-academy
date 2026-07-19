"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { getSelectedVoice } from "@/lib/voice-prefs"

/**
 * Maps the app's internal language codes to BCP-47 locale tags used by the
 * browser Web Speech API. Forward-compatible with the languages on the
 * roadmap so new tracks only need a row here, never new audio code.
 */
export const TTS_LOCALE_MAP: Record<string, string> = {
  es: "es-ES",
  zh: "zh-CN",
  de: "de-DE",
  th: "th-TH",
  ko: "ko-KR",
  ja: "ja-JP",
  fr: "fr-FR",
  pt: "pt-BR",
  tr: "tr-TR",
  tl: "fil-PH",
  it: "it-IT",
  hi: "hi-IN",
}

export function getLocaleForLanguage(language: string): string {
  return TTS_LOCALE_MAP[language] ?? language
}

interface SpeakOptions {
  /** Slower rate is easier for learners to mimic. Defaults to 0.9. */
  rate?: number
  pitch?: number
}

interface UseTTSResult {
  /** True once we know the browser exposes speechSynthesis. */
  supported: boolean
  /** The text currently being spoken, or null. Lets callers show per-item state. */
  speakingText: string | null
  speak: (text: string, language: string, options?: SpeakOptions) => void
  cancel: () => void
}

/**
 * Tap-to-hear text-to-speech.
 *
 * If the learner has selected a premium ElevenLabs voice for the language (and
 * the server has a key), speech plays the high-quality regional voice via the
 * `/api/tts` proxy and a hidden `<audio>` element. Otherwise it uses the browser
 * Web Speech API. Either way the call site is identical: `speak(text, language)`.
 * Always triggered by an explicit user action, never auto-played.
 */
export function useTTS(): UseTTSResult {
  const [supported, setSupported] = useState(false)
  const [speakingText, setSpeakingText] = useState<string | null>(null)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    // Audio playback (premium) works everywhere; speechSynthesis is the floor.
    setSupported("speechSynthesis" in window || typeof Audio !== "undefined")

    if ("speechSynthesis" in window) {
      const loadVoices = () => {
        voicesRef.current = window.speechSynthesis.getVoices()
      }
      loadVoices()
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices)
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", loadVoices)
        window.speechSynthesis.cancel()
        audioRef.current?.pause()
      }
    }
    return () => audioRef.current?.pause()
  }, [])

  const cancel = useCallback(() => {
    if (typeof window === "undefined") return
    if ("speechSynthesis" in window) window.speechSynthesis.cancel()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.onended = null
      audioRef.current.onerror = null
    }
    setSpeakingText(null)
  }, [])

  const speakWebSpeech = useCallback((text: string, language: string, options?: SpeakOptions) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()

    const locale = getLocaleForLanguage(language)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = locale
    utterance.rate = options?.rate ?? 0.9
    utterance.pitch = options?.pitch ?? 1

    const match =
      voicesRef.current.find((v) => v.lang === locale) ??
      voicesRef.current.find((v) => v.lang.startsWith(locale.split("-")[0]))
    if (match) utterance.voice = match

    utterance.onstart = () => setSpeakingText(text)
    utterance.onend = () => setSpeakingText((current) => (current === text ? null : current))
    utterance.onerror = () => setSpeakingText((current) => (current === text ? null : current))

    window.speechSynthesis.speak(utterance)
  }, [])

  const speak = useCallback<UseTTSResult["speak"]>(
    (text, language, options) => {
      if (typeof window === "undefined" || !text.trim()) return
      cancel()

      const voiceId = getSelectedVoice(language)
      if (voiceId) {
        let fellBack = false
        const fallback = () => {
          if (fellBack) return
          fellBack = true
          setSpeakingText((c) => (c === text ? null : c))
          speakWebSpeech(text, language, options)
        }
        try {
          const audio = audioRef.current ?? new Audio()
          audioRef.current = audio
          audio.onplay = () => setSpeakingText(text)
          audio.onended = () => setSpeakingText((c) => (c === text ? null : c))
          audio.onerror = fallback
          audio.src = `/api/tts?lang=${encodeURIComponent(language)}&voiceId=${encodeURIComponent(
            voiceId
          )}&text=${encodeURIComponent(text)}`
          const played = audio.play()
          if (played && typeof played.catch === "function") played.catch(fallback)
          return
        } catch {
          fallback()
          return
        }
      }

      speakWebSpeech(text, language, options)
    },
    [cancel, speakWebSpeech]
  )

  return { supported, speakingText, speak, cancel }
}
