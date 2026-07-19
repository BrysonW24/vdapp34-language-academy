import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getLanguageConfig, langHref, SUPPORTED_LANGUAGES } from "@/lib/languages"
import { getAccent, getGradient } from "@/lib/language-visuals"
import { listScenarios, offlineTurn, resolveScenario } from "@/lib/coach-offline"
import { ConversationCoach } from "@/components/academy/coach/ConversationCoach"

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const language = getLanguageConfig(lang)
  if (!language) return { title: "Conversation Coach" }
  return {
    title: `${language.name} Conversation Coach`,
    description: `Practise speaking ${language.name} in a guided, scored AI conversation.`,
  }
}

export default async function CoachPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const language = getLanguageConfig(lang)
  if (!language) notFound()

  const scenarios = listScenarios(language.code)
  const scenario = resolveScenario(language.code)
  if (!scenario || scenarios.length === 0) notFound()

  const initial = offlineTurn(scenario, 0)

  return (
    <div className="container mx-auto max-w-2xl space-y-4 px-4 py-5">
      <Link
        href={langHref(language.code)}
        className="inline-flex items-center gap-1.5 text-sm text-editorial-muted transition-colors hover:text-editorial-ink"
      >
        <ArrowLeft className="h-4 w-4" /> {language.name} academy
      </Link>

      <section className="flex items-center gap-2.5">
        <span
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[11px] bg-editorial-green-soft text-xl"
          aria-hidden="true"
        >
          {language.flag}
        </span>
        <div className="min-w-0">
          <h1 className="font-serif text-lg font-semibold leading-tight text-editorial-ink">
            {language.name} Conversation
          </h1>
          <p className="text-[11px] leading-tight text-editorial-muted">
            Guided chat. Read the suggested line, hear it, get a match score.
          </p>
        </div>
      </section>

      <ConversationCoach
        language={language.code}
        languageName={language.learningName}
        accent={getAccent(language.code)}
        gradient={getGradient(language.code)}
        scenarios={scenarios}
        initialScenarioSlug={scenario.slug}
        initial={initial}
      />
    </div>
  )
}
