import { ArrowRightLeft, MessageCircleMore } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GuidePageScaffold } from "@/components/academy/guides/GuidePageScaffold"
import { GuideSequenceLadder } from "@/components/academy/guides/GuideSequenceLadder"
import { BackLink } from "@/components/academy/BackLink"
import { getPhraseToPatternGuide, getVisualGuidesIndexHref } from "@/lib/visual-guides"
import { getLanguageConfig, langHref, languageHasSurface, SUPPORTED_LANGUAGES } from "@/lib/languages"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.filter((lang) => languageHasSurface(lang, "guides")).map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const language = getLanguageConfig(lang)

  if (!language) {
    return {
      title: "Phrase to Pattern",
      description: "Turn fixed phrases into flexible speaking.",
    }
  }

  const guide = getPhraseToPatternGuide(language.code)

  return {
    title: `${language.name} ${guide.title}`,
    description: guide.heroSummary,
  }
}

export default async function PhraseToPatternGuidePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const language = getLanguageConfig(lang)

  if (!language) notFound()
  if (!languageHasSurface(language.code, "guides")) notFound()

  const guide = getPhraseToPatternGuide(language.code)
  const accentMap = {
    es: "#386a58",
    de: "#2f4f79",
    zh: "#a0453f",
    th: "#a16a1f",
    ko: "#c0392b",
    ja: "#9b3b8f",
    fr: "#2f5fa0",
    pt: "#1f8a5b",
    tr: "#7a4fa0",
    tl: "#1f7a8c",
    it: "#4a7a2f",
    hi: "#d4791f",
  } as const
  const accent = accentMap[language.code]

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
      <BackLink href={langHref(language.code, "guides")} label="Visual guides" />

      <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-2">
        <Card>
          <CardHeader className="space-y-1.5">
            <div
              className="h-10 w-10 rounded-[14px] flex items-center justify-center"
              style={{ backgroundColor: `${accent}14` }}
            >
              <ArrowRightLeft className="h-5 w-5" style={{ color: accent }} />
            </div>
            <CardTitle className="text-lg">The transformation ladder</CardTitle>
            <CardDescription className="text-sm">
              The learner should not jump from memorized phrase to free conversation in one leap.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GuideSequenceLadder steps={guide.ladder} accent={accent} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1.5">
            <div className="h-10 w-10 rounded-[14px] bg-editorial-blue-soft flex items-center justify-center">
              <MessageCircleMore className="h-5 w-5 text-editorial-blue" />
            </div>
            <CardTitle className="text-lg">How to deconstruct the pattern</CardTitle>
            <CardDescription className="text-sm">
              Each stage should feel like a controlled expansion, not a whole new grammar lesson.
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
            <div
              className="rounded-[22px] p-4 text-sm text-editorial-ink leading-relaxed"
              style={{ backgroundColor: `${accent}14` }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-editorial-muted mb-2">
                Live response rule
              </p>
              {guide.liveResponse}
            </div>
          </CardContent>
        </Card>
      </section>
    </GuidePageScaffold>
  )
}
