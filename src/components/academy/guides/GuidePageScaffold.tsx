import Link from "next/link"
import { ArrowLeft, ArrowRight, Lightbulb } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface GuidePageScaffoldProps {
  badge: string
  title: string
  subtitle: string
  heroSummary: string
  whyItMatters: string
  takeaways: string[]
  backHref: string
  nextHref: string
  nextLabel: string
  children: React.ReactNode
}

export function GuidePageScaffold({
  badge,
  title,
  subtitle,
  heroSummary,
  whyItMatters,
  takeaways,
  backHref,
  nextHref,
  nextLabel,
  children,
}: GuidePageScaffoldProps) {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-10 space-y-8 sm:space-y-12">
      <section className="space-y-5 pt-8">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-editorial-muted hover:text-editorial-ink transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Visual Guides
        </Link>

        <div className="max-w-4xl space-y-4">
          <Badge variant="default">{badge}</Badge>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-semibold text-editorial-ink leading-[0.96] tracking-tight">
            {title}
          </h1>
          <p className="text-lg sm:text-xl text-editorial-muted leading-relaxed max-w-3xl">
            {subtitle}
          </p>
          <p className="text-base sm:text-lg text-editorial-ink/80 leading-relaxed max-w-3xl">
            {heroSummary}
          </p>
        </div>
      </section>

      {children}

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border-l-4 border-l-editorial-green">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-editorial-green" />
              Why This Matters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base leading-relaxed">{whyItMatters}</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Key Takeaways</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {takeaways.map((takeaway) => (
              <div
                key={takeaway}
                className="rounded-[16px] border border-[rgba(44,49,59,0.08)] bg-white/70 px-4 py-3 text-sm text-editorial-ink leading-relaxed"
              >
                {takeaway}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[28px] border border-[rgba(44,49,59,0.08)] bg-white/76 p-5 sm:p-6 shadow-editorial-soft">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-editorial-muted mb-2">
            Next Best Step
          </p>
          <p className="text-base sm:text-lg text-editorial-ink leading-relaxed">
            Keep the sequence moving instead of jumping back into isolated content buckets.
          </p>
        </div>
        <Link
          href={nextHref}
          className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-editorial-green px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-editorial-green/20"
        >
          {nextLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  )
}
