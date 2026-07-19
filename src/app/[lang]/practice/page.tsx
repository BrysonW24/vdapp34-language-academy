import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  getTopics,
  getPhrasePacks,
  getGrammarRules,
  getWords,
} from "@/lib/academy-content"
import { WORD_GROUPS } from "@/types/academy"
import { getLanguageConfig, langHref, languageHasSurface, SUPPORTED_LANGUAGES } from "@/lib/languages"
import { BackLink } from "@/components/academy/BackLink"
import {
  PracticeClient,
  type PracticeData,
} from "@/components/academy/practice/PracticeClient"
import type { DialogueData } from "@/components/academy/practice/DialogueDrill"
import type { FlashDeck } from "@/components/academy/practice/PhraseFlashcard"
import type { FillItem } from "@/components/academy/practice/SentenceFillIn"

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.filter((lang) => languageHasSurface(lang, "practice")).map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const language = getLanguageConfig(lang)
  return {
    title: language ? `${language.name} Practice` : "Practice",
    description: language
      ? `Conversation role-play, flashcards, and pattern drills for ${language.learningName} - with built-in pronunciation audio.`
      : "Interactive practice exercises.",
  }
}

const FLASH_DECK_CAP = 40

/** Blank the longest content word out of a real example sentence. */
function blankSentence(sentence: string): { prompt: string; answer: string } | null {
  const tokens = sentence.match(/[\p{L}]+/gu) ?? []
  const candidates = tokens.filter((t) => t.length >= 3)
  if (candidates.length === 0) return null
  const answer = candidates.reduce((a, b) => (b.length > a.length ? b : a))
  // Skip degenerate cases (e.g. space-less scripts where one token is the whole line).
  if (answer.length > sentence.length * 0.6) return null
  const idx = sentence.indexOf(answer)
  if (idx < 0) return null
  const prompt = sentence.slice(0, idx) + "_____" + sentence.slice(idx + answer.length)
  return { prompt, answer }
}

function buildPracticeData(language: string): PracticeData {
  const config = getLanguageConfig(language)!

  // Conversations from topic dialogues.
  const dialogues: DialogueData[] = getTopics(config.code)
    .filter((t) => t.dialogue?.lines?.length)
    .map((t) => ({
      id: t.slug,
      label: t.title,
      setup: t.dialogue.setup,
      roles: Array.from(new Set(t.dialogue.lines.map((l) => l.speaker))),
      lines: t.dialogue.lines.map((l) => ({
        speaker: l.speaker,
        native: l.native,
        english: l.english,
        secondary: l.secondary,
      })),
    }))

  // Flashcards: prefer phrase packs, fall back to word groups so every
  // language with words has a working deck.
  const phrasePacks = getPhrasePacks(config.code)
  let flashDecks: FlashDeck[]
  let flashSource: "phrases" | "words"
  if (phrasePacks.length > 0) {
    flashSource = "phrases"
    flashDecks = phrasePacks.map((p) => ({
      id: p.slug,
      label: p.title,
      cards: p.phrases.map((ph) => ({
        front: ph.native,
        back: ph.english,
        pron: ph.pronunciation,
        sub: ph.tip,
      })),
    }))
  } else {
    flashSource = "words"
    const words = getWords(config.code)
    flashDecks = WORD_GROUPS.map((g) => ({
      id: g.id,
      label: g.name,
      cards: words
        .filter((w) => w.group === g.id)
        .slice(0, FLASH_DECK_CAP)
        .map((w) => ({
          front: w.term,
          back: w.english,
          pron: w.pronunciation,
          sub: w.exampleNative,
        })),
    })).filter((d) => d.cards.length > 0)
  }

  // Fill-in items from grammar example sentences (up to 2 per rule).
  const fillItems: FillItem[] = []
  for (const rule of getGrammarRules(config.code)) {
    let used = 0
    for (const ex of rule.examples ?? []) {
      if (used >= 2) break
      if (!ex.native || !ex.en) continue
      const blanked = blankSentence(ex.native)
      if (!blanked) continue
      fillItems.push({
        id: `${rule.slug}-${used}`,
        prompt: blanked.prompt,
        answer: blanked.answer,
        hint: ex.en,
        rule: rule.name,
        full: ex.native,
      })
      used++
    }
  }

  return {
    language: config.code,
    languageName: config.name,
    dialogues,
    flashDecks,
    flashSource,
    fillItems,
  }
}

export default async function PracticePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const language = getLanguageConfig(lang)
  if (!language) notFound()
  if (!languageHasSurface(language.code, "practice")) notFound()

  const data = buildPracticeData(language.code)
  const hasAnyDrill =
    data.dialogues.length > 0 || data.flashDecks.length > 0 || data.fillItems.length > 0

  return (
    <div className="container mx-auto max-w-2xl space-y-4 px-4 py-5">
      <BackLink href={langHref(language.code)} label={`${language.name} academy`} />

      <div>
        <h1 className="font-serif text-xl font-semibold text-editorial-ink">
          {language.name} Practice
        </h1>
        <p className="text-sm leading-relaxed text-editorial-muted">
          Active recall, not passive reading. Step through conversations, flip flashcards, and complete
          real patterns - and tap the speaker icon anywhere to hear how it sounds.
        </p>
      </div>

      {hasAnyDrill ? (
        <PracticeClient data={data} />
      ) : (
        <Card>
          <CardContent className="p-4 text-center space-y-2">
            <div className="mx-auto h-14 w-14 rounded-full bg-editorial-green-soft flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-editorial-green" />
            </div>
            <h2 className="text-lg font-serif font-semibold text-editorial-ink">
              Practice opens up as content lands
            </h2>
            <p className="text-sm leading-relaxed text-editorial-muted">
              This track needs words, phrases, or topics before drills can run. Start by learning the
              highest-frequency words.
            </p>
            <Link
              href={langHref(language.code, "words")}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-editorial-green hover:gap-2.5 transition-all"
            >
              Start with your highest-frequency words <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
