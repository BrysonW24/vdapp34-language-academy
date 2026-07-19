import { type SupportedLanguage, DEFAULT_LANGUAGE, getLanguageConfig, langHref } from "@/lib/languages"

export type VisualGuideSlug = "sentence-skeleton" | "phrase-to-pattern" | "meaning-load"

export interface GuideVisualSection {
  title: string
  description: string
  items: string[]
}

export interface GuideFrameToken {
  label: string
  value: string
}

export interface GuideExample {
  native: string
  english: string
  note: string
}

export interface GuideLoadRow {
  label: string
  value: number
  explanation: string
}

export interface GuideLadderStep {
  stage: string
  form: string
  explanation: string
}

interface GuideBaseContent {
  title: string
  subtitle: string
  heroSummary: string
  whyItMatters: string
  visualSections: GuideVisualSection[]
  takeaways: string[]
  nextHref: string
  nextLabel: string
}

export interface SentenceSkeletonGuideContent extends GuideBaseContent {
  frameLabel: string
  frameTokens: GuideFrameToken[]
  safePattern: string
  examples: GuideExample[]
}

export interface PhraseToPatternGuideContent extends GuideBaseContent {
  ladder: GuideLadderStep[]
  liveResponse: string
}

export interface MeaningLoadGuideContent extends GuideBaseContent {
  loadRows: GuideLoadRow[]
  avoidEarly: string
}

export interface VisualGuideOverview {
  slug: VisualGuideSlug
  title: string
  description: string
  problem: string
  color: string
}

export const VISUAL_GUIDE_ORDER: VisualGuideSlug[] = [
  "sentence-skeleton",
  "phrase-to-pattern",
  "meaning-load",
]

export const VISUAL_GUIDE_OVERVIEWS: Record<VisualGuideSlug, VisualGuideOverview> = {
  "sentence-skeleton": {
    slug: "sentence-skeleton",
    title: "Sentence Skeleton",
    description: "Learn the default shape of a safe, usable sentence before grammar branches out.",
    problem: "What is the basic sentence frame I can trust when I speak?",
    color: "#386a58",
  },
  "phrase-to-pattern": {
    slug: "phrase-to-pattern",
    title: "Phrase to Pattern",
    description: "Turn memorized chunks into flexible sentence-making, one swap at a time.",
    problem: "How do I move from fixed phrases to real speaking?",
    color: "#2f4f79",
  },
  "meaning-load": {
    slug: "meaning-load",
    title: "Meaning Load",
    description: "See where each language hides meaning so you focus on the right pressure points early.",
    problem: "Where does meaning actually live in this language?",
    color: "#a0453f",
  },
}

export function getVisualGuidesIndexHref(language: SupportedLanguage) {
  return langHref(language, "guides")
}

export function getVisualGuideHref(language: SupportedLanguage, slug: VisualGuideSlug) {
  return langHref(language, `guides/${slug}`)
}

export function getLanguageGuideIndexItems(language: SupportedLanguage) {
  return VISUAL_GUIDE_ORDER.map((slug, index) => ({
    ...VISUAL_GUIDE_OVERVIEWS[slug],
    href: getVisualGuideHref(language, slug),
    step: index + 1,
  }))
}

function getNextGuide(language: SupportedLanguage, slug: VisualGuideSlug) {
  const currentIndex = VISUAL_GUIDE_ORDER.indexOf(slug)
  if (currentIndex < 0 || currentIndex === VISUAL_GUIDE_ORDER.length - 1) {
    return {
      nextHref: getVisualGuidesIndexHref(language),
      nextLabel: "Back to the Visual Guides index",
    }
  }

  const nextSlug = VISUAL_GUIDE_ORDER[currentIndex + 1]
  return {
    nextHref: getVisualGuideHref(language, nextSlug),
    nextLabel: `Continue to ${VISUAL_GUIDE_OVERVIEWS[nextSlug].title}`,
  }
}

const sentenceSkeletonGuide: Partial<Record<SupportedLanguage, SentenceSkeletonGuideContent>> = {
  es: {
    title: "Sentence Skeleton",
    subtitle: "See the safest Spanish sentence shape before grammar starts branching.",
    heroSummary:
      "If you know where the subject, verb, object, and modifiers usually sit, you can start speaking Spanish much earlier and with less fear.",
    whyItMatters:
      "Spanish gets easier when you stop trying to invent full grammar on the fly and instead lean on a few trustworthy frames that already sound natural.",
    visualSections: [
      {
        title: "Base speaking shape",
        description: "Spanish often rewards a straightforward frame before you decorate it.",
        items: ["Subject -> verb -> object", "Adjectives often follow the noun", "Intonation can carry simple questions"],
      },
      {
        title: "Where the shape flexes",
        description: "You do not need every variation first. You need the common safe lane.",
        items: ["The subject can drop when the verb ending is clear", "Pronouns often sit before a conjugated verb", "Agreement keeps the sentence coherent"],
      },
      {
        title: "First safe patterns",
        description: "These give you immediate speaking leverage.",
        items: ["Quiero + noun", "Necesito + noun", "Puedo + infinitive"],
      },
    ],
    takeaways: [
      "Trust a simple subject -> verb -> object frame first.",
      "Treat agreement as part of sentence stability, not decoration.",
      "Start from reusable verbs like querer, necesitar, and poder.",
    ],
    frameLabel: "Default usable frame",
    frameTokens: [
      { label: "Subject", value: "Yo" },
      { label: "Verb", value: "quiero" },
      { label: "Object", value: "un café" },
      { label: "Extra", value: "ahora" },
    ],
    safePattern: "Quiero + noun / Puedo + verb / Necesito + noun",
    examples: [
      {
        native: "Quiero un café ahora.",
        english: "I want a coffee now.",
        note: "Simple desire + object + time.",
      },
      {
        native: "Puedo practicar mañana.",
        english: "I can practise tomorrow.",
        note: "Modal frame plus infinitive.",
      },
    ],
    ...getNextGuide("es", "sentence-skeleton"),
  },
  de: {
    title: "Sentence Skeleton",
    subtitle: "See the safest German sentence shape before word-order anxiety takes over.",
    heroSummary:
      "German feels much less intimidating when you learn one dependable sentence frame and hear the article as part of the noun from the beginning.",
    whyItMatters:
      "German speaking confidence comes from architecture. If the frame is stable, you can stay useful long before you master every case table.",
    visualSections: [
      {
        title: "Base speaking shape",
        description: "The core sentence stays stable if the finite verb lands early and the noun phrase stays intact.",
        items: ["Subject -> finite verb -> object / complement", "Treat article + noun as one unit", "Keep time and place extras outside the core frame first"],
      },
      {
        title: "Where the shape flexes",
        description: "The frame matters more than sounding clever.",
        items: ["Verb-second matters in normal statements", "Questions often pull the verb forward", "Case changes the noun phrase, not the whole strategy"],
      },
      {
        title: "First safe patterns",
        description: "These keep the frame short and manageable.",
        items: ["Ich möchte + noun", "Ich brauche + noun", "Ich kann + verb"],
      },
    ],
    takeaways: [
      "Think in sentence frames, not isolated words.",
      "Hear article + noun together from day one.",
      "Protect verb position before adding complexity.",
    ],
    frameLabel: "Default usable frame",
    frameTokens: [
      { label: "Subject", value: "Ich" },
      { label: "Verb", value: "möchte" },
      { label: "Object", value: "einen Kaffee" },
      { label: "Extra", value: "heute" },
    ],
    safePattern: "Ich möchte + noun / Ich brauche + noun / Ich kann + verb",
    examples: [
      {
        native: "Ich möchte einen Kaffee heute.",
        english: "I would like a coffee today.",
        note: "Finite verb stays early; noun phrase stays together.",
      },
      {
        native: "Ich kann morgen üben.",
        english: "I can practise tomorrow.",
        note: "Modal plus infinitive gives a sturdy speaking frame.",
      },
    ],
    ...getNextGuide("de", "sentence-skeleton"),
  },
  zh: {
    title: "Sentence Skeleton",
    subtitle: "See the safest Mandarin sentence shape before tones and particles start branching.",
    heroSummary:
      "Mandarin feels lighter when you trust a stable order and learn complete chunks instead of trying to build every sentence from single words.",
    whyItMatters:
      "Mandarin speaking speed comes from stable order. When the order is familiar, tones and particles have somewhere reliable to live.",
    visualSections: [
      {
        title: "Base speaking shape",
        description: "Mandarin rewards predictable sequence.",
        items: ["Time -> subject -> verb -> object is common", "Adverbs usually sit before the main verb", "Questions often keep the same order and change the particle or wording"],
      },
      {
        title: "Where the shape flexes",
        description: "Most beginner confusion comes from trying to translate English order directly.",
        items: ["Time words often come early", "Measure words matter when counting", "Particles can change force without changing the base frame"],
      },
      {
        title: "First safe patterns",
        description: "These frames are useful before deeper grammar.",
        items: ["我想 + noun / verb", "我要 + noun", "我可以 + verb"],
      },
    ],
    takeaways: [
      "Trust sequence before worrying about advanced grammar labels.",
      "Memorize whole speaking chunks with tone built in.",
      "Treat time words and measure words as part of the frame.",
    ],
    frameLabel: "Default usable frame",
    frameTokens: [
      { label: "Time", value: "今天" },
      { label: "Subject", value: "我" },
      { label: "Verb", value: "想" },
      { label: "Object", value: "喝咖啡" },
    ],
    safePattern: "我想 + noun / verb / 我可以 + verb / 我要 + noun",
    examples: [
      {
        native: "今天我想喝咖啡。",
        english: "Today I want to drink coffee.",
        note: "Time can lead the sentence without breaking the frame.",
      },
      {
        native: "我可以明天练习。",
        english: "I can practise tomorrow.",
        note: "The modal frame stays compact and reusable.",
      },
    ],
    ...getNextGuide("zh", "sentence-skeleton"),
  },
  th: {
    title: "Sentence Skeleton",
    subtitle: "See the safest Thai sentence shape before tone and social finish add pressure.",
    heroSummary:
      "Thai gets more approachable when you learn a compact sentence frame first, then attach tone, particles, and politeness in context.",
    whyItMatters:
      "Thai speaking confidence comes from knowing the base idea is already workable before you refine it with tone, rhythm, and social softness.",
    visualSections: [
      {
        title: "Base speaking shape",
        description: "Thai often keeps the core sentence compact and direct.",
        items: ["Subject -> verb -> object is a safe starting frame", "Time words often sit at the beginning or end", "Particles can finish the sentence without changing the main idea"],
      },
      {
        title: "Where the shape flexes",
        description: "Politeness and tone sit on top of a relatively simple core.",
        items: ["Pronouns shift with role and relationship", "Particles soften or complete the line", "Classifiers matter when counting and specifying things"],
      },
      {
        title: "First safe patterns",
        description: "These let the learner speak before mastering social nuance.",
        items: ["ฉันอยาก + noun / verb", "ฉันต้องการ + noun", "ฉันสามารถ + verb"],
      },
    ],
    takeaways: [
      "Build a stable base sentence first.",
      "Add tone and social finish in real speaking scenes.",
      "Treat particles as part of natural delivery, not optional extras.",
    ],
    frameLabel: "Default usable frame",
    frameTokens: [
      { label: "Subject", value: "ฉัน" },
      { label: "Verb", value: "อยาก" },
      { label: "Object", value: "กาแฟ" },
      { label: "Finish", value: "ค่ะ" },
    ],
    safePattern: "ฉันอยาก + noun / verb / ฉันสามารถ + verb",
    examples: [
      {
        native: "ฉันอยากกาแฟค่ะ",
        english: "I would like coffee.",
        note: "Compact idea first, polite finish after.",
      },
      {
        native: "ฉันสามารถฝึกพรุ่งนี้ได้",
        english: "I can practise tomorrow.",
        note: "Modal meaning can still sit inside a short frame.",
      },
    ],
    ...getNextGuide("th", "sentence-skeleton"),
  },
}

const phraseToPatternGuide: Partial<Record<SupportedLanguage, PhraseToPatternGuideContent>> = {
  es: {
    title: "Phrase to Pattern",
    subtitle: "Move from memorized Spanish chunks to flexible speaking without jumping straight into full grammar.",
    heroSummary:
      "Fast learners do not try to create Spanish from zero. They borrow a phrase, hold the frame, and replace one part at a time.",
    whyItMatters:
      "This is the shortest path from recognition to speaking. It gives you flexibility without forcing you to master every rule up front.",
    visualSections: [
      {
        title: "Fixed phrase",
        description: "Start with a line that already works.",
        items: ["Quiero un café.", "Necesito ayuda.", "Puedo practicar hoy."],
      },
      {
        title: "Swap one slot",
        description: "Keep the frame, change one variable.",
        items: ["Quiero té.", "Necesito agua.", "Puedo practicar mañana."],
      },
      {
        title: "Expand the response",
        description: "Add time, reason, or preference after the stable core.",
        items: ["Quiero un café ahora.", "Necesito ayuda aquí.", "Puedo practicar con amigos."],
      },
    ],
    takeaways: [
      "Borrow complete lines before building original ones.",
      "Change one part at a time so the frame stays safe.",
      "Expansion comes after confidence, not before it.",
    ],
    ladder: [
      { stage: "Fixed phrase", form: "Quiero un café.", explanation: "Use a complete line that already works." },
      { stage: "Slot swap", form: "Quiero té.", explanation: "Only swap the object while keeping the pattern." },
      { stage: "Flexible sentence", form: "Quiero té ahora.", explanation: "Add one extra detail without changing the frame." },
      { stage: "Live response", form: "Quiero té ahora porque estoy cansado.", explanation: "Turn the safe frame into a real answer." },
    ],
    liveResponse: "Hear a useful line -> repeat it -> swap one word -> add one detail -> answer someone with it.",
    ...getNextGuide("es", "phrase-to-pattern"),
  },
  de: {
    title: "Phrase to Pattern",
    subtitle: "Move from memorized German chunks to flexible speaking while protecting the sentence frame.",
    heroSummary:
      "German gets much easier when you reuse sturdy mini-sentences instead of improvising structure from scratch.",
    whyItMatters:
      "This method reduces word-order panic. The learner keeps a stable frame and only swaps the part they can control.",
    visualSections: [
      {
        title: "Fixed phrase",
        description: "Begin with a complete usable line.",
        items: ["Ich möchte einen Kaffee.", "Ich brauche Hilfe.", "Ich kann heute üben."],
      },
      {
        title: "Swap one slot",
        description: "Hold the frame and replace the noun, time, or verb.",
        items: ["Ich möchte einen Tee.", "Ich brauche Wasser.", "Ich kann morgen üben."],
      },
      {
        title: "Expand the response",
        description: "Add one extra idea only after the frame feels safe.",
        items: ["Ich möchte einen Tee jetzt.", "Ich brauche Hilfe hier.", "Ich kann morgen mit dir üben."],
      },
    ],
    takeaways: [
      "Think of the phrase as a frame, not a script.",
      "Protect verb position while swapping content.",
      "Flexibility grows by controlled variation, not raw complexity.",
    ],
    ladder: [
      { stage: "Fixed phrase", form: "Ich möchte einen Kaffee.", explanation: "Use the full frame exactly as heard." },
      { stage: "Slot swap", form: "Ich möchte einen Tee.", explanation: "Replace only the object." },
      { stage: "Flexible sentence", form: "Ich möchte einen Tee jetzt.", explanation: "Add a simple time detail." },
      { stage: "Live response", form: "Ich möchte einen Tee jetzt, weil ich müde bin.", explanation: "Turn the frame into an actual reply." },
    ],
    liveResponse: "Hold the architecture steady while only one variable changes at a time.",
    ...getNextGuide("de", "phrase-to-pattern"),
  },
  zh: {
    title: "Phrase to Pattern",
    subtitle: "Move from Mandarin chunks to real speaking by varying complete patterns, not isolated words.",
    heroSummary:
      "Mandarin speed comes from phrase memory. You hear a chunk, keep the order, and swap one piece without breaking the rhythm or tone.",
    whyItMatters:
      "This approach keeps tones attached to the phrase and prevents English-style sentence construction from slowing you down.",
    visualSections: [
      {
        title: "Fixed phrase",
        description: "Start with a line whose order already works.",
        items: ["我想喝咖啡。", "我需要帮助。", "我今天可以练习。"],
      },
      {
        title: "Swap one slot",
        description: "Change one noun, time word, or verb while keeping the pattern.",
        items: ["我想喝茶。", "我需要水。", "我明天可以练习。"],
      },
      {
        title: "Expand the response",
        description: "Add one more meaningful unit after the base chunk is stable.",
        items: ["我今天想喝热咖啡。", "我现在需要帮助。", "我明天可以和朋友练习。"],
      },
    ],
    takeaways: [
      "Memorize chunks with order and tone together.",
      "Swap one slot at a time to keep the pattern stable.",
      "Expansion should feel like adding a tile, not rebuilding the sentence.",
    ],
    ladder: [
      { stage: "Fixed phrase", form: "我想喝咖啡。", explanation: "Use the chunk exactly as learned." },
      { stage: "Slot swap", form: "我想喝茶。", explanation: "Swap only the drink." },
      { stage: "Flexible sentence", form: "我今天想喝茶。", explanation: "Add time while preserving order." },
      { stage: "Live response", form: "我今天想喝茶，因为我很累。", explanation: "Turn the chunk into a real reply." },
    ],
    liveResponse: "Keep the order, keep the tone, swap one element, then answer for real.",
    ...getNextGuide("zh", "phrase-to-pattern"),
  },
  th: {
    title: "Phrase to Pattern",
    subtitle: "Move from Thai chunks to flexible speaking by reusing compact frames with the right finish.",
    heroSummary:
      "Thai is faster to learn when the learner reuses natural short scenes and changes one piece at a time instead of translating everything from English.",
    whyItMatters:
      "This keeps the core sentence stable while tone, particles, and politeness stay connected to real use.",
    visualSections: [
      {
        title: "Fixed phrase",
        description: "Start from a line that already works in a human situation.",
        items: ["ฉันอยากกาแฟค่ะ", "ฉันต้องการความช่วยเหลือ", "ฉันฝึกวันนี้ได้"],
      },
      {
        title: "Swap one slot",
        description: "Keep the frame and replace one noun, time word, or action.",
        items: ["ฉันอยากชา ค่ะ", "ฉันต้องการน้ำ", "ฉันฝึกพรุ่งนี้ได้"],
      },
      {
        title: "Expand the response",
        description: "Add one more meaningful unit after the core line feels safe.",
        items: ["ฉันอยากกาแฟร้อนค่ะ", "ฉันต้องการความช่วยเหลือตอนนี้", "ฉันฝึกกับเพื่อนได้"],
      },
    ],
    takeaways: [
      "Short scene-based chunks beat abstract grammar explanations.",
      "Change one meaningful piece while preserving natural delivery.",
      "Attach politeness and tone to the chunk, not after the fact.",
    ],
    ladder: [
      { stage: "Fixed phrase", form: "ฉันอยากกาแฟค่ะ", explanation: "Use a compact natural line first." },
      { stage: "Slot swap", form: "ฉันอยากชาค่ะ", explanation: "Swap only the drink." },
      { stage: "Flexible sentence", form: "ฉันอยากชาร้อนค่ะ", explanation: "Add one descriptive detail." },
      { stage: "Live response", form: "ฉันอยากชาร้อนค่ะ เพราะวันนี้เหนื่อย", explanation: "Turn the chunk into a real answer." },
    ],
    liveResponse: "Keep the scene intact, swap one slot, then answer like a person rather than a worksheet.",
    ...getNextGuide("th", "phrase-to-pattern"),
  },
}

const meaningLoadGuide: Partial<Record<SupportedLanguage, MeaningLoadGuideContent>> = {
  es: {
    title: "Meaning Load",
    subtitle: "See where Spanish stores meaning so you stop wasting effort on the wrong details.",
    heroSummary:
      "Spanish puts a lot of meaning into endings and agreement, so learners progress faster when they focus there early and treat other differences as later polish.",
    whyItMatters:
      "If you know where meaning is doing the real work, you stop trying to memorize everything evenly and start practicing what actually changes understanding.",
    visualSections: [
      {
        title: "High-load systems",
        description: "These systems change meaning quickly.",
        items: ["Verb endings", "Gender and number agreement", "Ser vs estar"],
      },
      {
        title: "Medium-load systems",
        description: "These help fluency and naturalness, but usually come after the core frame.",
        items: ["Word order emphasis", "Object pronoun placement", "Question phrasing"],
      },
      {
        title: "Do not over-focus early",
        description: "These matter, but they should not block first speaking confidence.",
        items: ["Rare tense edge cases", "Perfect style distinctions", "Elegant sentence inversion"],
      },
    ],
    takeaways: [
      "Spanish meaning often lives in the form of the word itself.",
      "Agreement work is not optional if you want your sentence to hold together.",
      "Fluency starts with the high-load systems, not exhaustive grammar coverage.",
    ],
    loadRows: [
      { label: "Endings", value: 5, explanation: "Verb endings and agreement do heavy semantic work." },
      { label: "Word order", value: 3, explanation: "Order matters, but less than form in many beginner sentences." },
      { label: "Tone", value: 1, explanation: "Pronunciation matters, but tone does not encode lexical meaning." },
      { label: "Particles", value: 1, explanation: "Particles are not the main beginner burden." },
      { label: "Politeness", value: 2, explanation: "Register matters, but not like Thai." },
    ],
    avoidEarly: "Do not delay speaking because you want every tense chart memorized first. Start with the high-load forms that make basic lines work.",
    ...getNextGuide("es", "meaning-load"),
  },
  de: {
    title: "Meaning Load",
    subtitle: "See where German stores meaning so you focus on architecture before ornament.",
    heroSummary:
      "German places major meaning pressure on order, article choice, and case-sensitive noun phrases, so the learner should train those systems before hunting nuance everywhere else.",
    whyItMatters:
      "German stops feeling chaotic when you understand that sentence architecture carries the burden. Once that clicks, a lot of detail becomes easier to place.",
    visualSections: [
      {
        title: "High-load systems",
        description: "These systems shape meaning and correctness quickly.",
        items: ["Verb position", "Article + noun phrase", "Case-sensitive forms"],
      },
      {
        title: "Medium-load systems",
        description: "These matter once the core frame is stable.",
        items: ["Adjective endings", "Word-order emphasis", "Clause expansion"],
      },
      {
        title: "Do not over-focus early",
        description: "These can wait until you can already produce short usable lines.",
        items: ["Full case theory debates", "Long subordinate clause elegance", "Edge-case formal phrasing"],
      },
    ],
    takeaways: [
      "German meaning lives heavily in structure and noun-phrase integrity.",
      "Verb position is a first-order problem, not a later polish item.",
      "Treat article choice as part of saying the noun correctly.",
    ],
    loadRows: [
      { label: "Endings", value: 4, explanation: "Case and inflection carry real meaning." },
      { label: "Word order", value: 5, explanation: "Verb position strongly shapes comprehension." },
      { label: "Tone", value: 1, explanation: "No lexical tone system carries meaning." },
      { label: "Particles", value: 1, explanation: "Particles are not the main beginner meaning engine." },
      { label: "Politeness", value: 2, explanation: "Register matters, but less than sentence architecture." },
    ],
    avoidEarly: "Do not let full declension tables delay short speaking frames. Train order and the noun phrase first, then widen the grammar.",
    ...getNextGuide("de", "meaning-load"),
  },
  zh: {
    title: "Meaning Load",
    subtitle: "See where Mandarin stores meaning so you stop overloading grammar and undertraining tone and sequence.",
    heroSummary:
      "Mandarin hides less meaning in inflection and more in tone, order, particles, aspect markers, and measure-word habits, which changes what beginners should practise first.",
    whyItMatters:
      "If you study Mandarin like a heavily inflected European language, you spend time in the wrong place. Meaning lives elsewhere.",
    visualSections: [
      {
        title: "High-load systems",
        description: "These systems change what the sentence means very quickly.",
        items: ["Tone", "Stable word order", "Particles and aspect markers"],
      },
      {
        title: "Medium-load systems",
        description: "These become more important as your phrases widen.",
        items: ["Measure words", "Time placement", "Topic framing"],
      },
      {
        title: "Do not over-focus early",
        description: "These should not block useful early speaking.",
        items: ["Perfect textbook terminology", "Rare literary structures", "Advanced rhetorical emphasis"],
      },
    ],
    takeaways: [
      "Mandarin meaning often lives outside word endings.",
      "Tone and sequence deserve real beginner attention.",
      "Particles and aspect markers are part of usable speech, not decorative extras.",
    ],
    loadRows: [
      { label: "Endings", value: 1, explanation: "Inflection carries relatively little beginner meaning load." },
      { label: "Word order", value: 4, explanation: "Sequence is a major meaning system." },
      { label: "Tone", value: 5, explanation: "Tone changes lexical meaning directly." },
      { label: "Particles", value: 4, explanation: "Particles and aspect markers change force and time." },
      { label: "Politeness", value: 3, explanation: "Register matters, but less than Thai." },
    ],
    avoidEarly: "Do not hide inside grammar notes while undertraining tone and chunked order. Mandarin speed comes from sound and sequence.",
    ...getNextGuide("zh", "meaning-load"),
  },
  th: {
    title: "Meaning Load",
    subtitle: "See where Thai stores meaning so you stop treating tone and politeness like optional extras.",
    heroSummary:
      "Thai keeps a compact sentence core, but meaning and social correctness are pushed into tone, particles, classifiers, and role-sensitive choices.",
    whyItMatters:
      "Thai becomes much easier when you realize the grammar can look simple while the social and sound systems do much more of the real work.",
    visualSections: [
      {
        title: "High-load systems",
        description: "These systems strongly affect meaning or naturalness.",
        items: ["Tone", "Politeness particles", "Pronoun and role choice"],
      },
      {
        title: "Medium-load systems",
        description: "These support precision and natural rhythm once the base line is stable.",
        items: ["Classifier use", "Time placement", "Sentence softening rhythm"],
      },
      {
        title: "Do not over-focus early",
        description: "These should not block first speaking confidence.",
        items: ["Rare formal registers", "Highly literary sentence shaping", "Perfect classifier theory"],
      },
    ],
    takeaways: [
      "Thai meaning does not live only in the core sentence frame.",
      "Tone and politeness carry real communicative weight.",
      "Social correctness is part of fluency, not an optional advanced layer.",
    ],
    loadRows: [
      { label: "Endings", value: 1, explanation: "Inflection is not the main beginner load." },
      { label: "Word order", value: 3, explanation: "Order matters, but the base frame is relatively compact." },
      { label: "Tone", value: 5, explanation: "Tone can directly change meaning and clarity." },
      { label: "Particles", value: 5, explanation: "Particles shape naturalness and politeness." },
      { label: "Politeness", value: 5, explanation: "Role and relationship strongly affect usable speech." },
    ],
    avoidEarly: "Do not learn Thai as if the words alone are enough. Tone, finish, and social choice deserve early attention.",
    ...getNextGuide("th", "meaning-load"),
  },
}

export function getSentenceSkeletonGuide(language: SupportedLanguage) {
  return sentenceSkeletonGuide[language] ?? sentenceSkeletonGuide[DEFAULT_LANGUAGE]!
}

export function getPhraseToPatternGuide(language: SupportedLanguage) {
  return phraseToPatternGuide[language] ?? phraseToPatternGuide[DEFAULT_LANGUAGE]!
}

export function getMeaningLoadGuide(language: SupportedLanguage) {
  return meaningLoadGuide[language] ?? meaningLoadGuide[DEFAULT_LANGUAGE]!
}

export function getGuideIndexIntro(language: SupportedLanguage) {
  const current = getLanguageConfig(language)!
  return {
    title: `${current.name} Visual Guides`,
    subtitle: `Fast structure-first guides for learning ${current.learningName} more quickly.`,
    summary:
      "These guides deconstruct how the language works so you can move from phrases to real speaking without drowning in grammar too early.",
  }
}
