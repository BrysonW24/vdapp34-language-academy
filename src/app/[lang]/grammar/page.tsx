import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { BackLink } from "@/components/academy/BackLink"
import { AcademyAccordion } from "@/components/academy/AcademyAccordion"
import { getAccent } from "@/lib/language-visuals"
import { getGrammarRules } from "@/lib/academy-content"
import { getLanguageConfig, langHref, languageHasSurface, SUPPORTED_LANGUAGES } from "@/lib/languages"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES
    .filter((lang) => languageHasSurface(lang, "grammar"))
    .map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const language = getLanguageConfig(lang)

  return {
    title: language ? `${language.name} Grammar` : "Grammar",
    description: language
      ? `Essential ${language.learningName} grammar rules with patterns, examples, and learning notes.`
      : "Essential grammar rules.",
  }
}

export default async function GrammarPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const language = getLanguageConfig(lang)

  if (!language) notFound()
  if (!languageHasSurface(language.code, "grammar")) notFound()

  const rules = getGrammarRules(language.code)

  return (
    <div className="container mx-auto max-w-2xl space-y-4 px-4 py-5">
      <BackLink href={langHref(language.code)} label={`${language.name} academy`} />

      <div>
        <h1 className="font-serif text-xl font-semibold text-editorial-ink">{language.name} Grammar</h1>
        <p className="text-sm leading-relaxed text-editorial-muted">
          Essential rules, patterns, and examples to help your vocabulary turn into real sentences.
        </p>
      </div>

      {rules.length === 0 ? (
        <Card className="p-4 text-center">
          <p className="text-sm text-editorial-muted">
            Grammar content for {language.name} is still being added. Start with the word ladder for now.
          </p>
          <Link
            href={langHref(language.code, "words")}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-editorial-green transition-all hover:gap-2.5"
          >
            Browse words <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>
      ) : (
        <AcademyAccordion
          accent={getAccent(language.code)}
          items={rules.map((rule) => ({
            id: rule.slug,
            rank: `#${rule.order}`,
            title: rule.name,
            subtitle: rule.nativeName !== rule.name ? rule.nativeName : undefined,
            rightLabel: rule.level,
            meta: [
              `${rule.examples.length} examples`,
              rule.conjugation ? "Forms" : null,
              rule.cases ? "Cases" : null,
            ]
              .filter(Boolean)
              .join(" · "),
            description: rule.summary,
            href: langHref(language.code, `grammar/${rule.slug}`),
            cta: "Study rule",
          }))}
        />
      )}
    </div>
  )
}
