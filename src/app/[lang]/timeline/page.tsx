import Link from "next/link"
import { ArrowRight, Route, Sparkles, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getLanguageConfig, langHref, languageHasSurface, SUPPORTED_LANGUAGES } from "@/lib/languages"
import { getTimelinePlan } from "@/lib/timeline-plan"
import { notFound } from "next/navigation"
import { BackLink } from "@/components/academy/BackLink"

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.filter((lang) => languageHasSurface(lang, "timeline")).map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const language = getLanguageConfig(lang)

  return {
    title: language ? `${language.name} Timeline` : "Timeline",
    description: language
      ? `A guided ${language.learningName} path from first speaking frames to broader everyday communication.`
      : "A guided language-learning timeline.",
  }
}

export default async function TimelinePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const language = getLanguageConfig(lang)

  if (!language) notFound()
  if (!languageHasSurface(language.code, "timeline")) notFound()

  const plan = getTimelinePlan(language.code)

  return (
    <div className="container mx-auto max-w-2xl px-4 py-5 space-y-4">
      <BackLink href={langHref(language.code)} label={`${language.name} academy`} />

      <section className="relative overflow-hidden rounded-[20px] border border-[rgba(44,49,59,0.08)] bg-[linear-gradient(180deg,rgba(255,253,248,0.92),rgba(255,248,238,0.84))] p-4 shadow-editorial">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(233,220,184,0.42),transparent_30%),radial-gradient(circle_at_top_right,rgba(208,230,221,0.3),transparent_24%)]" />
        <div className="relative space-y-3">
          <div className="space-y-2">
            <Badge variant="secondary">{plan.eyebrow}</Badge>
            <h1 className="text-xl font-serif font-semibold text-editorial-ink leading-tight tracking-tight">
              {plan.title}
            </h1>
            <p className="text-sm text-editorial-muted leading-relaxed">
              {plan.subtitle}
            </p>
            <p className="text-sm text-editorial-ink/80 leading-relaxed">
              {plan.heroSummary}
            </p>
          </div>

          <Card className="border-[rgba(44,49,59,0.08)] bg-white/76">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-editorial-green">
                <Route className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-editorial-muted">
                  Start Here
                </p>
              </div>
              <CardTitle className="text-base">Begin with the shared speaking engine</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {plan.startDetail}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-editorial-muted leading-relaxed">
                The timeline stays grounded in the real app: guides first, then the strongest content
                surfaces that currently exist for {language.learningName}.
              </div>
              <Link
                href={plan.startHref}
                className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-editorial-green px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-editorial-green/20"
              >
                {plan.startLabel} <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {plan.checkpoints.map((checkpoint, index) => (
          <Card
            key={checkpoint.title}
            className="border-[rgba(44,49,59,0.08)] bg-white/78"
            style={{ boxShadow: `0 18px 40px rgba(87, 73, 47, 0.08)` }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline">Checkpoint {index + 1}</Badge>
                <Target className="h-4 w-4 text-editorial-green" />
              </div>
              <CardTitle className="text-lg">{checkpoint.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">{checkpoint.body}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-2">
        <Card className="border-[rgba(44,49,59,0.08)] bg-white/78">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{plan.coverageTitle}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {plan.coverageBody}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-[14px] border border-[rgba(44,49,59,0.08)] bg-white/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-editorial-muted mb-1.5">
                Product rule
              </p>
              <p className="text-sm text-editorial-ink leading-relaxed">
                Do not jump straight into content inventory. Follow the sequence so each new surface
                lands inside a mental model that already works.
              </p>
            </div>
            <div className="rounded-[14px] border border-[rgba(44,49,59,0.08)] bg-white/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-editorial-muted mb-1.5">
                Current best loop
              </p>
              <p className="text-sm text-editorial-ink leading-relaxed">
                Guide first, then high-frequency words, then whichever topic, grammar, or phrase
                surface is already strongest for this track.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[rgba(44,49,59,0.08)] bg-white/78">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">What is available today</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              The timeline is grounded in the current academy, not an imagined future app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {plan.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[14px] border border-[rgba(44,49,59,0.08)] bg-white/72 px-3 py-2"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-editorial-muted">
                    {stat.label}
                  </p>
                  <p className="text-lg font-serif font-semibold text-editorial-ink">{stat.value}</p>
                </div>
                <p className="mt-1 text-sm text-editorial-ink/85 leading-relaxed">{stat.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-editorial-muted">
            The Path
          </p>
          <h2 className="text-lg font-serif font-semibold text-editorial-ink">
            The smartest order for learning {language.learningName}
          </h2>
          <p className="text-editorial-muted text-sm leading-relaxed">
            Each stage tells you what to solve next, why it belongs there, and which surface in the
            academy should carry the work.
          </p>
        </div>

        <div className="space-y-3">
          {plan.stages.map((stage) => (
            <Card
              key={stage.step}
              className="overflow-hidden border-[rgba(44,49,59,0.08)] bg-white/80"
              style={{ boxShadow: `0 22px 54px ${stage.accent}12` }}
            >
              <CardHeader className="space-y-2">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
                      style={{ backgroundColor: `${stage.accent}14`, color: stage.accent }}
                    >
                      {stage.step}
                    </span>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-editorial-muted">
                        {stage.eyebrow}
                      </p>
                      <CardTitle className="text-base">{stage.title}</CardTitle>
                    </div>
                  </div>
                  <Sparkles className="h-4 w-4 text-editorial-muted" />
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {stage.summary}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-[14px] border border-[rgba(44,49,59,0.08)] bg-white/70 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-editorial-muted mb-1.5">
                      Objective
                    </p>
                    <p className="text-sm text-editorial-ink leading-relaxed">
                      {stage.objective}
                    </p>
                  </div>
                  <div className="rounded-[14px] border border-[rgba(44,49,59,0.08)] bg-white/70 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-editorial-muted mb-1.5">
                      Success signal
                    </p>
                    <p className="text-sm text-editorial-ink leading-relaxed">
                      {stage.successSignal}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-editorial-muted">
                    Use these surfaces now
                  </p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {stage.actions.map((action) => (
                      <Link
                        key={`${stage.step}-${action.href}-${action.label}`}
                        href={action.href}
                        className="group rounded-[14px] border border-[rgba(44,49,59,0.08)] bg-white/72 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-editorial-soft"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className="text-sm font-semibold leading-snug"
                            style={{ color: action.accent }}
                          >
                            {action.label}
                          </p>
                          <ArrowRight
                            className="h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
                            style={{ color: action.accent }}
                          />
                        </div>
                        <p className="mt-1.5 text-sm text-editorial-ink/85 leading-relaxed">
                          {action.detail}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>

                {stage.note ? (
                  <div className="rounded-[14px] border border-[rgba(44,49,59,0.08)] bg-[rgba(247,243,234,0.92)] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-editorial-muted mb-1.5">
                      Honest note
                    </p>
                    <p className="text-sm text-editorial-ink leading-relaxed">{stage.note}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
