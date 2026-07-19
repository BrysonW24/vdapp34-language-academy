/**
 * ElevenLabs voice integration config, shared by the voice + tts API routes and
 * the client picker. Premium regional voices are opt-in: they activate only
 * when ELEVENLABS_API_KEY is set server-side. Without it, the app falls back to
 * the browser Web Speech voices and none of this is reachable.
 */

/** A voice as surfaced to the client picker (no provider internals leak). */
export interface AcademyVoice {
  voiceId: string
  name: string
  /** Regional accent label for native voices, e.g. "Castilian", "Mexican". */
  region?: string
  gender?: string
  previewUrl?: string
  /**
   * True only when the voice is genuinely native to the language: its primary
   * language is this language, or it has a real (non-"standard") regional accent
   * verified for it. NOT true for an English voice that can merely speak it.
   */
  nativeMatch: boolean
  /**
   * The voice can speak this language via the multilingual model but is not
   * native to it (e.g. an English voice rendering Spanish at a generic accent).
   */
  multilingual: boolean
  /** The voice's own primary accent, shown honestly for non-native voices. */
  baseAccent?: string
}

export interface VoiceListResponse {
  available: boolean
  voices: AcademyVoice[]
  /** True when at least one genuinely native voice exists for this language. */
  hasNative: boolean
}

/** A public Voice Library voice that can be added to the account. */
export interface LibraryVoice {
  publicOwnerId: string
  voiceId: string
  name: string
  accent?: string
  locale?: string
  gender?: string
  age?: string
  previewUrl?: string
  description?: string
}

export interface LibraryResponse {
  available: boolean
  voices: LibraryVoice[]
}

export interface AddVoiceResponse {
  ok: boolean
  /** The new voiceId inside the account, on success. */
  voiceId?: string
  error?: string
}

/** ElevenLabs synthesis model. Multilingual v2 covers the bulk of our tracks. */
export const ELEVENLABS_MODEL = process.env.ELEVENLABS_MODEL ?? "eleven_multilingual_v2"

export const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1"

/** Hard cap on synthesis input so a stray long string cannot run up cost. */
export const TTS_MAX_CHARS = 500

/**
 * App language code -> the ISO code ElevenLabs uses in a voice's
 * `verified_languages`/labels. Filipino maps to `fil`; the rest are 1:1.
 */
export const ELEVENLABS_LANG: Record<string, string> = {
  es: "es",
  zh: "zh",
  de: "de",
  th: "th",
  ko: "ko",
  ja: "ja",
  fr: "fr",
  pt: "pt",
  tr: "tr",
  tl: "fil",
  it: "it",
  hi: "hi",
}

export function elevenLabsLang(appLang: string): string {
  return ELEVENLABS_LANG[appLang] ?? appLang
}
