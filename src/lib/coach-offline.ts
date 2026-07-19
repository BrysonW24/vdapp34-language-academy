import { getTopic, getTopics } from "@/lib/academy-content"
import type { SupportedLanguage } from "@/lib/languages"
import type { AcademyTopic } from "@/types/academy"
import type { CoachResponse, CoachScenario } from "@/lib/coach"

/**
 * Offline coach engine. Replays a topic's validated role-play dialogue as a
 * turn-based conversation so the coach works fully without any API key: even
 * lines are the partner, odd lines are the learner's "say this" target.
 * Server-only (reads curriculum content from disk).
 */

// Topics that read best as standalone conversations, tried in order.
export const PREFERRED_SCENARIOS = [
  "food-and-restaurants",
  "directions-and-places",
  "shopping",
  "meeting-people",
  "greetings",
]

export function listScenarios(lang: SupportedLanguage): CoachScenario[] {
  return getTopics(lang)
    .filter((t) => t.dialogue.lines.length >= 2)
    .map((t) => ({ slug: t.slug, title: t.title }))
}

export function resolveScenario(lang: SupportedLanguage, slug?: string): AcademyTopic | null {
  if (slug) {
    const topic = getTopic(lang, slug)
    if (topic && topic.dialogue.lines.length >= 2) return topic
  }
  const topics = getTopics(lang).filter((t) => t.dialogue.lines.length >= 2)
  if (topics.length === 0) return null
  for (const preferred of PREFERRED_SCENARIOS) {
    const match = topics.find((t) => t.slug === preferred)
    if (match) return match
  }
  return topics[0]
}

export function offlineTurn(topic: AcademyTopic, turnIndex: number): CoachResponse {
  const lines = topic.dialogue.lines
  const partnerIdx = turnIndex * 2
  const sayIdx = partnerIdx + 1

  const partnerLine = lines[partnerIdx] ?? lines[lines.length - 1]
  const sayLine = lines[sayIdx]

  // Done when there is no learner line, or no further partner line after it.
  const done = !sayLine || sayIdx + 1 >= lines.length

  return {
    partner: {
      native: partnerLine.native,
      english: partnerLine.english,
      transliteration: partnerLine.secondary,
    },
    say: sayLine
      ? { native: sayLine.native, english: sayLine.english, transliteration: sayLine.secondary }
      : null,
    done,
    source: "offline",
    scenarioLabel: topic.title,
  }
}
