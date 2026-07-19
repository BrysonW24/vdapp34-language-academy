/**
 * Per-language visual identity shared across the home picker, language pages,
 * and the AI coach: a solid accent colour and a flag-derived CTA gradient.
 * Gradient stops are tuned dark enough to keep white button text legible.
 */

export const LANGUAGE_ACCENTS: Record<string, string> = {
  es: "#386a58",
  zh: "#a0453f",
  de: "#2f4f79",
  th: "#a16a1f",
  ko: "#c0392b",
  ja: "#9b3b8f",
  fr: "#2f5fa0",
  pt: "#1f8a5b",
  tr: "#7a4fa0",
  tl: "#1f7a8c",
  it: "#4a7a2f",
  hi: "#d4791f",
}

export const LANGUAGE_GRADIENTS: Record<string, string> = {
  es: "linear-gradient(135deg, #c0392b 0%, #8f5a0f 100%)", // Spain: red to deep gold
  zh: "linear-gradient(135deg, #c01f1a 0%, #8f5a0f 100%)", // China: red to gold
  de: "linear-gradient(135deg, #1c1c1c 0%, #b02a22 55%, #8a6a14 100%)", // Germany: black, red, gold
  th: "linear-gradient(135deg, #b5271f 0%, #2f4f79 100%)", // Thailand: red to navy
  ko: "linear-gradient(135deg, #c0392b 0%, #28467a 100%)", // Korea: red to blue
  ja: "linear-gradient(135deg, #d33a32 0%, #8c1d17 100%)", // Japan: red disc
  fr: "linear-gradient(135deg, #2f5fa0 0%, #a83232 100%)", // France: blue to red
  pt: "linear-gradient(135deg, #1f8a5b 0%, #1d6fa0 100%)", // Brazil: green to blue
  tr: "linear-gradient(135deg, #c0392b 0%, #8c1d17 100%)", // Turkey: red crescent
  tl: "linear-gradient(135deg, #1f4fa0 0%, #b5271f 100%)", // Philippines: blue to red
  it: "linear-gradient(135deg, #2f8f4f 0%, #b02a22 100%)", // Italy: green to red
  hi: "linear-gradient(135deg, #d4791f 0%, #1f8a5b 100%)", // India: saffron to green
}

const DEFAULT_ACCENT = "#386a58"
const DEFAULT_GRADIENT = "linear-gradient(135deg, #386a58 0%, #2f4f79 100%)"

export function getAccent(code: string): string {
  return LANGUAGE_ACCENTS[code] ?? DEFAULT_ACCENT
}

export function getGradient(code: string): string {
  return LANGUAGE_GRADIENTS[code] ?? DEFAULT_GRADIENT
}
