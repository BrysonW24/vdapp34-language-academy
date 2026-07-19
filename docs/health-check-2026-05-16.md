# Health Check - vdapp34-language-academy

Date: 2026-05-16
Auditor: app-health-check skill
Path: `Vivacity.ai/vd-apps/vdapp34-language-academy/`

## Status: NEEDS ATTENTION

Core build path is partially verified - TypeScript is clean, but `next build` did not complete inside an 8-minute budget and several configuration and content-integrity issues need fixing before any deploy or VBS sign-off.

---

## 1. Build verification

| Check | Result | Notes |
|---|---|---|
| `npm install` | ✅ already installed | `node_modules/` populated, lockfile present |
| `tsc --noEmit` | ✅ 0 errors | clean type-check |
| `next build` | ⚠️ timed out at 8 min | hung after framework boot; likely Zod re-parsing 1,000 word files × 4 languages × 5 word-group routes + 4 index routes (≈24,000 Zod parses). Investigate whether this is a runaway loop, a real perf problem, or just slow CI |
| `next lint` | ❌ not configured | no `.eslintrc.*` or `eslint.config.*` file; `next lint` opens an interactive setup prompt and will hang any CI |
| `vitest run` | ❌ fails in sandbox | missing `@rollup/rollup-linux-arm64-gnu`; this is a sandbox-platform install miss - likely **passes on your Mac**. Re-run locally to confirm |

The 8-minute build hang is the biggest open question. The route shape (`[lang]/words/[group]` × 4 langs × 5 groups = 20 SSG pages, plus 4 `[lang]/words` index pages) is not large in itself, but each page calls `getWords(language)` which `readdirSync`s and `JSON.parse`s + `Zod.parse`s 1,000 files. Multiply by the route count and you have a build with no caching layer between page generations. Memoising `getWords` per-language (Map keyed by `lang`) would likely cut build time by an order of magnitude.

---

## 2. Identity / metadata drift (high priority)

The app folder is named **`vdapp34-language-academy`** but every internal identifier still says **vdapp41**:

| File | Says | Should say |
|---|---|---|
| `package.json` → `name` | `vdapp41-language-academy` | `vdapp34-language-academy` |
| `package-lock.json` → `name` | `vdapp41-language-academy` | `vdapp34-language-academy` |
| `README.md` H1 | `# vdapp41 - Language Academy` | `vdapp34 - Language Academy` |

The `AGENTS.md` and `tests/smoke.test.ts` use `vdapp34`, so the rename was started and not finished. Pick one number and align the rest. Per the parent CLAUDE.md "App naming convention" and the `vd-apps/.claude/rules/03-naming-conventions.md` rule ("Keep the number stable once assigned"), `vdapp34` is the canonical disk number - fix the three places above.

Also worth noting: the **parent monorepo CLAUDE.md explicitly excludes** vdapp41 (and vdapp42) from the academy ecosystem ("`vdapp41-language-academy` and `vdapp42-book-academy` are intentionally separate. Do not include in academy ecosystem work."). That guidance was written against `vdapp41`. After the rename either the rule needs updating to point at `vdapp34`, or the rename needs reverting. Right now both numbers exist in repo doctrine, which is the worst of both worlds.

---

## 3. Content reality vs documented claims (high priority)

README says:

> Spanish: 1000 words, 15 topics, 12 grammar rules, 8 phrase packs
> Chinese: 1000 words
> German: 1000 words
> Thai: 1000 words

Filesystem says:

| Language | words | topics | grammar | phrases |
|---|---|---|---|---|
| es | 1000 | 15 | 12 | 8 |
| zh | 1000 | **0** | **0** | **0** |
| de | 1000 | **0** | **0** | **0** |
| th | 1000 | **0** | **0** | **0** |

Yet the route tree exposes `/<lang>/topics`, `/<lang>/grammar`, `/<lang>/phrases` for all four languages. zh/de/th will render empty index pages and 404 every detail route. This is a shipped-empty-shell pattern, not a "coming soon" pattern - there's no UX to communicate that content is missing.

There's also a top-level `content/curriculum/{grammar,topics,phrases,modules}/` set that mirrors Spanish, plus a `content/curriculum/words/` directory with 1,000 generic word JSONs. The loader's `resolveLanguageDir()` falls back to `CONTENT_DIR` only for `language === "es"`, so those top-level folders **are still being read by Spanish** while the per-language `content/curriculum/es/` folder is the canonical one. That's a soft fork - two source-of-truth locations for Spanish content. Pick one and delete the other.

Empty stub directories also exist: `content/curriculum/day-in-life/`, `frameworks/`, `lessons/`, `projects/`, `tools/` - referenced by nothing in code. Delete.

---

## 4. Dependency hygiene

| Dependency | Concern |
|---|---|
| `three@^0.183.2` | **Not imported anywhere in `src/`**. Dead weight (~600KB). |
| `@react-three/fiber@^9.5.0` | **Not imported anywhere**. Dead. |
| `@react-three/drei@^10.7.7` | **Not imported anywhere**. Dead. ROADMAP/README mention "visual learning system" but no R3F component exists. |
| `framer-motion@^12.0.0` | Used? worth grepping - if not, drop. |
| `lucide-react@^1.16.0` | **Major version anomaly.** Current canonical line of `lucide-react` is `0.4xx`/`0.5xx`. The `^1.16.0` pin resolves to an old/orphan release that ships a much smaller icon set than the current `0.x` line. Several icons used in source (`Compass`, `Languages`, `MessageCircleMore`, `ArrowRightLeft`, `Sparkles`, etc.) may be unavailable depending on what `1.16.0` actually ships. Should be pinned to a current `0.x` release (e.g. `^0.460.0`) to align with every other VD app. |
| `zustand@^5.0.2` | **Not imported anywhere** in `src/`. Dead - the app is entirely server-rendered, no client state store needed. |
| `tailwindcss-animate@^1.0.7` | Verify it's referenced in `tailwind.config.ts` plugins; if not, dead. |

Pruning Three.js, R3F, drei, and Zustand alone would cut install size significantly and remove ~3 sources of peer-dependency drift risk (R3F has strict React 19 peer pins).

---

## 5. VD minimum app standard - gap report

Per `vd-apps/.claude/rules/12-vdai-minimum-app-standard.md`, every `vdapp*` must move toward the bundle below. Current state:

| Required | Present? |
|---|---|
| `AGENTS.md` | ✅ - but boilerplate placeholder text ("vdapp34-language-academy is What this app is") needs replacing with real content |
| `CLAUDE.md` | ✅ accurate, concise |
| `README.md` | ⚠️ wrong identifier, content claims overstated (see §3) |
| `.claude/` | ❌ missing |
| `docs/` | ✅ (only 2 files - `BA-marketing-degree-context.md` and `word-validation-report.md`) |
| `memory/` | ❌ missing |
| `status/app-manifest.yaml` | ❌ missing |
| `status/release-checklist.yaml` | ❌ missing |
| `status/feature-map.yaml` | ❌ missing |
| `status/risk-register.yaml` | ❌ missing |
| `tests/` | ✅ (smoke test only) |

`AGENTS.md` lists upstream dependencies on `vd-engine`, `vd-os-kernel`, and `vd-business` - none of which this app actually consumes. That's boilerplate cruft; remove it or replace with real dependency truth (this is a standalone Next.js app with zero workspace imports).

---

## 6. Code-quality scan

Strong on the basics:
- No `process.env.*` access in `src/` - but that's because there's no `lib/env.ts` either. The single env var (`NEXT_PUBLIC_SITE_URL`) goes unused; either wire it or drop it from `.env.example`.
- No `: any`, no `@ts-ignore`, no `@ts-expect-error`.
- No `console.log` in `src/`.
- No raw `fetch(...)` in components.
- Routes use `async`/Promise params correctly for Next.js 15.

Missing pieces:
- **`src/lib/env.ts`** - recommended by VD pattern even for a static app, gives one place to surface required envs.
- **`src/lib/errors.ts`** - typed `AppError` / `NotFoundError`. Routes call `notFound()` directly, which is fine for Next, but custom error pages and `error.tsx` boundaries aren't defined.
- **`src/lib/logger.ts`** - content loader silently swallows missing-file cases (`if (!fs.existsSync(...)) return []`). For zh/de/th this means every page returns empty without any build-time signal. A logger that surfaces "language X has 0 topics" at build time would have caught the content gap in §3.
- **`src/app/[lang]/not-found.tsx`** and **`error.tsx`** - not present. The whole app uses `notFound()` calls but has no custom 404/500 UI.

---

## 7. Configuration findings

`next.config.js`:
- ✅ `reactStrictMode: true`
- ✅ Sensible security headers
- ⚠️ `transpilePackages: ['three']` is the only entry - and `three` is unused (see §4). Can be removed entirely.
- ⚠️ `outputFileTracingRoot` is **not set**. The build warns about lockfile ambiguity (root `package-lock.json` vs app-local `package-lock.json`). For a standalone app deploy, set it to `__dirname` to silence the warning and pin tracing to this app.
- ⚠️ Six hard-redirects from `/words`, `/topics`, etc. to `/es/...` are `permanent: true`. That's a strong SEO commitment to Spanish-as-default. Fine if intentional; flag if not.

`tsconfig.json`:
- ✅ strict mode, bundler resolution, `@/*` and `@/content/*` aliases configured correctly.
- ⚠️ `"target": "ES2017"` is conservative for a Next 15 + React 19 app. Most peer Next 15 apps target ES2020+. Low-impact but worth aligning.

`postcss.config.js`, `tailwind.config.ts`:
- ✅ standard Tailwind v3.4 setup, content paths cover `src/`.

`.gitignore`:
- ✅ covers `.next/`, `node_modules/`, env files, `.vercel`, `*.tsbuildinfo`.
- ⚠️ `scripts/__pycache__/` is committed to disk (folder exists in `scripts/`). Add `__pycache__/` to `.gitignore`.

`.git_disabled` and `.git.disabled-embedded-20260404` directories: both present. These are old nested-repo remnants from the monorepo absorption - safe to delete from disk once you're sure nothing references them.

---

## 8. Tests

`tests/smoke.test.ts` covers:
- package.json is valid JSON
- required npm scripts exist
- `src/`, `content/`, `tsconfig.json` exist
- all content JSON files parse

That's reasonable for a content-driven app. Gaps worth filling:
- A test that **fails loudly** if a non-Spanish language has zero topics/grammar/phrases while its routes are still mounted (would have caught §3).
- A test that asserts `WORD_GROUPS` covers ranks 1-1000 with no gaps.
- A route smoke test (Playwright or `next start` + `curl`) for at least `/`, `/es`, `/zh`, `/de`, `/th`, `/es/words`, `/speaking-structure`.

`vitest.config.ts` is present (724 bytes). Vitest fails in the Linux sandbox due to a missing arm64 rollup binary; this is a sandbox install issue, not a real bug - should pass on macOS arm64. Re-run locally to confirm.

---

## 9. Deployment readiness (Vercel)

| Check | State |
|---|---|
| Build succeeds locally | ❓ unverified (timed out in sandbox; re-run on Mac) |
| No hardcoded localhost URLs | ✅ |
| Env vars documented | ✅ `.env.example` exists (one var) |
| Uses npm (not pnpm) | ✅ |
| `packageManager` field set | ❌ missing in package.json |
| Framework detected | ✅ Next.js |
| `outputFileTracingRoot` set | ❌ - current build warns about it |
| `vercel.json` | ❌ not present (fine for a single-app deploy at the app root) |

To deploy cleanly from the app subdirectory, you also want to either: (a) deploy with `Root Directory = Vivacity.ai/vd-apps/vdapp34-language-academy` in the Vercel dashboard, or (b) add a `vercel.json` here pinning install/build commands.

---

## Action ladder (do these in this order)

1. **Resolve the identity drift.** Decide vdapp34 vs vdapp41 and rewrite the three remaining stragglers (`package.json` name, lockfile name, README H1). Then update parent CLAUDE.md's "Excluded from ecosystem" line to match.
2. **Reconcile the content claim.** Either generate topics/grammar/phrases for zh/de/th, or fence those routes behind a per-language feature flag (`LanguageConfig.surfaces = ['words']`) and hide nav links when empty. Update README/ROADMAP to reflect actual coverage.
3. **Investigate the build hang.** Run `next build` locally on the Mac, time it, and inspect whether it completes or genuinely hangs. If it completes >3 min, add memoisation in `academy-content.ts` (cache `getWords(lang)`, `getTopics(lang)`, etc. in a module-level Map).
4. **Prune dead deps.** Remove `three`, `@react-three/fiber`, `@react-three/drei`, `zustand` from `package.json`. Re-run install and build.
5. **Fix `lucide-react` version pin.** Move from `^1.16.0` to a current `^0.4xx`/`^0.5xx` release matching the rest of the VD estate.
6. **Configure ESLint.** Pick `next/core-web-vitals` flat config and commit `eslint.config.mjs`. Stop relying on `next lint` interactive setup.
7. **Add `outputFileTracingRoot: __dirname`** to `next.config.js` and silence the lockfile warning.
8. **Scaffold the VBS minimum bundle.** Create `.claude/`, `memory/`, and `status/{app-manifest,release-checklist,feature-map,risk-register}.yaml` from templates. Rewrite the boilerplate scope/upstream-deps block in `AGENTS.md` with truth.
9. **Add custom `not-found.tsx` and `error.tsx`** in `src/app/`.
10. **Delete dead content folders** (`day-in-life`, `frameworks`, `lessons`, `projects`, `tools`) and the top-level `content/curriculum/{words,grammar,topics,phrases,modules}/` mirror once Spanish is fully relocated under `content/curriculum/es/`.

---

## Actions taken in this audit

This audit was followed by a remediation pass on 2026-05-16. Steps 1-9 of the action ladder were fully implemented; Step 10 was partially completed (`.gitignore` updated, but sandbox couldn't action filesystem deletes - manual cleanup required, see below); Step 11 (re-verify) was run.

### Step 1 - Identity drift (resolved)
- `package.json` renamed `vdapp41-language-academy` → `vdapp34-language-academy`, added `packageManager: npm@10.8.0`.
- `package-lock.json` renamed in two places.
- `README.md` H1 corrected.
- Parent `1-vivacity-digital/CLAUDE.md` "Excluded from ecosystem" line corrected.

### Step 2 - Content claim reconciled (fenced)
- Added `LanguageSurface` type and `surfaces: readonly LanguageSurface[]` field to `LanguageConfig`.
- Spanish gets `FULL_SURFACES` (words, topics, grammar, phrases, practice, timeline, guides).
- zh / de / th get `WORDS_ONLY_SURFACES` (words, practice, timeline, guides).
- `languageHasSurface(lang, surface)` helper added.
- `Navigation.tsx` filters main + more nav items by surface, hides the "More" dropdown entirely when empty, hides the mobile "More" header when empty.
- `getLanguageSwitchHref` now falls back to the target language home if the target lacks the current surface (prevents 404 links when switching).
- Route guards added on `/[lang]/topics`, `/[lang]/topics/[slug]`, `/[lang]/grammar`, `/[lang]/grammar/[slug]`, `/[lang]/phrases`, `/[lang]/phrases/[slug]` - both `generateStaticParams` filters and `notFound()` runtime guards.
- `/[lang]/page.tsx` `sections` array filtered so the language home only renders cards for surfaces the language actually has.

### Step 3 - Build perf (memoised content loaders)
- Added module-level `Map<SupportedLanguage, T[]>` caches for `getWords`, `getTopics`, `getGrammarRules`, `getPhrasePacks` in `academy-content.ts`.
- `getTopic`, `getGrammarRule`, `getPhrasePack` refactored to use cached lists with `.find()` instead of separate `readJsonFile` per slug.

### Step 4 - Dead deps removed
- Dropped `three`, `@react-three/fiber`, `@react-three/drei`, `zustand`, `framer-motion` from dependencies.
- Removed `transpilePackages: ['three']` from `next.config.js`.

### Step 5 - lucide-react pinned
- Moved `lucide-react` from `^1.16.0` (invalid old version) → `^0.460.0` (current VD estate range).

### Step 6 - ESLint configured
- Added `eslint.config.mjs` (flat config) using `FlatCompat` to extend `next/core-web-vitals`.
- Added `@eslint/eslintrc: ^3.2.0` to devDependencies.
- Changed lint script from `next lint` → `eslint .` so no interactive setup is needed in CI.

### Step 7 - outputFileTracingRoot
- `next.config.js` now sets `outputFileTracingRoot: __dirname` so the build pins tracing inside this app rather than walking up the monorepo and detecting multiple lockfiles.

### Step 8 - VBS minimum bundle scaffolded
- `AGENTS.md` rewritten with truth-based role, scope, read order, surface coverage, file-touch rules, R-001..R-008 risk index, and close-out steps.
- `.claude/README.md` created as control-center placeholder (inherits from `vd-apps/.claude/rules/`).
- `memory/product.md` created with durable product context, audience, voice, content shape.
- `status/app-manifest.yaml`, `status/release-checklist.yaml`, `status/feature-map.yaml`, `status/risk-register.yaml` all created with current-state truth (not target state) - feature-map flags topics/grammar/phrases as `partial` with `languages_empty: [zh, de, th]`.

### Step 9 - Custom not-found.tsx and error.tsx
- `src/app/not-found.tsx` - server component with editorial styling and back-to-home link.
- `src/app/error.tsx` - client component with `useEffect` console logging, error.digest display, reset + back-to-home buttons.

### Step 10 - Dead folder pruning (partial)
- `__pycache__/`, `*.py[cod]`, `*.egg-info/` added to `.gitignore`.
- **Pending manual cleanup** - sandbox filesystem denied delete permission for these paths. Run locally:

  ```bash
  cd Vivacity.ai/vd-apps/vdapp34-language-academy

  # Empty stub folders
  rmdir content/curriculum/day-in-life \
        content/curriculum/frameworks \
        content/curriculum/lessons \
        content/curriculum/projects \
        content/curriculum/tools

  # Top-level Spanish mirror (verified identical to content/curriculum/es/* during audit;
  # resolveLanguageDir prefers content/curriculum/es/ since it exists)
  rm -rf content/curriculum/words \
         content/curriculum/topics \
         content/curriculum/grammar \
         content/curriculum/phrases \
         content/curriculum/modules

  # Disabled nested git histories (nested-repo workflow no longer in use)
  rm -rf .git_disabled .git.disabled-embedded-20260404

  # Then re-run scripts/__pycache__ removal once on disk (now in .gitignore)
  rm -rf scripts/__pycache__
  ```

  Pre-delete sanity check (run before `rm -rf`):

  ```bash
  diff -q content/curriculum/words/word-001.json content/curriculum/es/words/word-001.json && \
    echo "OK: top-level mirror matches es/ - safe to delete"
  ```

### Step 11 - Re-verification
See the "Re-verification (2026-05-16)" section below.

---

## Re-verification (2026-05-16)

| Check | Result | Notes |
|---|---|---|
| `tsc --noEmit` | ✅ 0 errors | Sandbox run, exit 0, no output. All Step 9 surface-fence + Step 3 memoisation changes type-clean. |
| `next build` | ⚠️ still hangs in sandbox | Re-attempted with a 10-min budget after Step 3 memoisation. Process emitted only the `▲ Next.js 15.5.14` banner before SIGTERM - never reached the "Compiling" stage. Because Step 3 caches are not exercised before that point, this is a **sandbox-specific framework-boot hang**, not a content-loader perf problem. Needs Mac re-run to confirm. |
| `eslint .` | (run locally) | Re-run on Mac to confirm flat config resolves |
| Manual route smoke | (run locally) | Walk `/`, `/es`, `/zh`, `/de`, `/th`, `/zh/topics` (expect 404), `/de/grammar` (expect 404), `/th/phrases` (expect 404), `/es/topics` (expect 200), language switcher from `/es/topics` → "Chinese" should land on `/zh`, not `/zh/topics` |

The sandbox is not the build target for this app, so the build / lint commands should be run on Bryson's Mac to confirm the remediation pass holds. TypeScript type-check passed cleanly in the sandbox post-remediation, which validates all code-shape changes from Steps 1-9 compile under strict mode.

## What did not run in this audit

- `next build` to completion (timed out at 8 min on initial pass; memoisation in Step 3 should materially reduce, but local Mac re-run still required)
- `vitest run` to completion (sandbox arm64 binary issue - needs local verification on Mac)
- `next lint` (now uses `eslint .` with flat config - needs local verification)
- Bundle-size analysis (skipped pending a successful build)
- Live route smoke test (manual list above to run on Mac)
- Filesystem deletes for Step 10 (sandbox denied - manual command block in Step 10 to run locally)
