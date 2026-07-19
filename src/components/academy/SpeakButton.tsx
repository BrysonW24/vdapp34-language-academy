"use client"

import { Volume2, Loader2 } from "lucide-react"
import { useTTS } from "@/hooks/useTTS"
import { cn } from "@/lib/utils"

interface SpeakButtonProps {
  /** The native-language text to speak aloud. */
  text: string
  /** App language code (es, zh, de, th, ...). */
  language: string
  /** Slower default rate helps learners mimic. */
  rate?: number
  size?: "sm" | "md"
  className?: string
  /** Optional visible label, e.g. "Listen". Icon-only by default. */
  label?: string
}

/**
 * Tap-to-hear button. Speaks the supplied native text in the correct accent
 * via the browser Web Speech API. Renders nothing when the browser has no
 * speech support so layouts never show a dead control.
 */
export function SpeakButton({
  text,
  language,
  rate,
  size = "md",
  className,
  label,
}: SpeakButtonProps) {
  const { supported, speakingText, speak } = useTTS()
  const isSpeaking = speakingText === text

  if (!supported) return null

  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"

  return (
    <button
      type="button"
      onClick={() => speak(text, language, { rate })}
      aria-label={label ? undefined : `Listen to "${text}"`}
      title={`Listen to "${text}"`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-all",
        size === "sm" ? "h-7 px-2" : "h-8 px-2.5",
        isSpeaking
          ? "border-editorial-green bg-editorial-green-soft text-editorial-green"
          : "border-[rgba(44,49,59,0.12)] bg-white/60 text-editorial-muted hover:text-editorial-green hover:border-editorial-green/40 hover:bg-editorial-green-soft/50",
        className
      )}
    >
      {isSpeaking ? (
        <Loader2 className={cn(iconSize, "animate-spin")} />
      ) : (
        <Volume2 className={iconSize} />
      )}
      {label ? <span className="text-xs font-medium">{label}</span> : null}
    </button>
  )
}
