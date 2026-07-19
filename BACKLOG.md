# BACKLOG.md — Language Academy

> Founder-readable backlog for the app itself. This is intentionally app-local and grounded in the current product surface rather than repo-wide readiness machinery.

## Status Key

- `shipped`
- `next`
- `soon`
- `later`
- `needs decision`

## Shipped

| Item | Status | Notes |
| --- | --- | --- |
| Unified four-language academy shell | `shipped` | One shared Next.js codebase serving `/es`, `/zh`, `/de`, `/th`. |
| Shared content normalization layer | `shipped` | `src/lib/academy-content.ts` converts language-specific JSON into shared app types. |
| Responsive speaking structure guide | `shipped` | New route at `/speaking-structure` explains where speaking pressure sits across four languages. |
| Landing-page entry into visual guide | `shipped` | Home page now links directly to the speaking-structure guide. |
| Visual Guides system | `shipped` | Language-aware guide index plus `sentence-skeleton`, `phrase-to-pattern`, and `meaning-load` for all four languages. |
| Guided learning timeline | `shipped` | `/[lang]/timeline` now gives each language a real five-stage learning path grounded in the current academy surfaces. |

## Highest-Leverage Next Work

| Item | Status | Why it matters |
| --- | --- | --- |
| Replace placeholder practice | `next` | The academy now has a real path; it needs a real training surface to reinforce it. |
| Pronunciation Pressure Map | `next` | The next guide should show which sound errors actually block understanding in each language. |
| Conversation Survival Tree | `next` | Learners need a visual map of the first real interaction moves that matter under pressure. |
| Route-level next-step recommendations | `next` | Words, topics, grammar, and phrases still need clearer momentum from page to page. |
| Cross-language coverage tracker | `soon` | We need a clearer view of where Spanish, German, Chinese, and Thai differ in depth today. |

## Product Gaps

| Gap | Status | Current reality | Desired outcome |
| --- | --- | --- | --- |
| Natural sequence of learning | `soon` | Timeline now defines the sequence, but not every route reinforces it yet. | Learner follows phrase -> pattern -> response -> review everywhere in the app. |
| Practice engine | `next` | Practice page is still placeholder. | Practice becomes a real fluency surface. |
| Guide system | `soon` | The first guide family now exists, but the next wave is still missing. | A broader family of responsive visual learning guides exists. |
| Cross-language structural clarity | `next` | Learner can browse content, but structural differences are not systematically taught. | Every language has clear pressure-aware explanation. |
| Progression recommendations | `soon` | Pages describe sections but do not strongly direct the next action. | Each core surface recommends the smartest next move. |

## Capability Opportunities

| Opportunity | Status | Description |
| --- | --- | --- |
| Visual language deconstruction | `next` | Build pages that deconstruct syntax, pronunciation, politeness, and meaning load visually. |
| Fast-start conversation training | `soon` | Focus early app experience on useful speaking moves instead of vocabulary accumulation alone. |
| Pattern-driven practice | `soon` | Convert topic / phrase / grammar content into drills that teach substitution and response. |
| Language-specific mastery lanes | `later` | Give Spanish, German, Chinese, and Thai distinct progression arcs without fragmenting the app. |
| Reusable guide framework | `soon` | Create a common page pattern for visual guides so new ones are fast to ship. |

## Guide Backlog

| Guide | Status | Core learner question |
| --- | --- | --- |
| Speaking Structure Map | `shipped` | Where does speaking pressure sit in each language? |
| Sentence Skeleton Map | `shipped` | What is the default shape of a usable sentence? |
| Phrase-to-Pattern Ladder | `shipped` | How do I go from memorized phrase to flexible sentence? |
| Meaning Load Map | `shipped` | Where does meaning live: endings, order, tone, particles, or social cues? |
| Pronunciation Pressure Map | `soon` | Which sound mistakes matter most for being understood? |
| Grammar Compression Guide | `soon` | What grammar matters now vs later? |
| Conversation Survival Tree | `soon` | What are the first speaking moves I need in a real interaction? |
| Word-to-Topic Bridge Map | `soon` | How do word groups become useful situations? |
| Politeness and Register Guide | `later` | How does tone or social role change what I should say? |
| Mistake Atlas | `later` | What errors are most predictable for learners in each language? |
| Fluency Loop Map | `later` | How should I practice one concept until it sticks? |

## Learning System Backlog

| Item | Status | Notes |
| --- | --- | --- |
| Promote Visual Guides beyond the More menu | `soon` | Decide whether guides should graduate into a more primary navigation position. |
| Add "recommended next step" cards on guide pages | `shipped` | Guide pages now keep learners moving through the intended sequence. |
| Add "recommended next step" cards on words / topics pages | `soon` | Make existing surfaces part of a path. |
| Connect timeline to guide milestones | `shipped` | Timeline now uses speaking-structure and the guide family as the path backbone. |
| Connect practice to guide milestones | `next` | Practice should reinforce the conceptual maps, not sit separately. |

## Language-Specific Backlog

## Spanish

| Item | Status | Notes |
| --- | --- | --- |
| Agreement-first speaking guide | `soon` | Help learners feel sentence cohesion early. |
| Ser vs estar speaking map | `soon` | High confusion, high payoff. |
| Topic-to-dialogue ladder | `later` | Build stronger bridge from vocab to real exchange. |

## German

| Item | Status | Notes |
| --- | --- | --- |
| Word-order visual guide | `next` | Probably the single highest-value German acceleration artifact. |
| Article / case chunking guide | `soon` | Teach the noun phrase as a unit, not isolated labels. |
| Clause-frame practice | `later` | Build confidence with sentence architecture under pressure. |

## Chinese

| Item | Status | Notes |
| --- | --- | --- |
| Tone-in-chunks guide | `soon` | Tone should be taught inside phrases, not as detached theory. |
| Measure-word guide | `soon` | High structural value, often poorly taught. |
| Particle and aspect pattern map | `later` | Great for intermediate acceleration. |

## Thai

| Item | Status | Notes |
| --- | --- | --- |
| Tone + politeness starter guide | `soon` | Critical to sounding natural and safe. |
| Social-role speaking guide | `later` | Strong differentiator for Thai learning UX. |
| Classifier + particle practice loops | `later` | Best once the practice engine exists. |

## Content and Quality Gaps

| Item | Status | Notes |
| --- | --- | --- |
| Keep docs aligned with shipped surfaces | `soon` | README, roadmap, and backlog need to stay synchronized as guide and timeline work lands. |
| Define cross-language coverage tracker | `soon` | Topics, grammar, and phrase maturity differ a lot by language. |
| Triage word-validation warnings | `soon` | `docs/word-validation-report.md` already shows quality cleanup opportunities. |
| Name alignment (`vdapp34` vs `vdapp41`) | `soon` | The app folder and package/docs are out of sync. |

## Suggested Build Order

1. Replace `practice` placeholder with chunk / substitution / recall flows
2. Ship `pronunciation-pressure`
3. Ship `conversation-survival-tree`
4. Add route-level "next best step" cards across words / topics / grammar / phrases
5. Define cross-language coverage tracking and cleanup priorities

## Notes

- If a future static poster is still useful, generate it from the responsive guide content rather than making SVG the primary source of truth.
- The product should increasingly optimize for **speed to useful speech**, not only content completeness.
