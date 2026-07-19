import Link from "next/link"
import { ArrowRight, Compass, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BackLink } from "@/components/academy/BackLink"
import {
  getGuideIndexIntro,
  getLanguageGuideIndexItems,
  getVisualGuidesIndexHref,
} from "@/lib/visual-guides"
import { getLanguageConfig, langHref, languageHasSurface, SUPPORTED_LANGUAGES } from "@/lib/languages"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.filter((lang) => languageHasSurface(lang, "guides")).map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const language = getLanguageConfig(lang)

  return {
    title: language ? `${language.name} Visual Guides` : "Visual Guides",
    description: language
      ? `Responsive visual guides that deconstruct ${language.learningName} for faster speaking progress.`
      : "Responsive visual learning guides.",
  }
}

export default async function VisualGuidesIndexPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const language = getLanguageConfig(lang)

  if (!language) notFound()
  if (!languageHasSurface(language.code, "guides")) notFound()

  const intro = getGuideIndexIntro(language.code)
  const guides = getLanguageGuideIndexItems(language.code)

  return (
    <div className="container mx-auto max-w-2xl space-y-4 px-4 py-5">
      <BackLink href={langHref(language.code)} label={`${language.name} academy`} />

      <section className="space-y-2">
        <Badge variant="default">Visual Guides</Badge>
        <div className="space-y-1.5">
          <h1 className="text-xl font-serif font-semibold text-editorial-ink tracking-tight">
            {intro.title}
          </h1>
          <p className="text-sm text-editorial-muted leading-relaxed">
            {intro.subtitle}
          </p>
          <p className="text-sm text-editorial-ink/80 leading-relaxed">
            {intro.summary}
          </p>
        </div>
      </section>

      <section>
        <Card className="overflow-hidden bg-white/76">
          <CardContent className="p-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-editorial-muted">
                Start First
              </p>
              <h2 className="text-base font-serif font-semibold text-editorial-ink">
                Begin with the shared speaking structure map
              </h2>
              <p className="text-sm text-editorial-muted leading-relaxed">
                This global guide explains how the four languages distribute speaking pressure before
                you drop into the language-specific sequence.
              </p>
            </div>
            <Link
              href="/speaking-structure"
              className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-editorial-green px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-editorial-green/20"
            >
              Open Speaking Structure <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2.5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-editorial-muted">
            Guide Sequence
          </p>
          <h2 className="text-lg font-serif font-semibold text-editorial-ink">
            Learn {language.learningName} in the right order
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {guides.map((guide) => (
            <Link key={guide.slug} href={guide.href} className="block group">
              <Card
                className="h-full overflow-hidden border-[rgba(44,49,59,0.08)] bg-white/78 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-editorial-hover"
                style={{ boxShadow: `0 24px 60px ${guide.color}10` }}
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ backgroundColor: `${guide.color}14`, color: guide.color }}
                    >
                      Step {guide.step}
                    </span>
                    <Sparkles className="h-4 w-4" style={{ color: guide.color }} />
                  </div>
                  <CardTitle className="text-lg">{guide.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {guide.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="rounded-[18px] border border-[rgba(44,49,59,0.08)] bg-white/72 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-editorial-muted">
                      Learner question
                    </p>
                    <p className="text-sm text-editorial-ink leading-relaxed">{guide.problem}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: guide.color }}>
                    Open guide <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <Card>
          <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-editorial-muted">
                Academy Flow
              </p>
              <p className="text-sm text-editorial-ink leading-relaxed">
                Use the guides to understand the structure, then drop back into words, phrases,
                topics, and later practice with a better mental model.
              </p>
            </div>
            <Link
              href={langHref(language.code)}
              className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-[rgba(44,49,59,0.08)] bg-white/72 px-5 py-3 text-sm font-semibold text-editorial-ink"
            >
              Back to {language.name} home <Compass className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
