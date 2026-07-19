# CLAUDE.md - Language Academy

## What this app is

A unified, content-driven language academy built on Next.js 15 (App Router). One shared
codebase serves 12 language tracks via `[lang]`-prefixed routes: Spanish (`es`), Chinese
(`zh`), German (`de`), Thai (`th`), French (`fr`), Italian (`it`), Portuguese (`pt`),
Korean (`ko`), Japanese (`ja`), Turkish (`tr`), Filipino (`tl`), and Hindi (`hi`).

The UI is mobile-first and deliberately dense. The compaction system is the canonical
design language for this app: maximum information on the first viewport, collapsible
decision-tree lists, interest from type and colour rather than padding. The full method is
documented in `docs/ux-density-doctrine.md`.

## Content shape (current)

| Tier | Languages | Words | Topics | Grammar | Phrases | Slang |
|------|-----------|-------|--------|---------|---------|-------|
| Full | es, zh, de, th | 1,000 | 15 | 12 | 8 | yes |
| Lesson tracks | fr, it, pt, ko, ja, tr, tl, hi | ladder pending | 15 | 12 | 8 | yes |

All 12 languages have complete topic, grammar, phrase, and slang tracks. The four full
languages also have the 1,000-word Pareto ladder. Authoring the 1,000-word ladders for the
other eight languages is the main remaining content gap.

## Surfaces (routes under `/[lang]`)

- `words` - Pareto word ladder (essential-50 through all groups), part-of-speech colour
  rails, per-word Listen buttons
- `topics` - topic lessons (key phrases, grammar notes, dialogue, quiz)
- `grammar` - grammar rules
- `phrases` - phrase packs
- `slang` - everyday slang, with an honest "our best crack at it, may be imperfect" disclaimer
- `practice` - dialogue drill, phrase flashcards, sentence fill-in
- `coach` - AI Conversation Coach (turn-based speaking practice)
- `timeline` - guided learning roadmap
- `guides` - visual guides

## AI and audio features

- AI Conversation Coach: `src/lib/coach.ts` + `src/lib/coach-offline.ts`, route
  `src/app/[lang]/coach/`, proxy `src/app/api/coach/route.ts`. Works offline by replaying
  real lesson dialogues, or live with Claude when `ANTHROPIC_API_KEY` is set. Fails closed
  to offline.
- Premium regional voices: ElevenLabs via `src/lib/voices.ts` + `src/lib/voice-prefs.ts`,
  routes `src/app/api/tts` and `src/app/api/voices` (browse + add from the shared voice
  library), picker `src/components/academy/VoicePicker.tsx`. Falls back to the browser Web
  Speech API when `ELEVENLABS_API_KEY` is absent.
- Per-word and per-phrase audio: `src/components/academy/SpeakButton.tsx`.

All API keys stay server-side. Every key in `.env.example` is optional - the app runs fully
without them (browser voices + offline coach). Keys: `ELEVENLABS_API_KEY`, `ELEVENLABS_MODEL`,
`ANTHROPIC_API_KEY`, `COACH_MODEL`.

## Architecture

- Content lives in `content/curriculum/<lang>/{words,topics,grammar,phrases,slang}/`
- Shared Zod schemas, normalization, and loaders: `src/lib/academy-content.ts`
- Language registry + routing helpers + surface gating: `src/lib/languages.ts`
- Per-language accent + flag-derived gradients: `src/lib/language-visuals.ts`
- Visual guide content: `src/lib/visual-guides.ts`
- Guided timeline content: `src/lib/timeline-plan.ts`
- Canonical academy types + `WORD_GROUPS`: `src/types/academy.ts`
- App routes: `src/app/[lang]/`
- Shared UI: `src/components/academy/`

Content pipeline: JSON file -> language Zod schema -> normalizer -> AcademyWord / AcademyTopic
/ AcademyGrammarRule / AcademyPhrasePack -> RSC page -> static HTML. All content is validated
at build time. Invalid JSON is a build error, not a runtime crash.

Two content schema generations coexist and normalize to the same shared types. The original
languages (es/zh/de/th) use language-specific field names (`spanish` / `chinese` / `german`
/ `thai`, `titleEs`, `nameEs`, and so on). The newer languages use the generic schema
(`native` / `transliteration` / `titleNative` / `nameNative`).

## Content conventions

- Keep the UI shared and language-aware. Add curriculum inside the correct language folder
  instead of cloning the app.
- Prefer reusable schemas and loaders over language-specific page implementations.
- Level enum is strict: only `beginner`, `elementary`, and `pre-intermediate` are valid.
- No em dashes or en dashes in user-visible copy or content. Use a plain hyphen.

## Build, test, snapshot

- `npm run dev` / `npm run build` / `npm run type-check` / `npm run lint` / `npm run test`
- Build and type-check must pass before pushing.
- Do not run `next build` over a live `next start`/`next dev` on the same port (causes a
  stale-chunk ChunkLoadError). Stop the dev server first, or just run `type-check`.
- `npm run snapshot:full` regenerates the portable byte-exact backup (`SNAPSHOT.md` +
  `SNAPSHOT.manifest.sha256` + `SNAPSHOT.content.tar.gz`) via `scripts/snapshot.sh`. The
  artifacts are gitignored backups; the generator is tracked, so the snapshot is always
  reproducible from a clean checkout. Use `npm run snapshot` for source-only (no tarball).

## Known gaps

- 1,000-word ladders for fr/it/pt/ko/ja/tr/tl/hi are not authored yet (topics, grammar,
  phrases, and slang are complete for all 12 languages).
- `content/curriculum/es/modules/` exists but is not wired to a loader.
