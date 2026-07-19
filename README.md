# 🗣️ Language Academy

> Four languages, built to the same depth. **1,000 frequency-ranked words, 15 topic lessons, 12
> grammar rules, 8 phrase packs and a slang pack - in every single one.** Plus an AI conversation
> coach and real regional voices, both of which degrade gracefully to zero-key mode.

**[▶ Open the live app](https://vdapp41-spanish-academy.vercel.app)** - pick a language and start. No signup.

```bash
git clone https://github.com/BrysonW24/vdapp34-language-academy.git
cd vdapp34-language-academy
npm install && npm run dev
```

Open <http://localhost:3000>. **No API keys needed** - the coach and the voices both have real
offline fallbacks. 🎉

<p align="center">
  <img src="assets/home.jpg" width="100%" alt="Language Academy - choose the language you want to learn" />
</p>

---

## 🎯 The idea: frequency first

Most vocabulary apps teach words in the order a textbook chapter needs them. This one orders them
by **how often you will actually meet them**, and commits to that hard enough to build the whole
navigation around it.

Every word carries a **contiguous frequency rank** - 1 to 1000, no gaps, no duplicates, in all four
languages - grouped into a five-tier ladder:

| Tier | Range | The promise |
|---|---|---|
| **The Essential 50** | 1-50 | The words you cannot hold a sentence together without |
| **Core 100** | 51-150 | Enough to be understood, badly |
| **Everyday 250** | 151-400 | Ordinary daily situations |
| **Confident 350** | 401-750 | You stop translating in your head |
| **Fluent 250** | 751-1000 | Nuance, register, opinion |

The framing throughout is **survival → confidence → fluency**, not beginner / intermediate /
advanced. It describes what you can actually do, not how long you have been studying.

## 📊 What is actually in here

Counted from disk. Every language is built to the same depth - there is no token second language.

| Track | Words | Topics | Grammar | Phrase packs | Slang |
|---|---|---|---|---|---|
| 🇪🇸 **Spanish** | **1,000** | **15** | **12** | **8** | ✅ |
| 🇩🇪 **German** | **1,000** | **15** | **12** | **8** | ✅ |
| 🇨🇳 **Chinese** | **1,000** | **15** | **12** | **8** | ✅ |
| 🇹🇭 **Thai** | **1,000** | **15** | **12** | **8** | ✅ |

**5,507 content files** compiling to **591 prerendered pages**, across 19 routes. One shared UI
shell, four languages, zero per-language route forks.

## 📚 What a topic lesson gives you

**Cultural note → key phrases → grammar callouts (rule, explanation, examples, the common mistake)
→ a dialogue with speaker lines → a quiz.**

<p align="center">
  <img src="assets/topics-index.jpg" width="49%" alt="The 15 topics" />
  <img src="assets/topic-greetings.jpg" width="49%" alt="A topic lesson - cultural note and key phrases" />
</p>

The quiz supports four question types (`translate`, `fill-blank`, `multiple-choice`, `reorder`),
with immediate feedback and an explanation, one question at a time, and a scored finish.

<p align="center">
  <img src="assets/topic-greetings-quiz.jpg" width="100%" alt="A dialogue followed by the topic quiz" />
</p>

## 🎙️ Conversation coach

`/{lang}/coach` is a guided, scored speaking practice conversation.

- **With an `ANTHROPIC_API_KEY`** it holds a free-form conversation in your target language.
- **Without one** it replays **real lesson dialogues** from the curriculum. Not an error state, not
  a paywall - a genuinely usable offline mode built from content that already exists.

## 🔊 Real voices, optional

`/api/tts` serves high-quality speech through **ElevenLabs** when `ELEVENLABS_API_KEY` is set,
including a **region-matched voice picker** per language. Without a key it falls back to the
browser's built-in Web Speech voices, so pronunciation always works.

**Every key in this app is optional and server-side.** There is not a single `NEXT_PUBLIC_` secret,
so nothing sensitive can reach the browser bundle. See [`.env.example`](.env.example) - it documents
exactly what each key upgrades and what happens without it.

## 🧠 Visual guides: why a sentence is shaped that way

The second proposition, beyond vocabulary. Language-deconstruction surfaces that teach structure
rather than drilling words:

- **`/{lang}/guides/sentence-skeleton`** - the load-bearing shape of a sentence
- **`/{lang}/guides/phrase-to-pattern`** - turning a memorised phrase into a reusable pattern
- **`/{lang}/guides/meaning-load`** - which words are actually carrying the meaning
- **`/speaking-structure`** - a cross-language introduction to where speaking pressure sits

Plus **`/{lang}/timeline`**, a five-stage learning path grounded in the surfaces that exist, and
**`/{lang}/slang`** for the casual register textbooks skip.

## 📐 Grammar, phrases and words

<p align="center">
  <img src="assets/words-tiers.jpg" width="32%" alt="The five frequency tiers" />
  <img src="assets/words-essential-50.jpg" width="32%" alt="Word cards with rank, pronunciation and example" />
  <img src="assets/grammar-index.jpg" width="32%" alt="Grammar rule index" />
</p>
<p align="center">
  <img src="assets/grammar-ser-vs-estar.jpg" width="49%" alt="Ser vs estar explained" />
  <img src="assets/phrases-restaurant.jpg" width="49%" alt="Restaurant phrase pack" />
</p>

Each word card shows rank, the term (with its article for German), English, pronunciation, a
colour-coded part-of-speech badge across 13 types, gender where it applies, and an example sentence
in both languages. Phrase packs are tagged formal / informal / neutral.

## 🌏 One shell, four tracks

<p align="center">
  <img src="assets/track-spanish.jpg" width="24%" alt="Spanish track" />
  <img src="assets/track-german.jpg" width="24%" alt="German track" />
  <img src="assets/track-chinese.jpg" width="24%" alt="Chinese track" />
  <img src="assets/track-thai.jpg" width="24%" alt="Thai track" />
</p>

The language switcher preserves where you are: switch language from the words section and you land
in the words section, not back at a home page.

**Adding a language is adding a folder, not cloning the app.** Drop
`content/curriculum/{lang}/` in place, add a schema branch, and routing, tiers and navigation
follow. Every content file is validated by **Zod** at load time, so a malformed word file fails the
build rather than shipping a broken card.

## 🛠️ Tech stack

**Next.js 15.1** App Router · **React 19** · **TypeScript 5.7** (strict) · **Tailwind CSS 3.4** ·
**Zod 3.24** for per-language content schemas · **lucide-react** · **Vitest**.

19 routes and 5 API routes (coach, tts, and three voice endpoints). `next.config.js` adds six
permanent redirects mapping legacy unprefixed paths to `/es/*`, plus `X-Content-Type-Options:
nosniff`, `X-Frame-Options: DENY` and `Referrer-Policy: strict-origin-when-cross-origin`. Node >= 20.

```bash
npm run dev          # dev server
npm run build        # production build
npm run test         # vitest run
npm run type-check   # tsc --noEmit
npm run lint         # eslint
```

## ✅ Tests

**3 suites, 12 cases, all passing.** `smoke.test.ts` covers the content loaders across languages,
`visual-guides.test.ts` covers the guide surfaces, and `timeline-plan.test.ts` covers the staged
learning path.

## ⚠️ Honest status

- **There is no CI.** No `.github/` directory, so the suite above only runs when someone runs it
  locally. Nothing gates a push.
- **No spaced repetition and no flashcards.** Word cards are static reference - no flip, no reveal,
  no self-grading. The quizzes and the coach are the active-recall surfaces.
- **No progress persistence.** Nothing is stored between sessions; quiz state resets on reload.
- **Spanish remains the most editorially polished track.** All four are structurally complete to the
  same depth, but Spanish has had the most passes over its prose.
- **`content/curriculum/words/` is a dead duplicate** of the Spanish word set (1,000 files kept as
  a legacy fallback that the loader no longer reaches). Harmless, but it is dead weight.

## 📄 Licence

No licence file is present, which under GitHub's terms means **all rights reserved** - you may view
this repository, but not reuse it. If you want to build on it, open an issue and ask.

---

<p align="center">
  <em>Language Academy - part of the Vivacity app portfolio.</em><br />
  <a href="https://vdapp41-spanish-academy.vercel.app">Live app</a> ·
  <a href="CLAUDE.md">Architecture notes</a> ·
  <a href="ROADMAP.md">Roadmap</a> ·
  <a href="BACKLOG.md">Backlog</a>
</p>
