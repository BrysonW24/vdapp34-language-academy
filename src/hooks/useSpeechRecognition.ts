"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { getLocaleForLanguage } from "./useTTS"

/**
 * Minimal structural types for the Web Speech API so we do not depend on
 * lib.dom's experimental SpeechRecognition typings (absent in some TS configs).
 */
interface RecognitionAlternative {
  transcript: string
}
interface RecognitionResult {
  isFinal: boolean
  readonly length: number
  [index: number]: RecognitionAlternative
}
interface RecognitionResultList {
  readonly length: number
  [index: number]: RecognitionResult
}
interface RecognitionEvent {
  resultIndex: number
  results: RecognitionResultList
}
interface RecognitionInstance {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onstart: (() => void) | null
  onresult: ((event: RecognitionEvent) => void) | null
  onerror: ((event: { error?: string }) => void) | null
  onend: (() => void) | null
}
type RecognitionCtor = new () => RecognitionInstance

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor
    webkitSpeechRecognition?: RecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export interface UseSpeechRecognitionResult {
  /** True when the browser exposes a SpeechRecognition implementation. */
  supported: boolean
  listening: boolean
  /** The latest finalised transcript. */
  transcript: string
  /** In-progress text before the engine finalises it. */
  interim: string
  error: string | null
  start: () => void
  stop: () => void
  reset: () => void
}

/**
 * Web Speech API speech-to-text, scoped to the target language locale. Free and
 * on-device where supported (desktop Chrome, some mobile browsers). Callers must
 * always provide a typed fallback because iOS Safari support is unreliable.
 */
export function useSpeechRecognition(
  language: string,
  onFinal?: (text: string) => void
): UseSpeechRecognitionResult {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interim, setInterim] = useState("")
  const [error, setError] = useState<string | null>(null)
  const recRef = useRef<RecognitionInstance | null>(null)
  const onFinalRef = useRef(onFinal)
  onFinalRef.current = onFinal

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null)
    return () => recRef.current?.abort()
  }, [])

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) {
      setError("Speech input is not supported here. Type your line instead.")
      return
    }
    recRef.current?.abort()

    const rec = new Ctor()
    rec.lang = getLocaleForLanguage(language)
    rec.continuous = false
    rec.interimResults = true
    rec.maxAlternatives = 1

    rec.onstart = () => {
      setListening(true)
      setError(null)
    }
    rec.onresult = (event) => {
      let finalText = ""
      let interimText = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0]?.transcript ?? ""
        if (result.isFinal) finalText += text
        else interimText += text
      }
      setInterim(interimText)
      if (finalText.trim()) {
        setTranscript(finalText.trim())
        setInterim("")
        onFinalRef.current?.(finalText.trim())
      }
    }
    rec.onerror = (event) => {
      const code = event.error ?? "error"
      if (code === "aborted") return
      setError(code === "no-speech" ? "Did not catch that. Try again." : "Microphone unavailable. Type instead.")
    }
    rec.onend = () => {
      setListening(false)
      setInterim("")
    }

    recRef.current = rec
    try {
      rec.start()
    } catch {
      // start() throws if called while already running; ignore.
    }
  }, [language])

  const stop = useCallback(() => recRef.current?.stop(), [])
  const reset = useCallback(() => {
    setTranscript("")
    setInterim("")
    setError(null)
  }, [])

  return { supported, listening, transcript, interim, error, start, stop, reset }
}
