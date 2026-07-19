import { ArrowRight, AudioLines, Languages, MessageCircleMore, Shapes, Sparkles } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getVisualGuidesIndexHref, getVisualGuideHref } from "@/lib/visual-guides"
import { getLanguageConfig, SUPPORTED_LANGUAGES } from "@/lib/languages"

export const metadata = {
  title: "Speaking Structure",
  description:
    "A responsive visual map of how speaking works across Spanish, German, Chinese, and Thai.",
}

const LANGUAGE_PRESSURE = [
  {
    name: "Spanish",
    accent: "#386a58",
    headline: "Speech flows when the sentence agrees",
    summary:
      "Spanish is fairly forgiving about basic order, but it asks the speaker to keep endings, gender, number, and verb choice aligned in real time.",
    load: "Agreement, verb forms, ser vs estar, article and noun matching.",
    entry: "Start with reusable phrases, then swap subjects, verbs, and details.",
    weight: [
      { label: "Meaning", value: 4 },
      { label: "Order", value: 3 },
      { label: "Sound", value: 2 },
      { label: "Social", value: 2 },
    ],
  },
  {
    name: "German",
    accent: "#2f4f79",
    headline: "Speech flows when the architecture holds",
    summary:
      "German often feels logical, but speaking quickly means tracking where the verb goes, which article belongs, and how the sentence frame stays intact.",
    load: "Verb position, case, article choice, noun gender, sentence frame.",
    entry: "Practice small frames aloud until order feels automatic instead of intellectual.",
    weight: [
      { label: "Meaning", value: 4 },
      { label: "Order", value: 5 },
      { label: "Sound", value: 2 },
      { label: "Social", value: 2 },
    ],
  },
  {
    name: "Chinese",
    accent: "#a0453f",
    headline: "Speech flows when sound and pattern stay clean",
    summary:
      "Mandarin carries less weight in inflection, but more weight in stable order, tone control, particles, aspect markers, and measure-word habits.",
    load: "Tone, sequence, particles, classifiers, speaking in fixed patterns.",
    entry: "Memorize whole speaking chunks and practice tones inside those chunks.",
    weight: [
      { label: "Meaning", value: 4 },
      { label: "Order", value: 4 },
      { label: "Sound", value: 5 },
      { label: "Social", value: 3 },
    ],
  },
  {
    name: "Thai",
    accent: "#a16a1f",
    headline: "Speech flows when tone and social finish feel right",
    summary:
      "Thai can look compact on the page, but natural speech depends on tone, particles, rhythm, classifier use, and choosing forms that fit the relationship.",
    load: "Tone, politeness particles, pronoun choice, classifier habits, role awareness.",
    entry: "Practice language as social scenes, not just vocabulary lists.",
    weight: [
      { label: "Meaning", value: 4 },
      { label: "Order", value: 3 },
      { label: "Sound", value: 5 },
      { label: "Social", value: 5 },
    ],
  },
] as const

const LEARNING_SEQUENCE = [
  {
    title: "Hear a useful phrase",
    body: "Start from language that already lives in a human situation.",
    icon: AudioLines,
  },
  {
    title: "Repeat the chunk",
    body: "Build rhythm and sound before over-explaining the rule.",
    icon: MessageCircleMore,
  },
  {
    title: "Notice the pattern",
    body: "Point out what changes and what stays fixed.",
    icon: Shapes,
  },
  {
    title: "Swap one piece",
    body: "Change the subject, verb, object, or tone while keeping the frame.",
    icon: Languages,
  },
  {
    title: "Use it live",
    body: "Turn the pattern into a real response with context and pressure.",
    icon: Sparkles,
  },
] as const

export default function SpeakingStructurePage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-10 space-y-10 sm:space-y-14">
      <section className="relative overflow-hidden rounded-[32px] border border-[rgba(44,49,59,0.08)] bg-[linear-gradient(180deg,rgba(255,253,248,0.9),rgba(255,248,238,0.82))] p-6 sm:p-8 lg:p-10 shadow-editorial">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(233,220,184,0.42),transparent_28%),radial-gradient(circle_at_top_right,rgba(208,230,221,0.36),transparent_26%)]" />
        <div className="relative space-y-6">
          <Badge variant="secondary">Speaking Structure Map</Badge>
          <div className="max-w-5xl space-y-4">
            <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-editorial-ink leading-[0.94] tracking-tight">
              How speaking is built across four languages
            </h1>
            <p className="max-w-3xl text-lg sm:text-xl text-editorial-muted leading-relaxed">
              All speaking is the same job underneath: express meaning, arrange a usable sentence,
              control sound, and land it naturally with another person.
            </p>
          </div>

          <Card className="max-w-5xl bg-white/72">
            <CardHeader className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-editorial-muted">
                The Shared Engine
              </p>
              <CardTitle className="text-2xl sm:text-3xl leading-none">
                {"Intent -> pattern -> pronunciation -> response"}
              </CardTitle>
              <CardDescription className="max-w-3xl text-base sm:text-lg">
                What changes from language to language is where the pressure sits. Spanish and
                German ask more from grammar structure. Chinese and Thai ask more from tone,
                particles, and situational feel.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {[
                { label: "Meaning", tone: "rgba(56,106,88,0.12)", color: "#386a58" },
                { label: "Order", tone: "rgba(47,79,121,0.12)", color: "#2f4f79" },
                { label: "Sound", tone: "rgba(160,69,63,0.12)", color: "#a0453f" },
                { label: "Social", tone: "rgba(161,106,31,0.12)", color: "#a16a1f" },
              ].map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold"
                  style={{ backgroundColor: item.tone, color: item.color }}
                >
                  {item.label}
                </span>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-editorial-muted">
              Where The Weight Sits
            </p>
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-editorial-ink">
              Each language carries pressure differently
            </h2>
          </div>
          <p className="max-w-xl text-sm sm:text-base text-editorial-muted leading-relaxed">
            These cards intentionally reflow from one column on mobile to two on larger screens, so
            the structure stays readable instead of clipping.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
          {LANGUAGE_PRESSURE.map((language) => (
            <Card
              key={language.name}
              className="overflow-hidden border-[rgba(44,49,59,0.08)] bg-white/78"
              style={{ boxShadow: `0 24px 60px ${language.accent}12` }}
            >
              <CardHeader className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold"
                    style={{
                      backgroundColor: `${language.accent}14`,
                      color: language.accent,
                    }}
                  >
                    {language.name}
                  </span>
                </div>
                <CardTitle className="text-xl sm:text-2xl leading-[1.02] max-w-xl">
                  {language.headline}
                </CardTitle>
                <CardDescription className="max-w-xl text-base sm:text-lg leading-relaxed">
                  {language.summary}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-editorial-muted">
                    Pressure Profile
                  </p>
                  <div className="space-y-2.5">
                    {language.weight.map((item) => (
                      <div key={item.label} className="grid grid-cols-[72px_1fr_22px] items-center gap-3">
                        <span className="text-sm text-editorial-muted">{item.label}</span>
                        <div className="h-2.5 rounded-full bg-[rgba(44,49,59,0.08)] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(item.value / 5) * 100}%`,
                              backgroundColor: language.accent,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-editorial-ink">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[20px] border border-[rgba(44,49,59,0.08)] bg-white/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-editorial-muted mb-2">
                      Main Load
                    </p>
                    <p className="text-sm sm:text-base text-editorial-ink leading-relaxed">
                      {language.load}
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-[rgba(44,49,59,0.08)] bg-white/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-editorial-muted mb-2">
                      Best Way In
                    </p>
                    <p className="text-sm sm:text-base text-editorial-ink leading-relaxed">
                      {language.entry}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-editorial-muted">
            Natural Learning Sequence
          </p>
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-editorial-ink">
            The academy should teach speaking as a live progression
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {LEARNING_SEQUENCE.map((step, index) => {
            const Icon = step.icon
            return (
              <Card key={step.title} className="relative overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-[14px] bg-editorial-green-soft flex items-center justify-center">
                      <Icon className="h-5 w-5 text-editorial-green" />
                    </div>
                    <span className="text-sm font-semibold text-editorial-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif font-semibold text-editorial-ink leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm text-editorial-muted leading-relaxed">{step.body}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section>
        <Card className="overflow-hidden">
          <CardContent className="p-6 sm:p-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-editorial-muted mb-2">
                Continue The Sequence
              </p>
              <p className="text-base sm:text-lg text-editorial-ink leading-relaxed">
                This guide explains the shared pressure map. Next, choose a language and move into
                the first language-specific guide: sentence skeleton.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-5">
        <div className="max-w-2xl">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-editorial-ink mb-2">
            Choose your language-specific guide path
          </h2>
          <p className="text-editorial-muted leading-relaxed">
            If you know your target language, jump straight into its guide sequence. Otherwise,
            start by browsing the guide index for that language.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {SUPPORTED_LANGUAGES.map((code) => {
            const language = getLanguageConfig(code)!
            return (
              <Card key={code} className="overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xl font-serif font-semibold text-editorial-ink">{language.name}</p>
                      <p className="text-sm text-editorial-muted italic">{language.nativeName}</p>
                    </div>
                    <Badge variant="secondary">{language.shortCode}</Badge>
                  </div>
                  <p className="text-sm text-editorial-muted leading-relaxed">{language.description}</p>
                  <div className="flex flex-col gap-2">
                    <Link
                      href={getVisualGuideHref(code, "sentence-skeleton")}
                      className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-editorial-green px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-editorial-green/20"
                    >
                      Start sentence skeleton <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href={getVisualGuidesIndexHref(code)}
                      className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-[rgba(44,49,59,0.08)] bg-white/72 px-4 py-3 text-sm font-semibold text-editorial-ink"
                    >
                      Open guide index
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
