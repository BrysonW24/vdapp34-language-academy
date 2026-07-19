import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getAcademyStats } from "@/lib/academy-content"
import { getLanguageConfig, SUPPORTED_LANGUAGES } from "@/lib/languages"
import { LanguagePicker, type PickerLanguage } from "@/components/academy/LanguagePicker"
import { WordsTile, ConversationTile, PathTile } from "@/components/academy/FeatureTiles"
import { getAccent, getGradient } from "@/lib/language-visuals"

export const metadata = {
  title: "Choose a Language",
  description: "Pick a language and enter the shared academy experience.",
}

export default function HomePage() {
  const languages: PickerLanguage[] = SUPPORTED_LANGUAGES.map((code) => {
    const config = getLanguageConfig(code)!
    const stats = getAcademyStats(code)
    const lessons = stats.topics + stats.grammar + stats.phrases
    const status: PickerLanguage["status"] = lessons > 0 ? "full" : stats.words > 0 ? "words" : "soon"
    return {
      code,
      name: config.name,
      nativeName: config.nativeName,
      flag: config.flag,
      accent: getAccent(code),
      gradient: getGradient(code),
      description: config.description,
      stats,
      total: stats.words + lessons,
      status,
    }
  })

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl space-y-7">
      <section className="space-y-3 pt-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-editorial-ink leading-tight tracking-tight">
          Choose the language you want to learn
        </h1>
        <p className="text-base text-editorial-muted leading-relaxed">
          Words, topics, grammar, phrases, and spoken practice, all from one shared academy.
        </p>

        {/* Expressive language strip: real scripts of every track on offer */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {languages.map((lang) => (
            <span
              key={lang.code}
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
              style={{
                borderColor: `${lang.accent}33`,
                backgroundColor: `${lang.accent}0d`,
                color: lang.accent,
              }}
            >
              <span aria-hidden="true">{lang.flag}</span>
              <span className="font-medium">{lang.nativeName}</span>
            </span>
          ))}
        </div>

        <Link
          href="/speaking-structure"
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(44,49,59,0.08)] bg-white/72 px-3.5 py-1.5 text-sm font-medium text-editorial-ink shadow-editorial-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
        >
          View the speaking structure map <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <LanguagePicker languages={languages} />

      <section className="space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-editorial-muted">
          Why Language Academy
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <WordsTile />
          <ConversationTile />
          <PathTile />
        </div>
      </section>
    </div>
  )
}
