import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { getPhrasePacks } from "@/lib/academy-content"
import { getLanguageConfig, langHref, languageHasSurface, SUPPORTED_LANGUAGES } from "@/lib/languages"
import { notFound } from "next/navigation"
import { BackLink } from "@/components/academy/BackLink"
import { AcademyAccordion } from "@/components/academy/AcademyAccordion"
import { getAccent } from "@/lib/language-visuals"

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES
    .filter((lang) => languageHasSurface(lang, "phrases"))
    .map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const language = getLanguageConfig(lang)

  return {
    title: language ? `${language.name} Phrases` : "Phrases",
    description: language
      ? `Ready-to-use ${language.learningName} phrase packs for common situations.`
      : "Ready-to-use phrase packs.",
  }
}

export default async function PhrasesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const language = getLanguageConfig(lang)

  if (!language) notFound()
  if (!languageHasSurface(language.code, "phrases")) notFound()

  const packs = getPhrasePacks(language.code)

  return (
    <div className="container mx-auto max-w-2xl space-y-4 px-4 py-5">
      <BackLink href={langHref(language.code)} label={`${language.name} academy`} />

      <div>
        <h1 className="font-serif text-xl font-semibold text-editorial-ink">
          {language.name} Phrase Packs
        </h1>
        <p className="text-sm leading-relaxed text-editorial-muted">
          Ready-to-use phrases for common real-life situations and travel moments.
        </p>
      </div>

      {packs.length === 0 ? (
        <Card className="p-4 text-center">
          <p className="text-sm text-editorial-muted">
            Phrase packs for {language.name} are still on the way. Start with high-frequency words for now.
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
          items={packs.map((pack) => ({
            id: pack.slug,
            emoji: "💬",
            title: pack.title,
            rightLabel: `${pack.phrases.length} phrases`,
            meta: pack.situation,
            description: pack.description,
            href: langHref(language.code, `phrases/${pack.slug}`),
            cta: "View phrases",
          }))}
        />
      )}
    </div>
  )
}
