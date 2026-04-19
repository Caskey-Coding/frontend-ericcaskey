# ericcaskey.com — SDD File Structure Spec

**Status:** `draft`
**Author:** Eric Caskey
**Created:** 2026-04-19
**Updated:** 2026-04-19
**Depends on:**
- `caskeycoding-specs/decision/ADR-001-spec-package-shapes.md`
- `caskeycoding-specs/decision/ADR-003-spec-driven-development.md`
- `caskeycoding-specs/ericcaskey-com/CONTEXT.md`
- `caskeycoding-specs/ericcaskey-com/frontend/001-site-architecture.md`
- `caskeycoding-specs/ericcaskey-com/content/001-canonical-copy.md`

---

## Purpose

This spec defines the optimal Spec-Driven Development (SDD) file structure for the
`frontend-ericcaskey` repository. It audits the current layout against the patterns
established by the financial-reviewer (the reference integration package), proposes
concrete rearrangements, and establishes file naming and location rules all future
agents and humans must follow.

This spec lives in `frontend-ericcaskey/specs/` — inside the code repo, not the
specs repo — because ericcaskey.com is a static site with no runtime backend. Its
spec surface is small enough that co-location is the right call. The caskeycoding-specs
repo owns the strategic/cross-domain contracts; this repo owns the implementation
artifacts.

---

## Reference model: the financial-reviewer integration package

The financial-reviewer package (`caskeycoding-specs/projects/financial-reviewer/`) is
the most mature SDD package in the org. Its shape is the target:

```
projects/financial-reviewer/
├── README.md                     ← Agent instructions, directory map, implementation sequence
├── steering/                     ← Always-load context: project-overview, conventions, tech-stack, architecture
├── feature/                      ← Scoped requirements per feature area
│   └── <name>/
│       └── requirements.md
└── decision/                     ← ADRs — why, not what
    └── ADR-NNN-*.md
```

Key properties of that shape:
1. `README.md` tells an agent exactly what to load before touching any code.
2. `steering/` files are always injected — they define the invariants.
3. `feature/` files are loaded only when implementing that area.
4. `decision/` prevents relitigating settled choices.
5. Specs are the **source of intent**; code is the **source of truth**.

ericcaskey.com's `specs/` directory currently has two flat files and no structure.
This spec rearranges it into the full integration package shape.

---

## Current state

```
frontend-ericcaskey/
├── .eslintrc.json
├── .github/
│   └── workflows/
│       ├── deploy-production.yml
│       └── pr-validation.yml
├── .gitignore
├── .nvmrc
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── public/
│   ├── eric-caskey-1200.jpg
│   ├── eric-caskey-1200.webp
│   ├── eric-caskey-600.webp
│   ├── eric-caskey.jpg
│   └── robots.txt
│   └── llms.txt
├── specs/
│   ├── content-spec.md           ← flat, no steering container
│   └── sdd-file-structure.md     ← this file
├── src/
│   └── app/
│       ├── components/
│       │   ├── ContactForm.tsx
│       │   ├── CrossSiteLink.tsx
│       │   ├── EssayCard.tsx
│       │   ├── Footer.tsx
│       │   ├── Headshot.tsx
│       │   ├── Nav.tsx
│       │   ├── PersonJsonLd.tsx
│       │   ├── TimelineItem.tsx
│       │   ├── ToolCard.tsx
│       │   ├── ValuesList.tsx
│       │   └── theme.ts          ← client utility co-located with components
│       ├── about/page.tsx
│       ├── contact/page.tsx
│       ├── work/page.tsx
│       ├── writing/page.tsx
│       ├── globals.css
│       ├── layout.tsx
│       ├── page.tsx
│       └── sitemap.ts
├── tsconfig.json
└── [no CLAUDE.md]                ← agent entry point missing
```

### Gaps against the SDD standard

| Gap | Impact |
|-----|--------|
| No `CLAUDE.md` at repo root | Agents have no loading instructions; every session starts cold |
| No `specs/README.md` | No directory map; agents don't know what to load or when |
| No `specs/steering/` | No always-inject context — conventions, tech stack, architecture all missing |
| No `specs/feature/` | Feature work has no scoped requirements docs |
| No `specs/decision/` | No ADRs; settled choices get relitigated in every session |
| `content-spec.md` is flat | Good content, wrong location — should live in `specs/steering/` |
| `theme.ts` inside `components/` | Client utility mixed with UI components; causes confusion for agents about what is a component vs. a utility |
| No `src/lib/` or `src/utils/` | Cross-cutting utilities have no home |
| `specs/sdd-file-structure.md` (this file) is flat | Should be the first entry in `specs/decision/` as an ADR |

---

## Target structure

```
frontend-ericcaskey/
├── CLAUDE.md                          ← NEW — agent entry point (see §CLAUDE.md contract)
├── .eslintrc.json
├── .github/
│   └── workflows/
│       ├── deploy-production.yml
│       └── pr-validation.yml
├── .gitignore
├── .nvmrc
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── public/
│   ├── eric-caskey-1200.jpg
│   ├── eric-caskey-1200.webp
│   ├── eric-caskey-600.webb
│   ├── eric-caskey.jpg
│   ├── llms.txt
│   └── robots.txt
├── specs/
│   ├── README.md                      ← NEW — directory map + agent instructions
│   ├── steering/
│   │   ├── 001-project-overview.md    ← NEW — mission, audience, non-goals, success criteria
│   │   ├── 002-conventions.md         ← NEW — TypeScript style, component patterns, naming, testing
│   │   ├── 003-tech-stack.md          ← NEW — Next.js 15, Tailwind v4, static export, S3/CloudFront
│   │   ├── 004-architecture.md        ← NEW — route map, component inventory, data flow, design tokens
│   │   └── 005-content.md             ← MOVED from specs/content-spec.md (rename + add steering header)
│   ├── feature/
│   │   ├── 001-contact-form.md        ← NEW — SES integration spec (backfill from shipped feat/contact-form-ses)
│   │   ├── 002-cross-domain-design-system.md ← NEW — implementation stub; canonical in caskeycoding-specs/_shared/architecture/002
│   │   └── 003-llms-txt.md            ← NEW — llms.txt content rules and update cadence
│   └── decision/
│       ├── ADR-001-static-export.md   ← NEW — why static export over SSR/SSG hybrid
│       ├── ADR-002-tailwind-v4.md     ← NEW — CSS-first config, no tailwind.config.js
│       └── ADR-003-sdd-structure.md   ← THIS FILE moved here; renumbered as ADR-003
└── src/
    └── app/
        ├── components/                ← UI components only
        │   ├── ContactForm.tsx
        │   ├── CrossSiteLink.tsx
        │   ├── EssayCard.tsx
        │   ├── Footer.tsx
        │   ├── Headshot.tsx
        │   ├── Nav.tsx
        │   ├── PersonJsonLd.tsx
        │   ├── TimelineItem.tsx
        │   ├── ToolCard.tsx
        │   └── ValuesList.tsx
        ├── lib/                       ← NEW — cross-cutting utilities
        │   └── theme.ts               ← MOVED from components/theme.ts
        ├── about/page.tsx
        ├── contact/page.tsx
        ├── work/page.tsx
        ├── writing/page.tsx
        ├── globals.css
        ├── layout.tsx
        ├── page.tsx
        └── sitemap.ts
```

---

## File-by-file migration plan

### 1. Create `CLAUDE.md` (root)

New file. Agent entry point following the pattern in `caskeycoding-specs/CLAUDE.md`.

Content contract (see §CLAUDE.md contract below).

### 2. Create `specs/README.md`

New file. Directory map that mirrors the financial-reviewer `README.md` shape:

- Table of spec directories with "when to read" guidance
- Steering doc list with one-line descriptions
- Feature spec list
- ADR list
- Agent instructions (numbered, same as financial-reviewer)

### 3. `specs/content-spec.md` → `specs/steering/005-content.md`

Move and rename. No content changes — the spec is correct, just misplaced. Update status
header to add the `Depends on` references to `caskeycoding-specs/ericcaskey-com/content/001-canonical-copy.md`.

The canonical copy in the caskeycoding-specs repo (`ericcaskey-com/content/001-canonical-copy.md`)
owns the strategic layer. This file is the implementation layer — what ships in code, not why
the content choices were made. Both must be consistent. When they conflict, the caskeycoding-specs
canonical copy wins for strategic intent; this file wins for exact rendered strings.

### 4. Create `specs/steering/001-project-overview.md`

New. Mirrors `projects/financial-reviewer/steering/project-overview.md`.

Content:
- Mission: single-sentence statement pulled from `ericcaskey-com/CONTEXT.md`
- Audience: ranked list (hiring managers first)
- Non-goals: no blog, no code blocks, no deep case studies
- Success criteria: 90-day SEO targets from `_shared/architecture/001`

### 5. Create `specs/steering/002-conventions.md`

New. Mirrors `projects/financial-reviewer/steering/conventions.md`.

Content:
- TypeScript strict, no `allowJs`
- Tailwind v4 utility classes — no inline `style={}` unless design tokens require it (design tokens are the exception, not the rule)
- Component naming: PascalCase files for components, camelCase for utilities
- No default exports from `lib/` — named exports only
- No `any` type assertions
- All new components get a JSDoc one-liner at the top
- PR validation gates: NDA scan, voice scan, lint, typecheck, build — all must pass

### 6. Create `specs/steering/003-tech-stack.md`

New. Mirrors `projects/financial-reviewer/steering/tech-stack.md`.

Content:
- Next.js 15, App Router, `output: 'export'`
- React 18, TypeScript 5.6+
- Tailwind CSS v4 (PostCSS plugin, CSS-first, no config file)
- Inter via `next/font/google`
- Node 20 (pinned in `.nvmrc`)
- AWS S3 + CloudFront (static hosting, no runtime)
- GitHub Actions: `deploy-production.yml` (push to main → build → S3 sync → CloudFront invalidation → healthcheck → release)
- GitHub Actions: `pr-validation.yml` (NDA scan → voice scan → lint/typecheck → build)

### 7. Create `specs/steering/004-architecture.md`

New. Mirrors `projects/financial-reviewer/steering/architecture.md`.

Content:
- Route map (copy from `caskeycoding-specs/ericcaskey-com/frontend/001-site-architecture.md` §Route map)
- Component inventory with one-line purpose for each
- Design token table (all CSS vars from `globals.css`)
- Data flow: static data in page files → rendered at build time → deployed to S3
- Cross-domain links: `CrossSiteLink` appends `?theme={current}` at click time via `lib/theme.ts`
- No API calls, no server components with data fetching, no dynamic routes

### 8. Create `specs/feature/001-contact-form.md`

Backfill spec for the shipped `feat/contact-form-ses` branch. This is the SDD pattern for
documenting features that shipped before specs existed — backfill so the next agent has context.

Content:
- The form sends POST to `NEXT_PUBLIC_CONTACT_API_URL/contact`
- Honeypot field (`name="company"`) for bot filtering
- Validation: name required, email required, message 10–2000 chars
- Status states: idle, sending, success, error
- No retry logic — user must resubmit manually
- Direct contact fallback in the success/error copy

### 9. Create `specs/feature/002-cross-domain-design-system.md`

Implementation stub. The canonical spec is in
`caskeycoding-specs/_shared/architecture/002-cross-domain-design-system.md`. This file is
the ericcaskey.com implementation checklist for that contract — not a duplicate, just a
per-site task tracker.

Content:
- Reference to the canonical `_shared/architecture/002` spec
- Punch list of the 12 clashes (from `002` §Clashes to resolve) with status column
- Acceptance criteria for this site only

### 10. Create `specs/feature/003-llms-txt.md`

New. Documents the `public/llms.txt` content rules and update cadence.

Content:
- This file is a first-party machine-readable identity card for LLM crawlers
- Must be updated whenever canonical facts change (new role, new scale numbers)
- Currently references "nine years at Prudential" — update to match 15-year framing after PR #8 merges
- No NDA-sensitive content permitted
- Not versioned in Git history independently — changes ship with the PR that changes the facts they reflect

### 11. Create `specs/decision/ADR-001-static-export.md`

New. Documents the `output: 'export'` choice.

Context: The site has no server-side data needs. All content is authored and known at build time.
Decision: Static export to S3 + CloudFront. No SSR, no ISR, no API routes.
Consequence: No server components that fetch data; no `use server`; no dynamic routes.
This ADR prevents any agent from introducing a Node.js server, edge runtime, or API routes
without an explicit superseding ADR.

### 12. Create `specs/decision/ADR-002-tailwind-v4.md`

New. Documents the CSS-first Tailwind v4 config.

Context: Tailwind v4 removes `tailwind.config.js`. All config lives in `globals.css` via
`@theme inline` and CSS custom properties.
Decision: No `tailwind.config.js`. No `tailwind.config.ts`. All design tokens are CSS vars
in `globals.css`. The `@import "tailwindcss"` directive in `globals.css` is the only
Tailwind entry point.
Consequence: Agents must not create or suggest a `tailwind.config.*` file. Custom tokens
are added to `globals.css`, not a JS config object.

### 13. Create `specs/decision/ADR-003-sdd-structure.md`

Move this file here and rewrite the "current state" section as the **before** snapshot.
This ADR is the record of the rearrangement decision.

### 14. `src/app/components/theme.ts` → `src/app/lib/theme.ts`

Move. `theme.ts` is a client-side utility module (`'use client'`, pure functions, no JSX).
It does not render anything. Keeping it in `components/` misleads agents into treating it
as a UI component and makes barrel exports harder to reason about.

`src/app/lib/` is the Next.js App Router convention for shared non-component utilities.

**Import update required in:** `Nav.tsx`, `CrossSiteLink.tsx`.

```diff
- import { ... } from './theme';
+ import { ... } from '../lib/theme';
```

---

## CLAUDE.md contract

The `CLAUDE.md` at the repo root is the agent entry point. It must contain:

```markdown
# frontend-ericcaskey — Agent Instructions

This is the ericcaskey.com personal authority site.
Static Next.js export, hosted on S3 + CloudFront.

## Before any session

1. Read `specs/README.md` — directory map and loading instructions
2. Load all files in `specs/steering/` — they are always-inject context
3. Load the relevant `specs/feature/<name>/` spec before implementing any feature
4. Check `specs/decision/` before making architectural changes

## Hard rules

1. No server components that fetch data — this is a static export site
2. No `tailwind.config.*` files — all tokens live in `globals.css`
3. No title claims in rendered copy — see `specs/steering/005-content.md` §Tone rules
4. No NDA-sensitive content — all copy is public; see `caskeycoding-specs/content-strategy/steering/nda-guidelines.md`
5. Voice scan and NDA scan run on every PR — copy that fails them blocks merge

## Routing table

| Task | File to edit | Spec to load |
|------|-------------|--------------|
| Home page copy | `src/app/page.tsx` | `specs/steering/005-content.md` |
| About page copy | `src/app/about/page.tsx` | `specs/steering/005-content.md` |
| Work page copy | `src/app/work/page.tsx` | `specs/steering/005-content.md` |
| Writing page copy | `src/app/writing/page.tsx` | `specs/steering/005-content.md` |
| Contact form | `src/app/contact/page.tsx` + `ContactForm.tsx` | `specs/feature/001-contact-form.md` |
| Design tokens | `src/app/globals.css` | `specs/steering/004-architecture.md` |
| Theme toggle / dark mode | `src/app/lib/theme.ts`, `Nav.tsx` | `specs/steering/004-architecture.md` |
| Cross-site links | `CrossSiteLink.tsx` | `specs/feature/002-cross-domain-design-system.md` |
| llms.txt | `public/llms.txt` | `specs/feature/003-llms-txt.md` |
| CI/CD | `.github/workflows/` | `specs/steering/003-tech-stack.md` |

## Spec references (cross-repo)

The caskeycoding-specs repo owns the strategic layer. When these conflict with
local specs, the caskeycoding-specs version wins for intent; the local spec wins
for exact rendered output.

| Topic | caskeycoding-specs path |
|-------|------------------------|
| Domain split strategy | `_shared/architecture/001-two-domain-brand-architecture.md` |
| Cross-domain design system | `_shared/architecture/002-cross-domain-design-system.md` |
| Canonical copy (strategic) | `ericcaskey-com/content/001-canonical-copy.md` |
| Site architecture (strategic) | `ericcaskey-com/frontend/001-site-architecture.md` |
| NDA guidelines | `content-strategy/steering/nda-guidelines.md` |
| Voice rules | `content-strategy/steering/positioning-and-voice.md` |
```

---

## `specs/README.md` contract

```markdown
# ericcaskey.com Specs

Spec-Driven Development package for the ericcaskey.com personal authority site.
Read this file first. Load all steering docs before any session.

## Directory map

| Directory | Purpose | When to read |
|-----------|---------|--------------|
| `steering/` | Always-inject context: project overview, conventions, tech stack, architecture, content | Every session |
| `feature/` | Scoped requirements per feature area | When implementing that feature |
| `decision/` | ADRs — why a choice was made, what was rejected | Before architectural changes |

## Steering docs (always load)

- `steering/001-project-overview.md` — Mission, audience, non-goals, success criteria
- `steering/002-conventions.md` — TypeScript style, component patterns, naming, testing
- `steering/003-tech-stack.md` — Next.js 15, Tailwind v4, static export, S3/CloudFront
- `steering/004-architecture.md` — Route map, component inventory, design tokens, data flow
- `steering/005-content.md` — Canonical copy, tone rules, page contracts, link registry

## Feature specs

- `feature/001-contact-form.md` — SES-backed contact form (shipped)
- `feature/002-cross-domain-design-system.md` — Design system implementation checklist for this site
- `feature/003-llms-txt.md` — llms.txt content rules and update cadence

## Decision records

- `decision/ADR-001-static-export.md` — Why static export over SSR
- `decision/ADR-002-tailwind-v4.md` — CSS-first config, no tailwind.config.js
- `decision/ADR-003-sdd-structure.md` — Why this spec structure was chosen

## Agent instructions

1. Read all `steering/` docs before starting any session
2. When implementing a feature, load the corresponding `feature/<name>.md` spec
3. Before architectural changes, check `decision/` for existing ADRs
4. If you encounter a decision not covered by an ADR, propose one — do not guess
5. The NDA scan and voice scan in `pr-validation.yml` are hard gates — write spec-compliant copy before committing
6. The caskeycoding-specs repo owns the strategic layer for this site — see `CLAUDE.md` §Spec references
```

---

## Implementation sequence

Execute in this order to avoid import breakage:

```
Step 1 — specs scaffolding (no code changes)
  - Create CLAUDE.md
  - Create specs/README.md
  - Create specs/steering/ directory with 001–004 (new files)
  - Move specs/content-spec.md → specs/steering/005-content.md
  - Create specs/feature/ directory with 001–003
  - Create specs/decision/ directory with ADR-001, ADR-002
  - Move this file → specs/decision/ADR-003-sdd-structure.md

Step 2 — src/app/lib/ extraction
  - Create src/app/lib/theme.ts (copy of components/theme.ts)
  - Update Nav.tsx import: './theme' → '../lib/theme'
  - Update CrossSiteLink.tsx import: './theme' → '../lib/theme'
  - Delete src/app/components/theme.ts
  - Verify: npm run typecheck passes
  - Verify: npm run build passes

Step 3 — commit and PR
  - Single PR: "chore: SDD structure — specs scaffolding + lib extraction"
  - PR description references this ADR
  - All CI checks must pass before merge
```

Step 2 is the only code change. Everything else is file creation and moves within `specs/`.
The PR diff for step 2 is exactly three files: `lib/theme.ts` (add), `components/theme.ts`
(delete), and two import lines changed in `Nav.tsx` and `CrossSiteLink.tsx`.

---

## What this does NOT change

- No page routes added or removed
- No component logic changed
- No design tokens changed
- No copy changed (that is `specs/steering/005-content.md` territory)
- No CI/CD workflow logic changed
- No `package.json` dependencies added

---

## Acceptance criteria

- [ ] `CLAUDE.md` exists at repo root with the routing table and hard rules
- [ ] `specs/README.md` exists with directory map and agent instructions
- [ ] `specs/steering/` contains files 001–005; `005-content.md` is the former `content-spec.md` with no content regressions
- [ ] `specs/feature/` contains files 001–003
- [ ] `specs/decision/` contains ADR-001, ADR-002, ADR-003
- [ ] `src/app/lib/theme.ts` exists with the full contents of the former `components/theme.ts`
- [ ] `src/app/components/theme.ts` does not exist
- [ ] `Nav.tsx` imports from `'../lib/theme'`
- [ ] `CrossSiteLink.tsx` imports from `'../lib/theme'`
- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run build` produces a clean static export
- [ ] All CI checks pass on the PR

---

## Open items

| # | Description | Priority |
|---|-------------|----------|
| 1 | `specs/feature/002-cross-domain-design-system.md` — fill in the punch-list status column once the `_shared/architecture/002` clashes are triaged against the current codebase | Medium |
| 2 | `public/llms.txt` — "nine years at Prudential" needs updating to match 15-year framing after PR #8 merges | High |
| 3 | `specs/steering/001-project-overview.md` — confirm 90-day SEO success criteria with actual GSC baseline once site has 30 days of data | Low |
| 4 | When caskeycoding-specs moves the ericcaskey-com specs into `ericcaskey-com/` subdirectories (pending per `caskeycoding-com/CONTEXT.md` §Reorg status), update the cross-repo path references in `CLAUDE.md` | Low |

---

## Change log

| Date | Change |
|------|--------|
| 2026-04-19 | Spec created — initial SDD structure analysis and migration plan |
