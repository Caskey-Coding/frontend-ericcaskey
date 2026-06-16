# Next 16 / React 19 audit — C7-4

**Date:** 2026-06-16  ·  **Epic:** plugin-context7  ·  **Item:** C7-4
**Versions:** Next `16.2.7`, React `19.2.6`, ESLint `9`, TypeScript `6`, Tailwind `4`

Audited ericcaskey.com (static `output: 'export'` App Router site) for Next 16 /
React 19 migration leftovers and deprecated patterns, against the current Next.js
docs (Next 16 upgrade guide via context7). **No deprecated patterns found; no
code change.** Build and typecheck pass.

## Checked against the Next 16 removals (context7 upgrade guide)

The Next 16 upgrade guide's removals, and our status:

- **`next lint` removed / `eslint` option in `next.config` unsupported** — clean.
  `next.config.ts` has no `eslint` block; the `lint` script is `eslint .` (flat
  `eslint.config.mjs`), already the post-16 form.
- **AMP removed (`next/amp`, `amp: true`, `amp` config)** — not used anywhere.
- **`images.domains` removed** — not used; config is `images: { unoptimized: true }`
  (correct for static export).
- **Async `params` / `searchParams`** — no dynamic route segments exist (no
  `[slug]` dirs, no `generateStaticParams`), so there is nothing to migrate.

## React 19 patterns

- No `forwardRef` (React 19 takes `ref` as a prop; the codebase already passes
  refs directly), no `React.FC`, no `defaultProps` on function components, no
  `propTypes`, no legacy context.
- No `useFormState` (renamed to `useActionState` in 19). `ContactForm` is a client
  component using a plain `onSubmit` handler (appropriate for a no-server static
  site), not a server-action form, so the form-hook renames don't apply.
- No `ReactDOM.render` / `hydrate` (App Router owns mounting).

## Next 16 API surface

- Metadata via the `metadata` export object in `layout.tsx` (current Metadata
  API), not `next/head`.
- `ImageResponse` imported from `next/og` (current path; was `next/server` pre-14).
- Route handlers (`og.png/route.ts`, `sitemap.ts`) use `export const dynamic =
  'force-static'`, correct for static export.
- `next.config.ts`: `output: 'export'`, `trailingSlash: false`,
  `images.unoptimized`, `reactStrictMode`, top-level `outputFileTracingRoot`
  (no longer under `experimental`) — all current, no deprecated keys.
- No `next/link` `legacyBehavior`, no `next/legacy/image`.

## Verification

- `npx tsc --noEmit`: clean (exit 0)
- `npm run build`: succeeds (exit 0); 9 routes prerendered as static content
- No source changed, so there is no visual change (the accept's owner-sign-off
  gate for visual changes does not apply).
