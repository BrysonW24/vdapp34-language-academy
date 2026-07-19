import Link from "next/link"
import { ArrowRight, Lightbulb, Scale } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BackLink } from "@/components/academy/BackLink"
import { GuidePressureRows } from "@/components/academy/guides/GuidePressureRows"
import { getMeaningLoadGuide, getVisualGuidesIndexHref } from "@/lib/visual-guides"
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
      title: "Meaning Load",
      description: "See where meaning lives in the language.",
    }
  }

  const guide = getMeaningLoadGuide(language.code)

  return {
    title: `${language.name} ${guide.title}`,
    description: guide.heroSummary,
  }
}

export default async function MeaningLoadGuidePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const language = getLanguageConfig(lang)

  if (!language) notFound()
  if (!languageHasSurface(language.code, "guides")) notFound()

  const guide = getMeaningLoadGuide(language.code)
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
    <div className="container mx-auto max-w-2xl space-y-4 px-4 py-5">
      <BackLink href={getVisualGuidesIndexHref(language.code)} label="Visual guides" />

      <section className="space-y-2">
        <Badge variant="default">{`${language.name} Guide`}</Badge>
        <h1 className="font-serif text-xl font-semibold leading-tight text-editorial-ink">{guide.title}</h1>
        <p className="text-sm leading-relaxed text-editorial-muted">{guide.subtitle}</p>
        <p className="text-sm leading-relaxed text-editorial-ink/80">{guide.heroSummary}</p>
      </section>

      <section className="grid grid-cols-1 gap-2 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader className="space-y-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-[14px]"
              style={{ backgroundColor: `${accent}14` }}
            >
              <Scale className="h-5 w-5" style={{ color: accent }} />
            </div>
            <CardTitle className="text-lg">Where meaning really sits</CardTitle>
            <CardDescription className="text-sm">
              Learners go faster when they stop distributing effort evenly and start training the systems that carry the most meaning pressure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GuidePressureRows rows={guide.loadRows} color={accent} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-lg">How to read the pressure</CardTitle>
            <CardDescription className="text-sm">
              Use these categories to decide what deserves daily repetition and what can wait.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {guide.visualSections.map((section) => (
              <div key={section.title} className="rounded-[20px] border border-[rgba(44,49,59,0.08)] bg-white/72 p-3">
                <h3 className="mb-1.5 font-serif text-base font-semibold text-editorial-ink">{section.title}</h3>
                <p className="mb-2 text-sm leading-relaxed text-editorial-muted">{section.description}</p>
                <div className="space-y-1.5">
                  {section.items.map((item) => (
                    <div
                      key={item}
                      className="rounded-[14px] border border-[rgba(44,49,59,0.06)] bg-[rgba(255,255,255,0.72)] px-3 py-2 text-sm leading-relaxed text-editorial-ink"
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

      <section>
        <Card className="border-l-4" style={{ borderLeftColor: accent }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Do not over-focus here yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-editorial-muted">{guide.avoidEarly}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        <Card className="border-l-4 border-l-editorial-green">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-editorial-green" />
              Why This Matters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm leading-relaxed">{guide.whyItMatters}</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Key Takeaways</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {guide.takeaways.map((takeaway) => (
              <div
                key={takeaway}
                className="rounded-[16px] border border-[rgba(44,49,59,0.08)] bg-white/70 px-3 py-2 text-sm leading-relaxed text-editorial-ink"
              >
                {takeaway}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3 rounded-[20px] border border-[rgba(44,49,59,0.08)] bg-white/76 p-3 shadow-editorial-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-editorial-muted">Next Best Step</p>
          <p className="text-sm leading-relaxed text-editorial-ink">
            Keep the sequence moving instead of jumping back into isolated content buckets.
          </p>
        </div>
        <Link
          href={guide.nextHref}
          className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-editorial-green px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-editorial-green/20"
        >
          {guide.nextLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  )
}
