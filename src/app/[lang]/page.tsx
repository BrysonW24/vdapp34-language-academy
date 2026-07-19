import Link from "next/link"
import { ArrowRight, BookOpen, Globe, GraduationCap, Languages, MessageSquare, Smile, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { getAcademyStats, getWords, getSlangPacks } from "@/lib/academy-content"
import { WordGroupLadder } from "@/components/academy/WordGroupLadder"
import { VoicePicker } from "@/components/academy/VoicePicker"
import { getAccent, getGradient } from "@/lib/language-visuals"
import {
  getLanguageConfig,
  langHref,
  languageHasSurface,
  SUPPORTED_LANGUAGES,
  type LanguageSurface,
} from "@/lib/languages"
import { getVisualGuidesIndexHref } from "@/lib/visual-guides"
import { TARGET_COUNTS, WORD_GROUPS } from "@/types/academy"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const language = getLanguageConfig(lang)

  if (!language) {
    return { title: "Academy" }
  }

  return {
    title: language.academyName,
    description: language.description,
  }
}

export default async function LanguageHomePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const language = getLanguageConfig(lang)

  if (!language) notFound()

  const stats = getAcademyStats(language.code)
  const words = getWords(language.code)
  const gradient = getGradient(language.code)
  const groupCounts = WORD_GROUPS.map((group) => ({
    ...group,
    count: words.filter((word) => word.group === group.id).length,
  }))

  const allSections: Array<{
    href: string
    label: string
    desc: string
    icon: typeof BookOpen
    color: string
    surface: LanguageSurface
  }> = [
    {
      href: langHref(language.code, "words"),
      label: "1000 Words",
      desc: "Ranked vocabulary",
      icon: BookOpen,
      color: "#386a58",
      surface: "words",
    },
    {
      href: langHref(language.code, "topics"),
      label: "Topics",
      desc: "Real-life lessons",
      icon: Globe,
      color: "#2f4f79",
      surface: "topics",
    },
    {
      href: langHref(language.code, "grammar"),
      label: "Grammar",
      desc: "Rules and patterns",
      icon: Languages,
      color: "#6d28d9",
      surface: "grammar",
    },
    {
      href: langHref(language.code, "phrases"),
      label: "Phrases",
      desc: "Ready-made phrases",
      icon: MessageSquare,
      color: "#a16a1f",
      surface: "phrases",
    },
    {
      href: langHref(language.code, "practice"),
      label: "Practice",
      desc: "Quizzes and drills",
      icon: GraduationCap,
      color: "#a0453f",
      surface: "practice",
    },
    {
      href: langHref(language.code, "slang"),
      label: "Slang",
      desc: "Everyday slang",
      icon: Smile,
      color: "#b5651d",
      surface: "slang",
    },
  ]

  const hasSlang = languageHasSurface(language.code, "slang") && getSlangPacks(language.code).length > 0
  const sections = allSections.filter((section) =>
    section.surface === "slang" ? hasSlang : languageHasSurface(language.code, section.surface)
  )
  const hasWordsSurface = languageHasSurface(language.code, "words")
  const hasGuidesSurface = languageHasSurface(language.code, "guides")

  const otherLanguages = SUPPORTED_LANGUAGES.filter((code) => code !== language.code).map(
    (code) => getLanguageConfig(code)!
  )

  return (
    <div className="container mx-auto px-4 py-5 max-w-2xl space-y-5">
      <section className="space-y-2.5 pt-1">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[13px] bg-editorial-green-soft text-2xl"
            aria-hidden="true"
          >
            {language.flag}
          </span>
          <div className="min-w-0">
            <p className="text-xs italic leading-none text-editorial-muted mb-1">{language.nativeName}</p>
            <h1 className="text-xl sm:text-2xl font-serif font-semibold text-editorial-ink leading-none">
              {language.name}
            </h1>
          </div>
        </div>
        <p className="text-sm text-editorial-muted leading-relaxed">{language.description}</p>
        {hasGuidesSurface && (
          <Link
            href={getVisualGuidesIndexHref(language.code)}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(44,49,59,0.08)] bg-white/72 px-3.5 py-1.5 text-sm font-medium text-editorial-ink shadow-editorial-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
          >
            Explore the visual guides <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </section>

      <Link
        href={langHref(language.code, "coach")}
        className="group relative flex items-center gap-3 overflow-hidden rounded-[14px] px-3.5 py-2.5 text-white shadow-editorial-soft transition-all duration-300 hover:-translate-y-0.5"
        style={{ backgroundImage: gradient }}
      >
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" aria-hidden="true" />
        <span className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="relative min-w-0 flex-1">
          <span className="block text-sm font-semibold leading-tight">Practise with the AI coach</span>
          <span className="block text-[11px] leading-tight text-white/85">Speak a real conversation, hear every line, get scored</span>
        </span>
        <ArrowRight className="relative h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
      </Link>

      <VoicePicker language={language.code} languageName={language.name} accent={getAccent(language.code)} />

      <section className="grid grid-cols-4 gap-2">
        {[
          { label: "Words", value: stats.words },
          { label: "Topics", value: stats.topics },
          { label: "Grammar", value: stats.grammar },
          { label: "Phrases", value: stats.phrases },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[11px] border border-[rgba(44,49,59,0.08)] bg-white/60 px-2 py-2 text-center"
          >
            <p className="font-serif text-lg leading-none text-editorial-ink">{stat.value}</p>
            <p className="mt-1 text-[10px] text-editorial-muted">{stat.label}</p>
          </div>
        ))}
      </section>

      {stats.words < TARGET_COUNTS.words && (
        <Card className="max-w-3xl border-l-4 border-l-editorial-amber">
          <CardContent className="p-6 space-y-2">
            <p className="font-serif font-semibold text-editorial-ink">Current import status</p>
            <p className="text-editorial-muted leading-relaxed">
              {language.name} currently has {stats.words} of {TARGET_COUNTS.words} words loaded in the unified app.
              The shared structure is ready, so we can keep filling content without touching the UI again.
            </p>
          </CardContent>
        </Card>
      )}

      {hasWordsSurface && (
      <section className="space-y-2.5">
        <div>
          <h2 className="text-lg font-serif font-semibold text-editorial-ink">The Pareto Ladder</h2>
          <p className="text-sm text-editorial-muted">Five frequency tiers from survival language to confident expression.</p>
        </div>
        <WordGroupLadder
          groups={groupCounts.map((group) => ({
            id: group.id,
            name: group.name,
            range: group.range,
            desc: group.desc,
            color: group.color,
            count: group.count,
            href: langHref(language.code, `words/${group.id}`),
          }))}
        />
      </section>
      )}

      {sections.length > 0 && (
      <section className="space-y-2.5">
        <h2 className="text-lg font-serif font-semibold text-editorial-ink">Explore the Academy</h2>
        <div className="grid grid-cols-2 gap-2">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <Link
                key={section.href}
                href={section.href}
                className="group flex items-center gap-2.5 rounded-[12px] border border-[rgba(44,49,59,0.08)] bg-white/60 px-3 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
              >
                <span
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px]"
                  style={{ backgroundColor: `${section.color}15` }}
                >
                  <Icon className="h-4 w-4" style={{ color: section.color }} />
                </span>
                <span className="min-w-0">
                  <span className="block font-serif text-sm font-semibold leading-tight text-editorial-ink">{section.label}</span>
                  <span className="block text-[11px] leading-tight text-editorial-muted">{section.desc}</span>
                </span>
              </Link>
            )
          })}
        </div>
      </section>
      )}

      <section className="space-y-2.5">
        <h2 className="text-lg font-serif font-semibold text-editorial-ink">Switch Languages</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {otherLanguages.map((item) => (
            <Link
              key={item.code}
              href={langHref(item.code)}
              className="group flex items-center gap-2.5 rounded-[12px] border border-[rgba(44,49,59,0.08)] bg-white/60 px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
            >
              <span className="flex-shrink-0 text-lg" aria-hidden="true">{item.flag}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-serif text-sm font-semibold leading-tight text-editorial-ink">{item.name}</span>
                <span className="block truncate text-[11px] italic leading-tight text-editorial-muted">{item.nativeName}</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-editorial-muted transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
