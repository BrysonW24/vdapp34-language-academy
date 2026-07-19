import { Card } from "@/components/ui/card"
import { getWordsByGroup } from "@/lib/academy-content"
import { getLanguageConfig, langHref, languageHasSurface, SUPPORTED_LANGUAGES } from "@/lib/languages"
import { WORD_GROUPS } from "@/types/academy"
import { notFound } from "next/navigation"
import { BackLink } from "@/components/academy/BackLink"
import { SpeakButton } from "@/components/academy/SpeakButton"

const POS_COLORS: Record<string, string> = {
  noun: "#2f4f79",
  verb: "#386a58",
  adjective: "#6d28d9",
  adverb: "#a16a1f",
  preposition: "#65655f",
  pronoun: "#a0453f",
  conjunction: "#65655f",
  article: "#65655f",
  interjection: "#a16a1f",
  number: "#2f4f79",
  particle: "#a16a1f",
  "measure-word": "#2f4f79",
  auxiliary: "#65655f",
}

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.filter((lang) => languageHasSurface(lang, "words")).flatMap((lang) =>
    WORD_GROUPS.map((group) => ({ lang, group: group.id }))
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; group: string }>
}) {
  const { lang, group: groupId } = await params
  const language = getLanguageConfig(lang)
  const group = WORD_GROUPS.find((item) => item.id === groupId)

  if (!language || !group) return { title: "Words" }

  return {
    title: `${language.name} ${group.name}`,
    description: group.desc,
  }
}

export default async function WordGroupPage({
  params,
}: {
  params: Promise<{ lang: string; group: string }>
}) {
  const { lang, group: groupId } = await params
  const language = getLanguageConfig(lang)
  const group = WORD_GROUPS.find((item) => item.id === groupId)

  if (!language || !group) notFound()
  if (!languageHasSurface(language.code, "words")) notFound()

  const words = getWordsByGroup(language.code, groupId)

  return (
    <div className="container mx-auto max-w-2xl space-y-4 px-4 py-5">
      <div className="space-y-2">
        <BackLink href={langHref(language.code, "words")} label="Word groups" />

        <span
          className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ backgroundColor: `${group.color}15`, color: group.color }}
        >
          Words {group.range}
        </span>

        <h1 className="font-serif text-xl font-semibold text-editorial-ink">
          {language.name} {group.name}
        </h1>
        <p className="text-sm text-editorial-muted">{group.desc}</p>
      </div>

      {words.length === 0 ? (
        <Card className="p-4 text-center">
          <p className="text-sm text-editorial-muted">Words for this group are coming soon.</p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-[16px] border border-[rgba(44,49,59,0.08)] bg-white/45">
          {words.map((word) => {
            const displayTerm = word.article ? `${word.article} ${word.term}` : word.term
            const posColor = POS_COLORS[word.partOfSpeech] ?? "#65655f"
            // One reading aid only: the romanization for script languages, or the
            // phonetic hint otherwise. Avoids the duplicated "thi /thi/".
            const roman = (word.transliteration ?? word.pronunciation)?.replace(/\//g, "").trim()

            return (
              <div
                key={`${language.code}-${word.rank}`}
                className="relative flex items-center gap-2 border-b border-[rgba(44,49,59,0.06)] py-1.5 pl-3.5 pr-2 transition-colors duration-200 last:border-b-0 hover:bg-white/70"
              >
                {/* Part-of-speech colour rail */}
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-[3px]"
                  style={{ backgroundColor: posColor }}
                />

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 leading-tight">
                    <span className="font-mono text-[10px] tabular-nums text-editorial-muted">#{word.rank}</span>
                    <span className="font-serif text-[15px] font-semibold text-editorial-ink">{displayTerm}</span>
                    <span className="text-[13px] text-editorial-ink">{word.english}</span>
                    {roman && <span className="text-[11px] italic text-editorial-muted">{roman}</span>}
                    {word.gender && <span className="text-[10px] italic text-editorial-muted">{word.gender}</span>}
                    <span
                      className="shrink-0 rounded px-1 py-px text-[9px] font-medium uppercase tracking-wide"
                      style={{ backgroundColor: `${posColor}14`, color: posColor }}
                    >
                      {word.partOfSpeech}
                    </span>
                  </div>

                  <p className="truncate text-[11px] leading-snug text-editorial-muted">
                    <span className="text-editorial-ink/90">{word.exampleNative}</span>{" "}
                    {word.exampleEn}
                  </p>
                </div>

                <SpeakButton
                  text={displayTerm}
                  language={language.code}
                  size="sm"
                  rate={0.85}
                  className="flex-shrink-0"
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
