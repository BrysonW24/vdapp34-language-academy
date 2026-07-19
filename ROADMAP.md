# ROADMAP.md — Language Academy

> Generated from current app reality on 2026-05-17. This roadmap reflects the app that exists today: a shared Next.js academy for Spanish, German, Chinese, and Thai with reusable content loaders, language-prefixed routes, a visual guide system, and a guided timeline.

## Current State

Language Academy is already strong in one specific way:

- one shared frontend for four languages
- normalized content loading through `src/lib/academy-content.ts`
- reusable routes for words, topics, grammar, phrases, practice, and timeline
- high word-count coverage across all four languages
- richer Spanish topic / grammar / phrase coverage than the other tracks

Language Academy is currently weak in a different way:

- the learning journey is still mostly "content buckets"
- the app explains *what* exists better than it explains *how to learn fast*
- practice is still placeholder
- Chinese / German / Thai have word depth but less structured speaking guidance than Spanish

The product opportunity is not just "add more lessons."

The opportunity is to turn the academy into a **visual language acceleration system** where learners can quickly understand:

- where a language carries meaning
- what matters first
- how to turn words into usable speech
- what to ignore early
- how to progress from chunked phrases to live response

## Product Direction

### Current state

The app currently behaves like a polished curriculum browser.

### Target state

The app should behave like a **language deconstruction and fluency-building machine**.

That means every language track should help the learner answer:

1. How is this language structurally different from the others?
2. Where does meaning live in this language?
3. What speaking moves matter first?
4. How do I go from phrase -> pattern -> response?
5. What is the fastest route to feeling useful in conversation?

### Migration step

Build a new **Visual Guides** layer that sits alongside words, topics, grammar, and phrases, then thread those guides into practice and timeline so the app teaches sequence, not only inventory.

## North Star

Language Academy should become a visually grounded system that helps a motivated learner:

- understand the structure of a language quickly
- choose the right first focus
- practice the highest-leverage speaking patterns
- build confidence before drowning in grammar detail

## Learning Model

The app should teach with this natural sequence:

1. Hear a useful phrase
2. Repeat the chunk
3. Notice the pattern
4. Swap one part
5. Use it in a live response
6. Revisit it later through spaced practice

This sequence should become the canonical learning model across all four languages.

## Strategic Workstreams

## 1. Visual Guides

These are responsive, editorial, high-signal guide pages that deconstruct language visually.

### Shipped

- `speaking-structure` guide
- `sentence-skeleton`
- `phrase-to-pattern`
- `meaning-load`
- language-aware guide index under `/{lang}/guides`

### Next guides

- Sentence Skeleton Map
- Meaning Load Map
- Phrase-to-Pattern Ladder
- Pronunciation Pressure Map
- Grammar Compression Guide
- Conversation Survival Tree
- Word-to-Topic Bridge Map
- Politeness and Social Register Guide
- Mistake Atlas
- Fluency Loop Map

### Product rule

Each guide should answer one learner question clearly. No guide should feel like a prettified textbook chapter.

## 2. Guided Pathways

The app needs pathways that tell the learner what to do next.

### Target outcome

- a beginner can start anywhere and still be guided toward the right next step
- words, phrases, topics, and grammar feel connected
- Chinese / German / Thai stop feeling like "word dumps with nice pages"

### Likely implementation

- keep threading guides through `timeline`
- tie guides into `practice`
- add route-level "next best action" cards
- show recommended order by language maturity and learner goal

## 3. Practice System

Practice should stop being a placeholder and become the engine that turns guides into fluency.

### Practice types

- chunk repetition
- slot substitution drills
- listening discrimination
- tone / pronunciation contrast drills
- survival conversation branching
- pattern recall
- topic recap loops

### Product rule

Practice should reinforce the academy's mental models, not just quiz isolated facts.

## 4. Language-Specific Depth

Each language needs its own pressure-aware teaching strategy.

### Spanish

- agreement
- verb forms
- sentence confidence through phrase mutation

### German

- word order
- article / gender / case chunking
- sentence architecture confidence

### Chinese

- tones in phrase context
- particle and aspect pattern recognition
- order-led speaking chunks

### Thai

- tone and rhythm
- social finish and politeness
- role-aware speaking patterns

## 5. Content Quality and Coverage

The app should not only add more content. It should make existing content more explainable and more coherent.

### Current known issues

- README content counts are stale
- cross-language maturity is uneven outside word lists
- validation reports already show word-level quality opportunities
- language-specific topic / grammar / phrase depth needs clearer coverage planning

## Phase Plan

## Phase 1 — Foundation for fast learners

Goal: make the app smarter without dramatically expanding surface area.

- Ship `speaking-structure`
- Add roadmap and backlog
- Create guide system conventions
- Build `sentence-skeleton`
- Build `phrase-to-pattern`
- Build `meaning-load`
- Add a clear "Visual Guides" entry point
- Replace placeholder `timeline` with real guided progression

## Phase 2 — Guided learning

Goal: turn content surfaces into a coherent path.

- Build `conversation-survival-tree`
- Build `pronunciation-pressure`
- Add "next best step" recommendations on core pages
- Connect topic / grammar / phrase pages more explicitly into the timeline

## Phase 3 — Practice engine

Goal: make the app actively train speech.

- Replace placeholder `practice`
- Add chunk drills
- Add substitution drills
- Add pronunciation / tone practice per language
- Add topic recap loops

## Phase 4 — Language mastery lanes

Goal: treat each language as structurally distinct while keeping the product unified.

- Add per-language pressure maps
- Add mistake atlases
- Add register / politeness guides
- Add smarter progression recommendations by language

## Design Principles

- responsive first, not poster first
- visual clarity over content density
- explainable structure over abstract linguistics
- phrase-first learning over grammar-first overload
- shared system, language-specific pressure
- editorial and premium, not educational sludge

## Success Signals

This roadmap is working if:

- learners can explain the difference between the four languages structurally
- a beginner knows what to practice next without guessing
- guides feel useful enough to revisit
- practice becomes the natural next step after a guide
- Chinese, German, and Thai feel like real academy tracks rather than future promise

## Near-Term Recommendation

If we are choosing the smartest next build, the order should be:

1. `sentence-skeleton`
2. `phrase-to-pattern`
3. `meaning-load`
4. real `timeline`
5. real `practice`
