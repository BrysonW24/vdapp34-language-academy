# AGENTS.md — vdapp34-language-academy

## Role

A unified, content-driven Next.js 15 language academy serving Spanish, Chinese, German, and Thai from one shared codebase via language-prefixed routes (`/es`, `/zh`, `/de`, `/th`), plus a cross-language visual learning guide system (`/speaking-structure`, `/{lang}/guides/*`).

## Scope

This app is standalone. It does not consume any workspace package, backend service, or external API at runtime. All content is local JSON in `content/curriculum/<lang>/`, normalized by `src/lib/academy-content.ts` and validated by Zod schemas in `src/types/academy.ts`.

It is explicitly **excluded from the `academy-ecosystem` governance** (per the monorepo CLAUDE.md), alongside `vdapp42-book-academy`. Do not import academy-ecosystem registry assumptions into this app.

## Read Order

1. `AGENTS.md` (this file)
2. `CLAUDE.md`
3. `status/` (when populated)
4. `docs/` (architecture notes, audits, decisions)
5. `README.md`

## Upstream Dependencies

None at runtime. No `vd-engine`, `vd-os-kernel`, or `vd-business` imports. Tooling lineage only:

- ESLint flat config extends `next/core-web-vitals`
- Tailwind v3.4 with `tailwindcss-animate` plugin
- Radix UI primitives via shadcn-style components in `src/components/ui/`
- Lucide icons (pinned to the canonical `0.x` line)

## Downstream Consumers

End users only. No other app imports from this codebase.

## File-Touch Rules

**Safe to edit without coordination:**
- Curriculum JSON under `content/curriculum/<lang>/`
- Page components under `src/app/`
- Shared components under `src/components/`
- Tailwind theme tokens

**Coordinate or document before changing:**
- `src/lib/academy-content.ts` — touches every page; memoised module-level caches live here
- `src/types/academy.ts` — Zod schemas; per-language source schemas (Spanish/Chinese/German/Thai) are mapped to the normalised `AcademyWord` shape
- `src/lib/languages.ts` — `SUPPORTED_LANGUAGES` is the canonical language list and feeds every `generateStaticParams`
- `next.config.js` redirects — six `/words → /es/words` style hard-redirects pin Spanish as the default surface

**Do not change without an ADR:**
- The route-tree shape (`[lang]/...`) — changing it touches SEO redirects and `generateStaticParams` everywhere
- The normalised `AcademyWord` / `AcademyTopic` / `AcademyGrammarRule` / `AcademyPhrasePack` shape — these are the contract the UI is built against

## Known Risks

- **Content-coverage drift.** Spanish has full coverage (1000 words, 15 topics, 12 grammar rules, 8 phrase packs). Chinese, German, and Thai currently have words only — `topics/`, `grammar/`, `phrases/` are empty. Routes for those surfaces are gated by `LanguageConfig.surfaces` to hide nav links until content lands.
- **Build cost.** `getWords(lang)` `readdirSync`s and Zod-parses 1000 files per language; without memoisation a full build re-parses across every page. Module-level Map cache in `academy-content.ts` is in place — do not bypass it for "freshness" without measuring build time first.
- **Lockfile ambiguity.** A monorepo-root `package-lock.json` exists in `/sessions/.../1-vivacity-digital/`. `outputFileTracingRoot: __dirname` in `next.config.js` pins tracing to this app and silences Next's warning.
- **Three.js stack previously declared and unused.** `three`, `@react-three/fiber`, `@react-three/drei` were removed during the 2026-05-16 health check. If you re-introduce 3D visuals, also re-add `transpilePackages: ['three']` to `next.config.js`.

## Close-Out Steps

After any session that modifies this app:

1. Run `npm run type-check` (strict TypeScript; must pass).
2. Run `npm run lint` (flat ESLint config; must pass).
3. Run `npm run build` (Next production build; must complete).
4. If `vitest` is touched or content schemas change, run `npm run test`.
5. Update `status/release-checklist.yaml` (when populated) to reflect what ran and what didn't.
6. Update `CLAUDE.md` and `README.md` only if the architecture, route tree, or content contract changed — not for routine fixes.
