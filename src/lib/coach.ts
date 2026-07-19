/**
 * Shared, isomorphic logic for the AI Conversation Coach.
 *
 * The coach runs a turn-based conversation: the AI partner says one line in the
 * target language, then the screen shows the single best next line for the
 * learner to read aloud (the "SAY" target). The learner reads it (by voice or
 * text), we score the attempt, and the loop continues.
 *
 * This file is pure (no fs, no React) so it can run on both the server route and
 * the client component. Content loading and the model call live in the route.
 */

/** Languages whose native text is non-Latin and needs a romanization shown. */
export const SCRIPT_LANGUAGES = new Set(["zh", "ja", "ko", "hi", "th"])

export interface CoachLine {
  role: "partner" | "learner"
  /** The line in the target language (native script). */
  native: string
  /** English gloss. */
  english?: string
  /** Romanization for script languages. */
  transliteration?: string
}

export interface CoachPhrase {
  native: string
  english: string
  transliteration?: string
}

/** One coach turn: what the partner just said + what the learner should say next. */
export interface CoachResponse {
  partner: CoachPhrase
  /** The suggested learner line, or null when the conversation has ended. */
  say: CoachPhrase | null
  done: boolean
  /** Where the turn came from: a live model call or the offline dialogue replay. */
  source: "ai" | "offline"
  /** Human-readable scenario label, e.g. "At the Restaurant". */
  scenarioLabel?: string
}

export interface CoachScenario {
  slug: string
  title: string
}

/**
 * Score a learner's spoken/typed attempt against the target line, 0-100.
 *
 * Space-delimited languages use token overlap (forgiving of word order and
 * filler). Script languages without spaces (zh, ja, th) fall back to a
 * character-level similarity so the chip still means something.
 */
export function scoreAttempt(said: string, target: string): number {
  const a = normalize(said)
  const b = normalize(target)
  if (!a || !b) return 0

  if (b.includes(" ")) {
    const targetTokens = b.split(" ").filter(Boolean)
    if (targetTokens.length === 0) return 0
    const saidTokens = new Set(a.split(" ").filter(Boolean))
    const hits = targetTokens.filter((t) => saidTokens.has(t)).length
    return clampPct((hits / targetTokens.length) * 100)
  }

  // No spaces (CJK / Thai): character-level similarity.
  return clampPct(similarity([...a], [...b]) * 100)
}

/** A short, friendly verdict for a score, used on the result chip. */
export function scoreLabel(score: number): { label: string; tone: "good" | "ok" | "low" } {
  if (score >= 80) return { label: "Great", tone: "good" }
  if (score >= 50) return { label: "Close", tone: "ok" }
  return { label: "Keep trying", tone: "low" }
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip combining accents for Latin scripts
    .replace(/[.,!?¿¡;:""''"'()\-、。！？]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)))
}

/** Normalized similarity (0-1) from Levenshtein distance over two token arrays. */
function similarity(a: string[], b: string[]): number {
  const dist = levenshtein(a, b)
  const longest = Math.max(a.length, b.length)
  return longest === 0 ? 1 : 1 - dist / longest
}

function levenshtein(a: string[], b: string[]): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  let prev = Array.from({ length: n + 1 }, (_, i) => i)
  let curr = new Array<number>(n + 1)
  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
    }
    ;[prev, curr] = [curr, prev]
  }
  return prev[n]
}

/**
 * System prompt for the live model. The model plays a patient conversation
 * partner and must return strict JSON so the client can render the partner
 * bubble and the "your turn" panel deterministically.
 */
export function buildCoachSystemPrompt(
  languageName: string,
  scenarioTitle: string,
  isScript: boolean
): string {
  const translit = isScript
    ? `\n- "partnerTranslit" and "sayTranslit": a clear romanization of each native line.`
    : ""
  return [
    `You are a warm, patient ${languageName} conversation partner helping a beginner practise speaking, in the scenario: "${scenarioTitle}".`,
    `Each turn you do TWO things:`,
    `1. Reply naturally as the partner in ONE short, simple ${languageName} sentence suited to a beginner.`,
    `2. Suggest the single best next line for the LEARNER to say back to you, also ONE short ${languageName} sentence at a beginner level.`,
    ``,
    `Keep it easy and encouraging. Stay in the scenario. Never break character or add commentary.`,
    `Respond with ONLY a JSON object, no markdown, no code fences, exactly this shape:`,
    `{`,
    `  "partnerNative": "<your line in ${languageName}>",`,
    `  "partnerEnglish": "<english translation of your line>",`,
    `  "sayNative": "<the learner's suggested next line in ${languageName}>",`,
    `  "sayEnglish": "<english translation of the suggested line>"${isScript ? "," : ""}`,
    isScript ? `  "partnerTranslit": "<romanization>",` : ``,
    isScript ? `  "sayTranslit": "<romanization>"` : ``,
    `}`,
    translit,
  ]
    .filter((l) => l !== ``)
    .join("\n")
}

/** Render the running conversation as a transcript for the model's user turn. */
export function transcriptForModel(history: CoachLine[], scenarioSetup: string): string {
  if (history.length === 0) {
    return `Scenario: ${scenarioSetup}\nStart the conversation: greet the learner and open the scene.`
  }
  const body = history
    .map((l) => `${l.role === "partner" ? "Partner" : "Learner"}: ${l.native}`)
    .join("\n")
  return `Scenario: ${scenarioSetup}\n\n${body}\n\nContinue: give your next partner line and the learner's suggested reply.`
}
