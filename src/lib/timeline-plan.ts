import { getAcademyStats, getGrammarRules, getPhrasePacks, getTopics } from "@/lib/academy-content"
import { DEFAULT_LANGUAGE, getLanguageConfig, langHref, type SupportedLanguage } from "@/lib/languages"
import { getVisualGuideHref, getVisualGuidesIndexHref } from "@/lib/visual-guides"
import { WORD_GROUPS } from "@/types/academy"

const GUIDE_COUNT = 4

export interface TimelineAction {
  label: string
  href: string
  detail: string
  accent: string
}

export interface TimelineCheckpoint {
  title: string
  body: string
}

export interface TimelineStat {
  label: string
  value: string
  detail: string
}

export interface TimelineStage {
  step: string
  eyebrow: string
  title: string
  summary: string
  objective: string
  successSignal: string
  actions: TimelineAction[]
  note?: string
  accent: string
}

export interface LanguageTimelinePlan {
  eyebrow: string
  title: string
  subtitle: string
  heroSummary: string
  startHref: string
  startLabel: string
  startDetail: string
  checkpoints: TimelineCheckpoint[]
  stats: TimelineStat[]
  coverageTitle: string
  coverageBody: string
  stages: TimelineStage[]
}

const TRACK_COPY: Partial<
  Record<
    SupportedLanguage,
    {
      eyebrow: string
    subtitle: string
    heroSummary: string
    startLabel: string
    startDetail: string
    coverageTitle: string
    coverageBody: string
    checkpoints: TimelineCheckpoint[]
    stageSummaries: [string, string, string, string, string]
    objectives: [string, string, string, string, string]
    successSignals: [string, string, string, string, string]
    }
  >
> = {
  es: {
    eyebrow: "Agreement-first timeline",
    subtitle: "A practical order for getting to useful Spanish speech quickly.",
    heroSummary:
      "Spanish gets easier when you begin with stable sentence frames, build a chunk library, and only then widen out into agreement, variation, and everyday dialogue.",
    startLabel: "Start with Speaking Structure",
    startDetail:
      "Begin with the shared pressure map, then move straight into the Spanish sentence skeleton.",
    coverageTitle: "Fullest track today",
    coverageBody:
      "Spanish is currently the strongest lane in the academy: guides, words, topics, grammar, and phrase packs can all reinforce each other inside one path.",
    checkpoints: [
      {
        title: "Start focus",
        body: "Use high-frequency verbs and safe sentence frames before chasing full grammar coverage.",
      },
      {
        title: "Protect next",
        body: "Treat article, noun, adjective, and verb agreement as the glue that keeps the sentence sounding right.",
      },
      {
        title: "Graduate when",
        body: "You can ask for, describe, and plan simple things without translating word by word.",
      },
    ],
    stageSummaries: [
      "See how speaking pressure works before you zoom into Spanish-specific structure.",
      "Build one safe sentence shape and a first bank of survival chunks.",
      "Turn memorized lines into flexible Spanish you can actually steer.",
      "Use topics and grammar to widen range without breaking the frame.",
      "Broaden vocabulary and reuse the path until response starts feeling natural.",
    ],
    objectives: [
      "Understand where Spanish carries pressure compared with the other tracks.",
      "Lock a trustworthy subject / verb / object rhythm into your ear.",
      "Swap nouns, verbs, and time details while protecting cohesion.",
      "Add real situations and grammar only after the sentence frame feels safe.",
      "Grow from survival speaking to fuller everyday expression.",
    ],
    successSignals: [
      "You can explain the difference between shared speaking structure and Spanish-specific agreement pressure.",
      "You can say a few useful wants, needs, and plans immediately.",
      "You can mutate a phrase without freezing when the details change.",
      "You can move through a topic page or grammar page without losing the speaking thread.",
      "You can tell a short story, make a plan, or handle a daily task with reusable Spanish.",
    ],
  },
  de: {
    eyebrow: "Architecture-first timeline",
    subtitle: "A practical German sequence that protects word order before complexity.",
    heroSummary:
      "German becomes much less heavy when you treat it like sentence architecture: first see the frame, then build sturdy chunks, then expand without letting verb position collapse.",
    startLabel: "Start with Speaking Structure",
    startDetail:
      "Begin with the shared pressure map, then move into the German sentence skeleton and frame-first guide path.",
    coverageTitle: "Guide-first track today",
    coverageBody:
      "German is already useful through the new guides and the full 1,000-word ladder. Topic, grammar, and phrase layers are thinner today, so the smartest path is structure first, then ranked vocabulary.",
    checkpoints: [
      {
        title: "Start focus",
        body: "Protect verb position and article-plus-noun chunking before anything fancy.",
      },
      {
        title: "Protect next",
        body: "Do not let case anxiety stop sentence building. Keep the frame short and stable first.",
      },
      {
        title: "Graduate when",
        body: "You can hold a basic German sentence together even while swapping nouns, times, or reasons.",
      },
    ],
    stageSummaries: [
      "See where German carries pressure before you try to speak around the rules.",
      "Build a dependable sentence frame and a first bank of high-frequency chunks.",
      "Learn how to widen a German chunk without losing the architecture.",
      "Use meaning-load and larger word groups to keep the frame alive under pressure.",
      "Expand range while staying brutally loyal to sentence structure.",
    ],
    objectives: [
      "Understand why German speaking pressure sits heavily in order and structure.",
      "Make one short, correct-feeling sentence shape automatic.",
      "Swap one variable at a time while protecting verb-second logic.",
      "Add range through vocabulary growth instead of random grammar wandering.",
      "Keep sentences intact while expressing fuller thoughts.",
    ],
    successSignals: [
      "You can explain why German feels structural rather than purely lexical.",
      "You can say a want, need, or ability line without scrambling the frame.",
      "You can extend a chunk with one extra detail and still sound organized.",
      "You can hear where meaning sits and choose the next word group deliberately.",
      "You can stay calm while building longer German responses.",
    ],
  },
  zh: {
    eyebrow: "Sequence-and-tone timeline",
    subtitle: "A practical Mandarin path that trains order and sound in the right order.",
    heroSummary:
      "Mandarin accelerates when you stop overloading grammar notes and instead train stable sequence, chunked tones, and a small set of reusable sentence patterns.",
    startLabel: "Start with Speaking Structure",
    startDetail:
      "Begin with the shared pressure map, then move into the Mandarin sentence skeleton and pattern ladder.",
    coverageTitle: "Guide-first track today",
    coverageBody:
      "Mandarin is currently strongest in the visual guides plus the full 1,000-word ladder. That is enough to build a real sequence-first speaking habit while deeper topic and phrase layers continue to expand.",
    checkpoints: [
      {
        title: "Start focus",
        body: "Train whole chunks with tone built in instead of learning isolated words with no speaking frame.",
      },
      {
        title: "Protect next",
        body: "Treat order, particles, and measure words as part of real speaking, not optional later details.",
      },
      {
        title: "Graduate when",
        body: "You can keep a stable Mandarin frame while changing time, object, or intention.",
      },
    ],
    stageSummaries: [
      "See why Mandarin carries pressure in sequence, sound, and particles rather than heavy inflection.",
      "Build one compact sentence frame and a first set of useful chunks.",
      "Turn memorized chunks into patterns you can flex without breaking tone and order.",
      "Use meaning-load and wider vocabulary to put effort on the right systems.",
      "Expand range while keeping sequence clean and tones attached to whole phrases.",
    ],
    objectives: [
      "Understand where Mandarin meaning lives before drilling the wrong things.",
      "Make one dependable time / subject / verb / object rhythm feel natural.",
      "Swap one part at a time while keeping the chunk intact.",
      "Use the meaning map to decide what deserves repetition first.",
      "Grow expression without losing the clean pattern that made early speaking possible.",
    ],
    successSignals: [
      "You can explain why Mandarin is not best approached like a heavily inflected European language.",
      "You can say a few useful lines with stable order and recognizable tone.",
      "You can stretch a familiar chunk without turning it into English order.",
      "You can choose practice targets based on load, not textbook habit.",
      "You can keep order and sound under control while saying a little more.",
    ],
  },
  th: {
    eyebrow: "Tone-and-social-finish timeline",
    subtitle: "A practical Thai path that starts with a simple frame and layers tone and social fit on top.",
    heroSummary:
      "Thai becomes much more approachable when the learner first trusts a compact base sentence, then adds tone, particles, and role-aware finishing instead of treating them like abstract extras.",
    startLabel: "Start with Speaking Structure",
    startDetail:
      "Begin with the shared pressure map, then move into the Thai sentence skeleton and meaning-load guide path.",
    coverageTitle: "Guide-first track today",
    coverageBody:
      "Thai is currently strongest in the visual guides plus the full 1,000-word ladder. That means the best path today is to build a social, tone-aware speaking frame first and use ranked vocabulary to widen it carefully.",
    checkpoints: [
      {
        title: "Start focus",
        body: "Get comfortable with a compact subject / verb / object frame before worrying about every social variation.",
      },
      {
        title: "Protect next",
        body: "Treat particles, pronoun choice, and tone as part of the sentence landing, not cosmetic extras.",
      },
      {
        title: "Graduate when",
        body: "You can say a simple Thai line that sounds controlled, polite enough, and socially safe.",
      },
    ],
    stageSummaries: [
      "See why Thai carries pressure in tone, particles, and relationship fit as much as in the words themselves.",
      "Build one safe speaking frame and a first set of useful chunks.",
      "Move from memorized chunks to flexible mini-patterns without losing natural finish.",
      "Use meaning-load and larger word groups to practice what actually changes the force of the sentence.",
      "Expand vocabulary while keeping tone and social finish attached to real usage.",
    ],
    objectives: [
      "Understand what makes Thai speaking feel different from the European tracks.",
      "Make one short sentence pattern safe enough to reuse out loud.",
      "Change one slot at a time while protecting delivery and soft finish.",
      "Use the meaning map to focus on the systems that actually matter in Thai.",
      "Keep Thai sounding socially aware while range grows.",
    ],
    successSignals: [
      "You can explain why Thai pressure is not only about vocabulary knowledge.",
      "You can say a want, need, or simple request with a stable frame.",
      "You can mutate a chunk without dropping the overall social landing.",
      "You can tell which practice targets change meaning fast and which can wait.",
      "You can sound more natural without needing a huge Thai grammar inventory first.",
    ],
  },
}

function makeAction(
  label: string,
  href: string,
  detail: string,
  accent: string
): TimelineAction {
  return { label, href, detail, accent }
}

export function getTimelinePlan(language: SupportedLanguage): LanguageTimelinePlan {
  const config = getLanguageConfig(language)!
  const copy = TRACK_COPY[language] ?? TRACK_COPY[DEFAULT_LANGUAGE]!
  const stats = getAcademyStats(language)
  const topics = getTopics(language)
  const grammar = getGrammarRules(language)
  const phrases = getPhrasePacks(language)

  const firstTopic = topics[0]
  const secondTopic = topics[1]
  const firstGrammar = grammar[0]
  const firstPhrase = phrases[0]
  const secondPhrase = phrases[1]

  const limitedSurfaceNote =
    stats.topics + stats.grammar + stats.phrases === 0
      ? "This stage currently leans on guides and ranked words while deeper topic, dialogue, and grammar layers continue to expand for this track."
      : undefined

  const stages: TimelineStage[] = [
    {
      step: "01",
      eyebrow: "See the structure",
      title: "Start with the shared speaking map",
      summary: copy.stageSummaries[0],
      objective: copy.objectives[0],
      successSignal: copy.successSignals[0],
      accent: "#386a58",
      actions: [
        makeAction(
          "Open Speaking Structure",
          "/speaking-structure",
          "See how pressure is distributed across all four languages.",
          "#386a58"
        ),
        makeAction(
          "Open the guide index",
          getVisualGuidesIndexHref(language),
          `See the full ${config.name.toLowerCase()} guide sequence in one place.`,
          "#2f4f79"
        ),
      ],
    },
    {
      step: "02",
      eyebrow: "Build the safe frame",
      title: "Learn your first usable sentence shape",
      summary: copy.stageSummaries[1],
      objective: copy.objectives[1],
      successSignal: copy.successSignals[1],
      accent: "#2f4f79",
      actions: [
        makeAction(
          "Open Sentence Skeleton",
          getVisualGuideHref(language, "sentence-skeleton"),
          "Lock the default speaking frame into your head first.",
          "#386a58"
        ),
        makeAction(
          `Learn ${WORD_GROUPS[0].name}`,
          langHref(language, `words/${WORD_GROUPS[0].id}`),
          "Use the highest-frequency vocabulary that appears in basic speaking again and again.",
          "#2f4f79"
        ),
        ...(firstPhrase
          ? [
              makeAction(
                `Study phrase pack: ${firstPhrase.title}`,
                langHref(language, `phrases/${firstPhrase.slug}`),
                "Start with complete lines that already live in a human situation.",
                "#a16a1f"
              ),
            ]
          : []),
      ],
      note:
        !firstPhrase && language !== "es"
          ? "Phrase packs are still thinner in this track, so use the sentence skeleton plus the Essential 50 as your first chunk bank."
          : undefined,
    },
    {
      step: "03",
      eyebrow: "Turn chunks into patterns",
      title: "Mutate what you already know",
      summary: copy.stageSummaries[2],
      objective: copy.objectives[2],
      successSignal: copy.successSignals[2],
      accent: "#5a6b8a",
      actions: [
        makeAction(
          "Open Phrase to Pattern",
          getVisualGuideHref(language, "phrase-to-pattern"),
          "Learn how to swap one slot without breaking the whole line.",
          "#2f4f79"
        ),
        ...(firstTopic
          ? [
              makeAction(
                `Study topic: ${firstTopic.title}`,
                langHref(language, `topics/${firstTopic.slug}`),
                "Use a situation page to stretch the same pattern inside a real context.",
                "#6d28d9"
              ),
            ]
          : [
              makeAction(
                `Climb into ${WORD_GROUPS[1].name}`,
                langHref(language, `words/${WORD_GROUPS[1].id}`),
                "Use the next word layer to swap objects, times, and everyday details.",
                "#6d28d9"
              ),
            ]),
        ...(firstGrammar
          ? [
              makeAction(
                `Read grammar: ${firstGrammar.name}`,
                langHref(language, `grammar/${firstGrammar.slug}`),
                "Use one grammar page only after the speaking frame is already familiar.",
                "#a0453f"
              ),
            ]
          : []),
      ],
      note: limitedSurfaceNote,
    },
    {
      step: "04",
      eyebrow: "Carry meaning in the right place",
      title: "Put practice effort where this language hides meaning",
      summary: copy.stageSummaries[3],
      objective: copy.objectives[3],
      successSignal: copy.successSignals[3],
      accent: "#a0453f",
      actions: [
        makeAction(
          "Open Meaning Load",
          getVisualGuideHref(language, "meaning-load"),
          "See which systems deserve repetition first and which can wait.",
          "#a0453f"
        ),
        makeAction(
          `Build ${WORD_GROUPS[2].name}`,
          langHref(language, `words/${WORD_GROUPS[2].id}`),
          "Widen the sentence while keeping the same pattern discipline.",
          "#a16a1f"
        ),
        ...(secondTopic
          ? [
              makeAction(
                `Add topic: ${secondTopic.title}`,
                langHref(language, `topics/${secondTopic.slug}`),
                "Move the same speaking logic into a second situation.",
                "#386a58"
              ),
            ]
          : secondPhrase
            ? [
                makeAction(
                  `Add phrase pack: ${secondPhrase.title}`,
                  langHref(language, `phrases/${secondPhrase.slug}`),
                  "Use another phrase pack to widen range without changing the method.",
                  "#386a58"
                ),
              ]
            : []),
      ],
      note:
        !secondTopic && !secondPhrase && language !== "es"
          ? "For now, this stage works best as guide review plus a larger word group. The key is still pressure-aware speaking, not random content accumulation."
          : undefined,
    },
    {
      step: "05",
      eyebrow: "Broaden range and review",
      title: "Grow expression without leaving the path",
      summary: copy.stageSummaries[4],
      objective: copy.objectives[4],
      successSignal: copy.successSignals[4],
      accent: "#a16a1f",
      actions: [
        makeAction(
          `Expand into ${WORD_GROUPS[3].name}`,
          langHref(language, `words/${WORD_GROUPS[3].id}`),
          "Add opinions, routines, stories, and longer expression carefully.",
          "#a16a1f"
        ),
        makeAction(
          `Finish with ${WORD_GROUPS[4].name}`,
          langHref(language, `words/${WORD_GROUPS[4].id}`),
          "Use the final group for nuance once the sentence frame is already durable.",
          "#a0453f"
        ),
        makeAction(
          "Revisit the guide sequence",
          getVisualGuidesIndexHref(language),
          "Use the guides as your review loop until the practice engine lands.",
          "#386a58"
        ),
      ],
      note:
        "Until the dedicated practice engine ships, the best review loop is: revisit the guide, speak from the relevant word group aloud, then return to a second guide to tighten the pattern.",
    },
  ]

  return {
    eyebrow: copy.eyebrow,
    title: `${config.name} Timeline`,
    subtitle: copy.subtitle,
    heroSummary: copy.heroSummary,
    startHref: "/speaking-structure",
    startLabel: copy.startLabel,
    startDetail: copy.startDetail,
    checkpoints: copy.checkpoints,
    stats: [
      {
        label: "Visual guides",
        value: String(GUIDE_COUNT),
        detail: "One shared speaking map plus three language-specific guides.",
      },
      {
        label: "Words",
        value: String(stats.words),
        detail: "Frequency-ranked vocabulary already available in the academy.",
      },
      {
        label: "Topics",
        value: String(stats.topics),
        detail: "Situation pages currently available for this language.",
      },
      {
        label: "Grammar",
        value: String(stats.grammar),
        detail: "Grammar pages available to support the speaking path.",
      },
      {
        label: "Phrases",
        value: String(stats.phrases),
        detail: "Phrase packs currently available in this track.",
      },
    ],
    coverageTitle: copy.coverageTitle,
    coverageBody: copy.coverageBody,
    stages,
  }
}
