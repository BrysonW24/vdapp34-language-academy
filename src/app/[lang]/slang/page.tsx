import { notFound } from "next/navigation"
import { Info } from "lucide-react"
import { getLanguageConfig, langHref, languageHasSurface, SUPPORTED_LANGUAGES } from "@/lib/languages"
import { getSlangPacks } from "@/lib/academy-content"
import { BackLink } from "@/components/academy/BackLink"
import { SpeakButton } from "@/components/academy/SpeakButton"

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.filter(
    (lang) => languageHasSurface(lang, "slang") && getSlangPacks(lang).length > 0
  ).map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const language = getLanguageConfig(lang)
  return {
    title: language ? `${language.name} Slang` : "Slang",
    description: language
      ? `Everyday ${language.learningName} slang and colloquial expressions real speakers actually use.`
      : "Everyday slang and colloquial expressions.",
  }
}

export default async function SlangPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const language = getLanguageConfig(lang)

  if (!language) notFound()
  if (!languageHasSurface(language.code, "slang")) notFound()

  const packs = getSlangPacks(language.code)
  if (packs.length === 0) notFound()

  const phrases = packs.flatMap((pack) => pack.phrases)

  return (
    <div className="container mx-auto max-w-2xl space-y-4 px-4 py-5">
      <BackLink href={langHref(language.code)} label={`${language.name} academy`} />

      <div>
        <h1 className="font-serif text-xl font-semibold text-editorial-ink">{language.name} Slang</h1>
        <p className="text-sm leading-relaxed text-editorial-muted">
          Everyday colloquial expressions real speakers actually use.
        </p>
      </div>

      {/* Honest caveat: slang is regional, generational, and fast-moving. */}
      <div className="flex items-start gap-2 rounded-[12px] border border-[rgba(44,49,59,0.08)] border-l-2 border-l-editorial-amber bg-white/60 px-3 py-2">
        <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-editorial-amber" />
        <p className="text-[12px] leading-snug text-editorial-muted">
          Our best crack at it. Slang shifts by region, age, and even the year, so a few of these may be off or a little
          dated. Treat it as a starting point and check with a local before you drop one in a serious moment.
        </p>
      </div>

      <div className="overflow-hidden rounded-[16px] border border-[rgba(44,49,59,0.1)] bg-white/55 divide-y divide-[rgba(44,49,59,0.08)]">
        {phrases.map((phrase, i) => (
          <div key={`${phrase.native}-${i}`} className="space-y-0.5 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 font-serif text-[15px] font-semibold text-editorial-ink">
                {phrase.native}
              </span>
              <SpeakButton text={phrase.native} language={language.code} size="sm" className="flex-shrink-0" />
            </div>
            {phrase.pronunciation && (
              <p className="text-[11px] italic leading-tight text-editorial-muted">{phrase.pronunciation}</p>
            )}
            <p className="text-[13px] leading-snug text-editorial-ink">{phrase.english}</p>
            {phrase.tip && <p className="text-[11px] leading-snug text-editorial-muted">{phrase.tip}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
