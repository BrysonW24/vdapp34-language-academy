export const SUPPORTED_LANGUAGES = [
  "es",
  "zh",
  "de",
  "th",
  "ko",
  "ja",
  "fr",
  "pt",
  "tr",
  "tl",
  "it",
  "hi",
] as const

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

/**
 * Surfaces a language has content for. Used by Navigation and per-route
 * gates to avoid linking to or rendering empty pages.
 *
 * `words` and `guides` are always present (every language has 1000 ranked
 * words, and the visual guide content is language-agnostic). `topics`,
 * `grammar`, and `phrases` are content-dependent and currently only
 * populated for Spanish.
 */
export type LanguageSurface =
  | "words"
  | "topics"
  | "grammar"
  | "phrases"
  | "slang"
  | "practice"
  | "timeline"
  | "guides"

export interface LanguageConfig {
  code: SupportedLanguage
  name: string
  /** Country-flag emoji for the language, for colour and visual life in the UI. */
  flag: string
  nativeName: string
  shortCode: string
  learningName: string
  scriptLabel: string
  academyName: string
  description: string
  surfaces: readonly LanguageSurface[]
}

export const DEFAULT_LANGUAGE: SupportedLanguage = "es"

const FULL_SURFACES = [
  "words",
  "topics",
  "grammar",
  "phrases",
  "slang",
  "practice",
  "timeline",
  "guides",
] as const satisfies readonly LanguageSurface[]

const WORDS_ONLY_SURFACES = [
  "words",
  "practice",
  "timeline",
  "guides",
] as const satisfies readonly LanguageSurface[]

/**
 * Languages that are scaffolded (registered, flagged, routable) but have no
 * curriculum content yet. They appear on the language picker so the full set
 * is visible, but expose no content surfaces until their curriculum lands.
 */
const SCAFFOLD_SURFACES = [] as const satisfies readonly LanguageSurface[]

/**
 * Languages with a full lesson course (topics, grammar, phrases, practice) but
 * whose 1,000-word frequency ladder has not been generated yet. Everything works
 * except the words surface, which stays hidden until the words land.
 */
const LESSONS_SURFACES = [
  "topics",
  "grammar",
  "phrases",
  "slang",
  "practice",
  "timeline",
  "guides",
] as const satisfies readonly LanguageSurface[]

export const LANGUAGE_CONFIG: Record<SupportedLanguage, LanguageConfig> = {
  es: {
    code: "es",
    name: "Spanish",
    flag: "🇪🇸",
    nativeName: "Espanol",
    shortCode: "ES",
    learningName: "Spanish",
    scriptLabel: "Spanish",
    academyName: "Spanish Academy",
    description: "Build practical Spanish with 1,000 high-frequency words and real-world lessons.",
    surfaces: FULL_SURFACES,
  },
  zh: {
    code: "zh",
    name: "Chinese",
    flag: "🇨🇳",
    nativeName: "中文",
    shortCode: "ZH",
    learningName: "Mandarin Chinese",
    scriptLabel: "Chinese",
    academyName: "Chinese Academy",
    description: "Build practical Mandarin with 1,000 high-frequency words, topics, grammar, and phrase packs.",
    surfaces: FULL_SURFACES,
  },
  de: {
    code: "de",
    name: "German",
    flag: "🇩🇪",
    nativeName: "Deutsch",
    shortCode: "DE",
    learningName: "German",
    scriptLabel: "German",
    academyName: "German Academy",
    description: "Build practical German with 1,000 high-frequency words, topics, grammar, and phrase packs.",
    surfaces: FULL_SURFACES,
  },
  th: {
    code: "th",
    name: "Thai",
    flag: "🇹🇭",
    nativeName: "ไทย",
    shortCode: "TH",
    learningName: "Thai",
    scriptLabel: "Thai",
    academyName: "Thai Academy",
    description: "Build practical Thai with 1,000 high-frequency words, topics, grammar, and phrase packs.",
    surfaces: FULL_SURFACES,
  },
  ko: {
    code: "ko",
    name: "Korean",
    flag: "🇰🇷",
    nativeName: "한국어",
    shortCode: "KO",
    learningName: "Korean",
    scriptLabel: "Korean",
    academyName: "Korean Academy",
    description: "Build practical Korean with topics, grammar, phrase packs, and spoken practice, all with romanization.",
    surfaces: LESSONS_SURFACES,
  },
  ja: {
    code: "ja",
    name: "Japanese",
    flag: "🇯🇵",
    nativeName: "日本語",
    shortCode: "JA",
    learningName: "Japanese",
    scriptLabel: "Japanese",
    academyName: "Japanese Academy",
    description: "Build practical Japanese with topics, grammar, phrase packs, and spoken practice, all with romaji.",
    surfaces: LESSONS_SURFACES,
  },
  fr: {
    code: "fr",
    name: "French",
    flag: "🇫🇷",
    nativeName: "Français",
    shortCode: "FR",
    learningName: "French",
    scriptLabel: "French",
    academyName: "French Academy",
    description: "Build practical French with topics, grammar, phrase packs, and spoken practice.",
    surfaces: LESSONS_SURFACES,
  },
  pt: {
    code: "pt",
    name: "Portuguese",
    flag: "🇧🇷",
    nativeName: "Português",
    shortCode: "PT",
    learningName: "Portuguese",
    scriptLabel: "Portuguese",
    academyName: "Portuguese Academy",
    description: "Build practical Brazilian Portuguese with topics, grammar, phrase packs, and spoken practice.",
    surfaces: LESSONS_SURFACES,
  },
  tr: {
    code: "tr",
    name: "Turkish",
    flag: "🇹🇷",
    nativeName: "Türkçe",
    shortCode: "TR",
    learningName: "Turkish",
    scriptLabel: "Turkish",
    academyName: "Turkish Academy",
    description: "Build practical Turkish with topics, grammar, phrase packs, and spoken practice.",
    surfaces: LESSONS_SURFACES,
  },
  tl: {
    code: "tl",
    name: "Filipino",
    flag: "🇵🇭",
    nativeName: "Filipino",
    shortCode: "TL",
    learningName: "Filipino",
    scriptLabel: "Filipino",
    academyName: "Filipino Academy",
    description: "Build practical Filipino with topics, grammar, phrase packs, and spoken practice.",
    surfaces: LESSONS_SURFACES,
  },
  it: {
    code: "it",
    name: "Italian",
    flag: "🇮🇹",
    nativeName: "Italiano",
    shortCode: "IT",
    learningName: "Italian",
    scriptLabel: "Italian",
    academyName: "Italian Academy",
    description: "Build practical Italian with topics, grammar, phrase packs, and spoken practice.",
    surfaces: LESSONS_SURFACES,
  },
  hi: {
    code: "hi",
    name: "Hindi",
    flag: "🇮🇳",
    nativeName: "हिन्दी",
    shortCode: "HI",
    learningName: "Hindi",
    scriptLabel: "Hindi",
    academyName: "Hindi Academy",
    description: "Build practical Hindi with topics, grammar, phrase packs, and spoken practice, all with romanization.",
    surfaces: LESSONS_SURFACES,
  },
}

export function languageHasSurface(
  language: SupportedLanguage,
  surface: LanguageSurface
): boolean {
  return LANGUAGE_CONFIG[language].surfaces.includes(surface)
}

export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(value as SupportedLanguage)
}

export function getLanguageConfig(value: string): LanguageConfig | null {
  return isSupportedLanguage(value) ? LANGUAGE_CONFIG[value] : null
}

export function pathnameHasLanguage(pathname: string): boolean {
  const [firstSegment] = pathname.split("/").filter(Boolean)
  return !!firstSegment && isSupportedLanguage(firstSegment)
}

export function getLanguageFromPathname(pathname: string): SupportedLanguage {
  const [firstSegment] = pathname.split("/").filter(Boolean)
  return firstSegment && isSupportedLanguage(firstSegment) ? firstSegment : DEFAULT_LANGUAGE
}

export function getPathWithoutLanguage(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean)
  if (segments[0] && isSupportedLanguage(segments[0])) {
    return segments.slice(1).join("/")
  }
  return segments.join("/")
}

export function langHref(language: SupportedLanguage, path = ""): string {
  const cleanPath = path.replace(/^\/+/, "")
  return cleanPath ? `/${language}/${cleanPath}` : `/${language}`
}

export function getLanguageSwitchHref(pathname: string, targetLanguage: SupportedLanguage): string {
  if (!pathnameHasLanguage(pathname)) {
    return langHref(targetLanguage)
  }

  const path = getPathWithoutLanguage(pathname)
  const segments = path.split("/").filter(Boolean)

  if (segments.length === 0) {
    return langHref(targetLanguage)
  }

  const [section] = segments

  // Surfaces that exist in every language can preserve the full sub-path.
  if (section === "words" || section === "practice" || section === "timeline" || section === "guides") {
    if (languageHasSurface(targetLanguage, section)) {
      return langHref(targetLanguage, segments.join("/"))
    }
    return langHref(targetLanguage)
  }

  // Content-gated surfaces only preserve the section if the target has it.
  if (section === "topics" || section === "grammar" || section === "phrases") {
    if (languageHasSurface(targetLanguage, section)) {
      return langHref(targetLanguage, section)
    }
    return langHref(targetLanguage)
  }

  return langHref(targetLanguage)
}
