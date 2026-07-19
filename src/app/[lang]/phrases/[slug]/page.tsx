import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPhrasePack, getPhrasePacks } from "@/lib/academy-content"
import { getLanguageConfig, langHref, languageHasSurface, SUPPORTED_LANGUAGES } from "@/lib/languages"
import { notFound } from "next/navigation"
import { BackLink } from "@/components/academy/BackLink"

const FORMALITY_STYLES: Record<string, { variant: "beginner" | "intermediate" | "outline"; label: string }> = {
  formal: { variant: "intermediate", label: "Formal" },
  informal: { variant: "beginner", label: "Informal" },
  neutral: { variant: "outline", label: "Neutral" },
}

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES
    .filter((lang) => languageHasSurface(lang, "phrases"))
    .flatMap((lang) => getPhrasePacks(lang).map((pack) => ({ lang, slug: pack.slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  const language = getLanguageConfig(lang)
  const pack = language ? getPhrasePack(language.code, slug) : null

  if (!pack) return { title: "Phrase Pack" }

  return {
    title: `${pack.title} | ${language?.name ?? "Academy"}`,
    description: pack.description,
  }
}

export default async function PhrasePackDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  const language = getLanguageConfig(lang)

  if (!language) notFound()
  if (!languageHasSurface(language.code, "phrases")) notFound()

  const pack = getPhrasePack(language.code, slug)
  if (!pack) notFound()

  return (
    <div className="container mx-auto max-w-2xl space-y-4 px-4 py-5">
      <BackLink href={langHref(language.code, "phrases")} label="Phrases" />

      <div className="space-y-2">
        <h1 className="text-xl font-serif font-semibold text-editorial-ink">{pack.title}</h1>
        <p className="text-sm leading-relaxed text-editorial-muted">{pack.description}</p>
        <Badge variant="secondary">{pack.situation}</Badge>
      </div>

      <div className="space-y-2">
        {pack.phrases.map((phrase, index) => {
          const formality = FORMALITY_STYLES[phrase.formality] ?? FORMALITY_STYLES.neutral

          return (
            <Card key={`${pack.slug}-phrase-${index}`} className="hover:shadow-editorial-hover transition-all duration-200">
              <CardContent className="p-3 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-serif font-semibold text-editorial-ink">{phrase.native}</p>
                    <p className="text-sm text-editorial-muted mt-1">{phrase.english}</p>
                  </div>
                  <Badge variant={formality.variant} className="flex-shrink-0">
                    {formality.label}
                  </Badge>
                </div>

                {phrase.pronunciation && (
                  <p className="text-sm text-editorial-muted italic">{phrase.pronunciation}</p>
                )}

                {phrase.tip && (
                  <div className="p-3 rounded-[12px] bg-editorial-green-soft/40">
                    <p className="text-sm text-editorial-green">
                      <strong>Tip:</strong> {phrase.tip}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
