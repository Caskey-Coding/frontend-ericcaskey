# frontend-ericcaskey — Agent Instructions

Static Next.js export. S3 + CloudFront. No runtime, no API routes.

## Before any session

1. Read `specs/README.md`
2. Read all files in `specs/steering/` if any exist
3. For all strategic specs (content, architecture, decisions), start at
   `caskeycoding-specs/README.md` — it is the stable index and owns current paths

## Hard rules

1. No server components that fetch data — static export only
2. No `tailwind.config.*` — all tokens in `globals.css`
3. No "Principal Engineer" claims in rendered copy ("Senior Software
   Engineer" is allowed as of the 2026-07-07 amendment to decisions doc §D1/§D4)
4. No NDA-sensitive content — all copy is public
5. Voice and NDA scans run on every PR and block merge on failure

## Routing table

| Task | File | Reference |
|------|------|-----------|
| Any copy change | `src/app/*/page.tsx` | `caskeycoding-specs` → `ericcaskey-com/content/` |
| Design tokens | `src/app/globals.css` | `caskeycoding-specs` → `ericcaskey-com/frontend/` |
| Theme / dark mode | `src/app/lib/theme.ts` | `caskeycoding-specs` → `_shared/architecture/002` |
| Cross-site links | `src/app/components/CrossSiteLink.tsx` | Same |
| llms.txt | `public/llms.txt` | Falls under "Any copy change" — canonical facts apply |
| Contact form | `src/app/contact/page.tsx`, `ContactForm.tsx` | `specs/steering/` when spec exists |
| CI/CD | `.github/workflows/` | `caskeycoding-specs` → `caskeycoding-com/infra/` |

**Why `caskeycoding-specs/README.md` as the entry point:** routing-table paths
in this file would need updating on every caskeycoding-specs reorg. Pointing
at `README.md` instead means one file to update across repo moves, not N.
