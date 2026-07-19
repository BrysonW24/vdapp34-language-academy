import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BackLink } from "@/components/academy/BackLink"
import { TopicQuiz } from "@/components/academy/topics/TopicQuiz"
import { getTopic, getTopics } from "@/lib/academy-content"
import { getLanguageConfig, langHref, languageHasSurface, SUPPORTED_LANGUAGES } from "@/lib/languages"
import { notFound } from "next/navigation"

const LEVEL_VARIANT: Record<string, "beginner" | "intermediate" | "advanced"> = {
  beginner: "beginner",
  elementary: "intermediate",
  "pre-intermediate": "advanced",
}

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES
    .filter((lang) => languageHasSurface(lang, "topics"))
    .flatMap((lang) => getTopics(lang).map((topic) => ({ lang, slug: topic.slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  const language = getLanguageConfig(lang)
  const topic = language ? getTopic(language.code, slug) : null

  if (!topic) return { title: "Topic" }

  return {
    title: `${topic.title} | ${language?.name ?? "Academy"}`,
    description: topic.shortSummary,
  }
}

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  const language = getLanguageConfig(lang)

  if (!language) notFound()
  if (!languageHasSurface(language.code, "topics")) notFound()

  const topic = getTopic(language.code, slug)
  if (!topic) notFound()

  return (
    <div className="container mx-auto max-w-2xl space-y-4 px-4 py-5">
      <BackLink href={langHref(language.code, "topics")} label="Topics" />

      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-3xl">{topic.icon}</span>
          <Badge variant={LEVEL_VARIANT[topic.level] ?? "beginner"}>{topic.level}</Badge>
          {topic.status === "coming-soon" && <Badge variant="coming-soon">Coming soon</Badge>}
        </div>
        <h1 className="text-xl font-serif font-semibold text-editorial-ink">{topic.title}</h1>
        {topic.nativeTitle !== topic.title && (
          <p className="text-sm text-editorial-muted italic">{topic.nativeTitle}</p>
        )}
        <p className="text-sm text-editorial-muted leading-relaxed">{topic.shortSummary}</p>
      </div>

      {topic.culturalNote && (
        <Card className="border-l-4 border-l-editorial-amber">
          <CardContent className="p-4 space-y-1.5">
            <h2 className="text-base font-serif font-semibold text-editorial-ink">Cultural Note</h2>
            <p className="text-sm text-editorial-muted leading-relaxed">{topic.culturalNote}</p>
          </CardContent>
        </Card>
      )}

      {topic.keyPhrases.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-serif font-semibold text-editorial-ink">Key Phrases</h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(44,49,59,0.08)]">
                    <th className="text-left p-3 font-serif font-semibold text-editorial-ink">{language.scriptLabel}</th>
                    <th className="text-left p-3 font-serif font-semibold text-editorial-ink">English</th>
                    <th className="text-left p-3 font-serif font-semibold text-editorial-ink hidden sm:table-cell">Pronunciation</th>
                    <th className="text-left p-3 font-serif font-semibold text-editorial-ink hidden md:table-cell">Context</th>
                  </tr>
                </thead>
                <tbody>
                  {topic.keyPhrases.map((phrase, index) => (
                    <tr
                      key={`${topic.slug}-phrase-${index}`}
                      className="border-b border-[rgba(44,49,59,0.04)] last:border-0 hover:bg-white/50 transition-colors"
                    >
                      <td className="p-3 font-medium text-editorial-ink">{phrase.native}</td>
                      <td className="p-3 text-editorial-muted">{phrase.english}</td>
                      <td className="p-3 text-editorial-muted italic hidden sm:table-cell">
                        {phrase.pronunciation ?? ""}
                      </td>
                      <td className="p-3 text-editorial-muted hidden md:table-cell">{phrase.context}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      )}

      {topic.grammar.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-serif font-semibold text-editorial-ink">Grammar</h2>
          <div className="space-y-2">
            {topic.grammar.map((rule, index) => (
              <Card key={`${topic.slug}-rule-${index}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{rule.rule}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-editorial-muted leading-relaxed">{rule.explanation}</p>

                  {rule.examples.length > 0 && (
                    <div className="space-y-1.5">
                      {rule.examples.map((example, exampleIndex) => (
                        <div key={`${topic.slug}-example-${exampleIndex}`} className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-sm">
                          <span className="text-editorial-ink font-medium">{example.native}</span>
                          <span className="text-editorial-muted">{example.en}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {rule.commonMistake && (
                    <div className="mt-2 p-3 rounded-[12px] bg-editorial-red-soft/50">
                      <p className="text-sm text-editorial-red">
                        <strong>Common mistake:</strong> {rule.commonMistake}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {topic.dialogue.lines.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-serif font-semibold text-editorial-ink">Dialogue</h2>
          <Card>
            <CardContent className="p-4 space-y-2">
              <p className="text-sm text-editorial-muted italic mb-2">{topic.dialogue.setup}</p>
              <div className="space-y-2">
                {topic.dialogue.lines.map((line, index) => (
                  <div
                    key={`${topic.slug}-line-${index}`}
                    className={`flex gap-3 ${index % 2 === 0 ? "" : "flex-row-reverse text-right"}`}
                  >
                    <div
                      className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        index % 2 === 0
                          ? "bg-editorial-green-soft text-editorial-green"
                          : "bg-editorial-blue-soft text-editorial-blue"
                      }`}
                    >
                      {line.speaker.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-editorial-muted mb-0.5">{line.speaker}</p>
                      <p className="text-sm text-editorial-ink font-medium">{line.native}</p>
                      {line.secondary && <p className="text-sm text-editorial-muted italic">{line.secondary}</p>}
                      <p className="text-sm text-editorial-muted">{line.english}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {topic.quiz.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-serif font-semibold text-editorial-ink">Quiz</h2>
          <TopicQuiz questions={topic.quiz} topicSlug={`${language.code}:${topic.slug}`} />
        </section>
      )}
    </div>
  )
}
