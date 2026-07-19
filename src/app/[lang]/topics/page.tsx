import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { getTopics } from "@/lib/academy-content"
import { getLanguageConfig, langHref, languageHasSurface, SUPPORTED_LANGUAGES } from "@/lib/languages"
import { notFound } from "next/navigation"
import { BackLink } from "@/components/academy/BackLink"
import { AcademyAccordion } from "@/components/academy/AcademyAccordion"
import { getAccent } from "@/lib/language-visuals"

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES
    .filter((lang) => languageHasSurface(lang, "topics"))
    .map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const language = getLanguageConfig(lang)

  return {
    title: language ? `${language.name} Topics` : "Topics",
    description: language
      ? `Real-life ${language.learningName} topics with dialogues, phrases, grammar, and quizzes.`
      : "Real-life topic lessons.",
  }
}

export default async function TopicsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const language = getLanguageConfig(lang)

  if (!language) notFound()
  if (!languageHasSurface(language.code, "topics")) notFound()

  const topics = getTopics(language.code)

  return (
    <div className="container mx-auto max-w-2xl space-y-4 px-4 py-5">
      <BackLink href={langHref(language.code)} label={`${language.name} academy`} />

      <div>
        <h1 className="font-serif text-xl font-semibold text-editorial-ink">{language.name} Topics</h1>
        <p className="text-sm leading-relaxed text-editorial-muted">
          Real-life situations with dialogue, useful phrases, grammar, and quizzes.
        </p>
      </div>

      {topics.length === 0 ? (
        <Card className="p-4 text-center">
          <p className="text-sm text-editorial-muted">
            Topic content for {language.name} is still being added. Start with the frequency word lists for now.
          </p>
          <Link
            href={langHref(language.code, "words")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-editorial-green hover:gap-2.5 transition-all mt-4"
          >
            Browse words <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>
      ) : (
        <AcademyAccordion
          accent={getAccent(language.code)}
          items={topics.map((topic) => ({
            id: topic.slug,
            emoji: topic.icon,
            title: topic.title,
            subtitle: topic.nativeTitle !== topic.title ? topic.nativeTitle : undefined,
            rightLabel: topic.status === "coming-soon" ? "Coming soon" : topic.level,
            meta: `${topic.keyPhrases.length} phrases · ${topic.grammar.length} grammar · ${topic.quiz.length} quiz`,
            description: topic.shortSummary,
            href: langHref(language.code, `topics/${topic.slug}`),
            cta: "Study topic",
          }))}
        />
      )}
    </div>
  )
}
