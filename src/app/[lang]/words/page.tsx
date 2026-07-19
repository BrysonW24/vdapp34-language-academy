import { Card } from "@/components/ui/card"
import { getWords } from "@/lib/academy-content"
import { getLanguageConfig, langHref, languageHasSurface, SUPPORTED_LANGUAGES } from "@/lib/languages"
import { TARGET_COUNTS, WORD_GROUPS } from "@/types/academy"
import { notFound } from "next/navigation"
import { BackLink } from "@/components/academy/BackLink"
import { WordGroupLadder } from "@/components/academy/WordGroupLadder"

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.filter((lang) => languageHasSurface(lang, "words")).map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const language = getLanguageConfig(lang)

  return {
    title: language ? `${language.name} Words` : "Words",
    description: language
      ? `Master the 1,000 most frequent ${language.learningName} words, organised by the Pareto Ladder.`
      : "Master the most frequent words.",
  }
}

export default async function WordsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const language = getLanguageConfig(lang)

  if (!language) notFound()
  if (!languageHasSurface(language.code, "words")) notFound()

  const allWords = getWords(language.code)
  const groupCounts = WORD_GROUPS.map((group) => ({
    ...group,
    count: allWords.filter((word) => word.group === group.id).length,
  }))

  return (
    <div className="container mx-auto max-w-2xl space-y-4 px-4 py-5">
      <BackLink href={langHref(language.code)} label={`${language.name} academy`} />

      <div>
        <h1 className="font-serif text-xl font-semibold text-editorial-ink">{language.name} Words</h1>
        <p className="text-sm leading-relaxed text-editorial-muted">
          Five frequency-ranked groups. Learn them in order to cover the highest-impact vocabulary first.
        </p>
      </div>

      {allWords.length === 0 ? (
        <Card className="p-4 text-center">
          <p className="text-sm text-editorial-muted">
            Word content for {language.name} is coming soon. The shared structure is already in place.
          </p>
        </Card>
      ) : (
        <WordGroupLadder
          groups={groupCounts.map((group) => ({
            id: group.id,
            name: group.name,
            range: group.range,
            desc: group.desc,
            color: group.color,
            count: group.count,
            href: langHref(language.code, `words/${group.id}`),
          }))}
        />
      )}

      <p className="text-[12px] text-editorial-muted">
        <strong className="text-editorial-ink">Loaded:</strong> {allWords.length} of {TARGET_COUNTS.words} words for{" "}
        {language.name}.
      </p>
    </div>
  )
}
