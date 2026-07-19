# UX Density & Compaction Doctrine

> Handoff for any agent working on the Language Academy UI. This is the design
> system we converged on. Follow it so the app stays consistent and dense.

## 1. The one principle

**Compact is the keyword.** The app is mobile-first (target 390px wide). The goal
on every screen is to show the **most useful information on the first viewport**,
because otherwise the value gets lost below a long vertical scroll.

Density is non-negotiable. **Interest comes from typography, colour, rhythm, and
micro-interaction - never from added padding.** An "interesting" design that is
tall and airy is a fail. If you are tempted to add vertical space, find another
way (a colour accent, a weight change, a collapsible).

Hard rules that ride along: **no em-dashes** (plain hyphen only; a git hook
blocks them), TypeScript strict (no `any`), verify on the iOS sim before claiming
done.

## 2. Global levers (change once, applies everywhere)

- **`src/components/ui/card.tsx`** is the single biggest lever. Padding is `p-4`
  (was `p-6`), radius `rounded-[16px]` (was `rounded-[22px]`), header gap
  `space-y-1`. Every card in the app inherits this. Do not re-inflate it.
- **`src/lib/language-visuals.ts`** holds the per-language `accent` colour and the
  flag-derived CTA `gradient`. Reuse `getAccent(code)` / `getGradient(code)` for
  any per-language colour. Gradient stops are tuned dark enough for white text.

## 3. The "decision tree" rule (most important pattern)

When a screen lists **many options** (topics, grammar rules, phrase packs, word
tiers, languages), do **not** render a grid of big cards. Render a **compact
collapsible accordion**: every item is one tight tappable row so the whole set is
visible at once; tapping unfolds the detail + the action link.

Three reusable components implement this, all sharing the same idiom
(`rounded-[16px] border bg-white/55 divide-y`, row = `px-3 py-2` button, a
`ChevronDown` that rotates 180deg on open):

| Component | Used by |
|---|---|
| `components/academy/LanguagePicker.tsx` | Home page language chooser |
| `components/academy/WordGroupLadder.tsx` | The Pareto word-frequency tiers (home + `/words`) |
| `components/academy/AcademyAccordion.tsx` | Generic: topics / grammar / phrases listing pages |

`AcademyAccordion` is the one to reuse for any new list. Its item shape:
`{ id, emoji? | rank?, title, subtitle?, rightLabel?, meta?, description, href, cta }`.
Pass `accent` for the CTA colour. The collapsed row shows leading glyph + title +
a small right chip + chevron; expanding reveals subtitle + description + meta +
the action link.

## 4. Compact tiles & rows (when not an accordion)

- "Explore the Academy" = a tight **2-col grid of small tiles** (icon chip +
  label + one short, complete description). No card chrome, `gap-2`.
- "Switch Languages" = **compact rows** (flag + name + native name + arrow). We
  deliberately **dropped the repeated per-language descriptions** - do not
  re-add boilerplate that repeats on every row.
- The **word list** (`/words/[group]`) = a flush **ruled list** (no card boxes),
  each row fronted by a 3px **part-of-speech colour rail** (`POS_COLORS`). Interest
  comes from the grammar colour-coding, not spacing.

## 5. The screen shell convention

Every inner screen uses the same shell:

```tsx
<div className="container mx-auto max-w-2xl space-y-4 px-4 py-5">
  <BackLink href={langHref(language.code)} label={`${language.name} academy`} />
  <div>
    <h1 className="font-serif text-xl font-semibold text-editorial-ink">{title}</h1>
    <p className="text-sm leading-relaxed text-editorial-muted">{lead}</p>
  </div>
  ...
</div>
```

- Container: `max-w-2xl px-4 py-5 space-y-4` (mobile-first single column). Came
  down from `py-8 space-y-8`.
- Heading: `font-serif text-xl` (came down from `text-2xl sm:text-3xl`).
- Lead paragraph: `text-sm` (came down from `text-lg`).
- **Back nav is mandatory.** Use `components/academy/BackLink.tsx` as the first
  child on every screen reached by a selection, so the learner is never stranded.
  Listing pages link back to the language home; detail pages link back to their list.

## 6. Typography & the "one reading aid" rule

Hierarchy inside a dense row:
- Primary term/title: `font-serif font-semibold text-editorial-ink` (~text-[15px]).
- Meaning (English): readable ink, right after the term, so it is easy to see.
- Reading aid (romanization): **small italic muted, shown ONCE**.
- Micro-labels (POS, level, count): tiny pills, `text-[9px]`/`text-[10px]`.

**One reading aid, deduped, no slashes.** A word/phrase may carry several phonetic
fields (`transliteration`, `pronunciation`, `secondary`). Show a single one:
`(word.transliteration ?? word.pronunciation)` with `/` stripped. Never render two
(the bug we fixed was Thai showing `thi /thi/` - transliteration AND pronunciation).
This was unified across the word list, phrase packs, and topic key-phrases.

## 7. Audio / "good voice"

`SpeakButton` (`components/academy/SpeakButton.tsx`) is the tap-to-hear control;
drop it anywhere a learner should hear native text (it is on every word row, plus
phrase/slang/coach lines). It calls `useTTS().speak(text, language)`, which:
- uses the learner's **selected ElevenLabs voice** when one is set (see
  `VoicePicker.tsx` + `voice-prefs.ts` + the `/api/voices*` + `/api/tts` routes),
- falls back to the browser Web Speech voice otherwise.

So premium quality is opt-in per language via the picker; the buttons need no
per-call config. Provider keys stay server-side (env only; `.env.local` gitignored).

## 8. The conversation coach

The coach is a **chat thread**, not stacked panels: compact header, a real
transcript (tight bubbles `px-3 py-1.5`, subtle thread bg, taller scroll), a slim
"Say this" strip, and a composer bar (mic + input + send). See
`components/academy/coach/ConversationCoach.tsx`.

## 9. Checklist for a new or edited screen

- [ ] Shell: `container mx-auto max-w-2xl px-4 py-5 space-y-4`
- [ ] `BackLink` as the first child
- [ ] Heading `font-serif text-xl`, lead `text-sm`
- [ ] Many options? Use `AcademyAccordion`, not a big-card grid
- [ ] Cards rely on the shared `p-4` Card; bespoke panels `p-3`/`p-4`, grids `gap-2`
- [ ] One reading aid only (deduped, no slashes)
- [ ] Meaning prominent and easy to see
- [ ] Interest from colour/type/interaction, not padding
- [ ] No em-dashes; type-check + build clean; checked on the sim
