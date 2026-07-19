/**
 * Per-language premium voice selection, persisted in localStorage. The value is
 * an ElevenLabs voiceId; absence means "use the browser Web Speech voice".
 * Read fresh at each speak() call so a change in the picker takes effect at once.
 */

const key = (lang: string) => `va.voice.${lang}`

/** Custom event so the picker and any listeners can react to a change. */
export const VOICE_CHANGE_EVENT = "va:voice-change"

export function getSelectedVoice(lang: string): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(key(lang))
  } catch {
    return null
  }
}

export function setSelectedVoice(lang: string, voiceId: string | null): void {
  if (typeof window === "undefined") return
  try {
    if (voiceId) window.localStorage.setItem(key(lang), voiceId)
    else window.localStorage.removeItem(key(lang))
    window.dispatchEvent(new CustomEvent(VOICE_CHANGE_EVENT, { detail: { lang, voiceId } }))
  } catch {
    // localStorage may be unavailable (private mode); voice choice just will not persist.
  }
}
