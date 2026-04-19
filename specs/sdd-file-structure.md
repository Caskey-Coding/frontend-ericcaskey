# ericcaskey.com — SDD File Structure Spec

**Status:** `draft`
**Author:** Eric Caskey
**Created:** 2026-04-19
**Updated:** 2026-04-19
**Depends on:**
- `caskeycoding-specs/decision/ADR-001-spec-package-shapes.md`
- `caskeycoding-specs/decision/ADR-003-spec-driven-development.md`
- `caskeycoding-specs/decision/ADR-004-sdd-file-structure.md`
- `caskeycoding-specs/ericcaskey-com/frontend/001-site-architecture.md`

---

## Purpose

This spec defines the minimum viable SDD structure for the `frontend-ericcaskey`
repository and proposes one code change (a `lib/` extraction). It deliberately
does not mirror the full financial-reviewer integration package shape. This is a
static site with ~10 components and 5 pages — spec surface should stay proportional
to code surface. New steering, feature, and decision files are added when a real
decision or feature boundary needs one, not pre-created as empty scaffolding.

---

## Current state

```
frontend-ericcaskey/
├── specs/
│   ├── content-spec.md       ← owned by caskeycoding-specs; see §Content ownership
│   └── sdd-file-structure.md ← this file
└── src/app/
    └── components/
        └── theme.ts          ← client utility in the wrong directory
```

Two structural gaps:
1. No agent entry point — every Cursor session starts cold
2. `theme.ts` is a pure utility module sitting inside `components/`

---

## Target structure

```
frontend-ericcaskey/
├── CLAUDE.md                     ← NEW — agent entry point
├── specs/
│   ├── README.md                 ← NEW — directory map
│   └── steering/
│       └── (add files when a real steering decision exists)
└── src/app/
    ├── components/               ← UI components only
    │   └── (theme.ts removed)
    └── lib/                      ← NEW — cross-cutting utilities
        └── theme.ts              ← MOVED from components/theme.ts
```

`specs/content-spec.md` is **deleted from this repo** — see §Content ownership below.

---

## Content ownership

`specs/content-spec.md` duplicated facts that already live in
`caskeycoding-specs/ericcaskey-com/content/001-canonical-copy.md`. Maintaining both
requires every fact change to land in two repos with a reconciliation rule that will
be ignored under pressure.

**Decision:** the specs repo owns all content facts — canonical strings, tone rules,
page contracts, link registry. The code repo holds the rendered JSX and references the
specs repo for intent. No local content spec. When a rendered string needs to change,
the PR updates the JSX directly; the specs-repo canonical copy is the authority on what
that string should be.

---

## CLAUDE.md contract

```markdown
# frontend-ericcaskey — Agent Instructions

Static Next.js export. S3 + CloudFront. No runtime, no API routes.

## Before any session

1. Read `specs/README.md`
2. Read all files in `specs/steering/` if any exist
3. For content changes, load `caskeycoding-specs/ericcaskey-com/content/001-canonical-copy.md`
   and `caskeycoding-specs/caskeycoding-com/content-strategy/steering/nda-guidelines.md`
4. For architectural decisions, check `caskeycoding-specs/decision/` and
   `caskeycoding-specs/ericcaskey-com/frontend/001-site-architecture.md`

## Hard rules

1. No server components that fetch data — static export only
2. No `tailwind.config.*` — all tokens in `globals.css`
3. No title or level claims in rendered copy
4. No NDA-sensitive content — all copy is public
5. Voice and NDA scans run on every PR and block merge on failure

## Routing table

| Task | File | Reference |
|------|------|-----------|
| Any copy change | `src/app/*/page.tsx` | `caskeycoding-specs/ericcaskey-com/content/001-canonical-copy.md` |
| Design tokens | `src/app/globals.css` | `caskeycoding-specs/ericcaskey-com/frontend/001-site-architecture.md` |
| Theme / dark mode | `src/app/lib/theme.ts` | `caskeycoding-specs/_shared/architecture/002-cross-domain-design-system.md` |
| Cross-site links | `src/app/components/CrossSiteLink.tsx` | Same |
| Contact form | `src/app/contact/page.tsx`, `ContactForm.tsx` | `specs/steering/` when spec exists |
| CI/CD | `.github/workflows/` | `caskeycoding-specs/caskeycoding-com/infra/005-cicd-pipeline.md` |
```

---

## `specs/README.md` contract

```markdown
# ericcaskey.com Specs

Minimum viable SDD package for the ericcaskey.com personal authority site.

## What lives here

- `steering/` — add a file when a decision or convention needs to be durable
  across sessions. Currently empty.

## What lives in caskeycoding-specs

All strategic specs for this site live in the org specs repo. Read them there:

| Topic | Path |
|-------|------|
| Canonical copy and tone rules | `ericcaskey-com/content/001-canonical-copy.md` |
| Site architecture and component inventory | `ericcaskey-com/frontend/001-site-architecture.md` |
| Brand brief and design decisions | `ericcaskey-com/discovery/` |
| Cross-domain design system | `_shared/architecture/002-cross-domain-design-system.md` |
| NDA and voice guidelines | `caskeycoding-com/content-strategy/steering/` |
| Org-wide ADRs | `decision/` |
```

---

## `lib/theme.ts` extraction

`src/app/components/theme.ts` is a `'use client'` utility module — pure functions,
no JSX. It does not belong in `components/`. Next.js App Router convention is
`src/app/lib/` for shared non-component utilities.

**Import update required in:** `Nav.tsx`, `CrossSiteLink.tsx`

```diff
- import { ... } from './theme'
+ import { ... } from '../lib/theme'
```

---

## Implementation sequence

```
Step 1 — specs scaffolding (no code changes)
  - Create CLAUDE.md (post-#47-move paths — see note below)
  - Create specs/README.md
  - Delete specs/content-spec.md
  - Create specs/steering/.gitkeep (placeholder; remove when first real file is added)

Step 2 — lib/ extraction
  - Create src/app/lib/theme.ts (copy of components/theme.ts)
  - Update Nav.tsx and CrossSiteLink.tsx import paths
  - Delete src/app/components/theme.ts
  - Verify: npm run typecheck && npm run build pass

Step 3 — commit
  Single PR: "chore: MVP SDD structure + lib extraction"
```

**Path note for CLAUDE.md:** The CI/CD and content-strategy paths in the routing
table above use post-migration paths (`caskeycoding-com/infra/`, `caskeycoding-com/
content-strategy/`). This PR should not merge until `caskeycoding-specs` PR #47's
follow-up migration PR has landed. Until then, the CLAUDE.md in this PR is a
preview — update the paths before merging if the migration is still in flight.

---

## When to add more spec files

Add a `specs/steering/` file when a convention needs to survive across sessions and
is not already captured in caskeycoding-specs. Add a `specs/decision/ADR-NNN.md` when
an architectural decision gets made that is specific to this repo and not covered by the
org-wide ADRs. Do not add files to fill a template.

---

## Acceptance criteria

- [ ] `CLAUDE.md` exists at repo root
- [ ] `specs/README.md` exists with directory map and caskeycoding-specs cross-references
- [ ] `specs/content-spec.md` does not exist
- [ ] `src/app/lib/theme.ts` exists; `src/app/components/theme.ts` does not
- [ ] `Nav.tsx` and `CrossSiteLink.tsx` import from `'../lib/theme'`
- [ ] `npm run typecheck` and `npm run build` pass clean
- [ ] All CI checks pass

---

## Change log

| Date | Change |
|------|--------|
| 2026-04-19 | Initial draft — full integration package shape |
| 2026-04-19 | Revised to MVP shape; removed pre-created steering/feature/decision scaffolding; moved content ownership to caskeycoding-specs; fixed CLAUDE.md paths to post-migration targets; added sequencing note |
