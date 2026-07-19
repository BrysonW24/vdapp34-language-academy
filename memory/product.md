# memory/product.md — Language Academy

Durable product context. Updated when the product proposition, audience, or voice changes — not for routine work logs.

## What this app is

A static, content-driven Next.js language learning surface. One shared UI shell renders curriculum from per-language JSON folders, language-prefixed by `/es`, `/zh`, `/de`, `/th`. The defining bet is that **the same UI generalises across languages** without per-language route forks.

## Audience

Adult self-learners who prefer structured curriculum over gamified streaks. The product makes opinionated choices: ranked frequency word lists (1–1000), thematic word groups (Essential 50 → Fluent 250), short grammar rule packs, and dialogue-anchored topics rather than spaced-repetition flashcards.

## Voice

- Plain English in chrome.
- Native script and pronunciation surfaced together; no hiding the target language.
- "Survival flow" framing — survival → confidence → fluency, not "beginner / intermediate / advanced".

## Content shape (canonical, normalised)

- **Words** — ranked 1–1000 per language; grouped into five buckets defined by `WORD_GROUPS` in `src/types/academy.ts`.
- **Topics** — 15 per language; each has cultural note, key phrases, grammar callouts, dialogue, mini-quiz.
- **Grammar rules** — 12 per language; explanation + examples + common mistake.
- **Phrase packs** — 8 per language; phrases grouped by formality with situation framing.

## Visual learning guides

The second proposition: language deconstruction surfaces under `/{lang}/guides/*` (sentence skeleton, phrase-to-pattern, meaning-load), plus a top-level `/speaking-structure` introduction. Designed to teach **why** a sentence is shaped a certain way, not just to drill vocabulary.

## What this app is not

- Not a flashcard SRS app.
- Not an AI tutor.
- Not a marketplace for teachers.
- Not a paid product. No billing, no auth, no accounts.
- Not part of the academy ecosystem — explicitly excluded from `vd-apps/academy-ecosystem/`.
