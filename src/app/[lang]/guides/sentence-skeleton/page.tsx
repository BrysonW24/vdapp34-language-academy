import { ArrowRight, Shapes } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BackLink } from "@/components/academy/BackLink"
import { GuidePageScaffold } from "@/components/academy/guides/GuidePageScaffold"
import { getSentenceSkeletonGuide, getVisualGuidesIndexHref } from "@/lib/visual-guides"
import { getLanguageConfig, languageHasSurface, SUPPORTED_LANGUAGES } from "@/lib/languages"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.filter((lang) => languageHasSurface(lang, "guides")).map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const language = getLanguageConfig(lang)

  if (!language) {
    return {
      title: "Sentence Skeleton",
      description: "Learn the default shape of a usable sentence.",
    }
  }

  const guide = getSentenceSkeletonGuide(language.code)

  return {
    title: `${language.name} ${guide.title}`,
    description: guide.heroSummary,
  }
}

export default async function SentenceSkeletonGuidePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const language = getLanguageConfig(lang)

  if (!language) notFound()
  if (!languageHasSurface(language.code, "guides")) notFound()

  const guide = getSentenceSkeletonGuide(language.code)

  return (
    <GuidePageScaffold
      badge={`${language.name} Guide`}
      title={guide.title}
      subtitle={guide.subtitle}
      heroSummary={guide.heroSummary}
      whyItMatters={guide.whyItMatters}
      takeaways={guide.takeaways}
      backHref={getVisualGuidesIndexHref(language.code)}
      nextHref={guide.nextHref}
      nextLabel={guide.nextLabel}
    >
      <BackLink href={getVisualGuidesIndexHref(language.code)} label="Visual guides" />

      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-2">
        <Card className="overflow-hidden">
          <CardHeader className="space-y-1.5">
            <CardTitle className="text-lg">{guide.frameLabel}</CardTitle>
            <CardDescription className="text-sm">
              A safe frame is not the whole language. It is the shortest bridge to useful speech.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {guide.frameTokens.map((token, index) => (
                <div key={`${token.label}-${index}`} className="flex items-center gap-2">
                  <div className="rounded-[18px] border border-[rgba(44,49,59,0.08)] bg-white/70 px-3 py-2 min-w-[132px]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-editorial-muted mb-1">
                      {token.label}
                    </p>
                    <p className="font-serif text-base text-editorial-ink">{token.value}</p>
                  </div>
                  {index < guide.frameTokens.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-editorial-muted" />
                  )}
                </div>
              ))}
            </div>

            <div className="rounded-[20px] border border-[rgba(44,49,59,0.08)] bg-editorial-green-soft/45 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-editorial-muted mb-1.5">
                First safe pattern
              </p>
              <p className="text-base font-serif text-editorial-ink">{guide.safePattern}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1.5">
            <div className="h-10 w-10 rounded-[14px] bg-editorial-blue-soft flex items-center justify-center">
              <Shapes className="h-5 w-5 text-editorial-blue" />
            </div>
            <CardTitle className="text-lg">Visual breakdown</CardTitle>
            <CardDescription className="text-sm">
              Use these three lenses to understand how the sentence behaves before you start stretching it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {guide.visualSections.map((section) => (
              <div key={section.title} className="rounded-[20px] border border-[rgba(44,49,59,0.08)] bg-white/72 p-3">
                <h3 className="font-serif text-base font-semibold text-editorial-ink mb-1.5">{section.title}</h3>
                <p className="text-sm text-editorial-muted leading-relaxed mb-2">{section.description}</p>
                <div className="space-y-1.5">
                  {section.items.map((item) => (
                    <div
                      key={item}
                      className="rounded-[14px] border border-[rgba(44,49,59,0.06)] bg-[rgba(255,255,255,0.72)] px-3 py-2 text-sm text-editorial-ink leading-relaxed"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <div className="max-w-2xl">
          <h2 className="text-xl font-serif font-semibold text-editorial-ink">
            First usable examples
          </h2>
          <p className="text-sm text-editorial-muted leading-relaxed">
            These are not fancy. That is the point. They give the learner something safe to say immediately.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {guide.examples.map((example) => (
            <Card key={example.native}>
              <CardContent className="p-3 space-y-1.5">
                <p className="text-lg font-serif font-semibold text-editorial-ink">{example.native}</p>
                <p className="text-sm text-editorial-muted">{example.english}</p>
                <div className="rounded-[16px] bg-editorial-amber-soft/45 px-3 py-2 text-sm text-editorial-ink leading-relaxed">
                  {example.note}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </GuidePageScaffold>
  )
}
