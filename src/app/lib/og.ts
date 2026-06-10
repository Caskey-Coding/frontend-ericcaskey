// Shared Open Graph image descriptor: the designed share card rendered
// by src/app/og.png/route.ts. The root layout sets it as the default;
// subpages that export their own `openGraph` must include it too,
// because Next.js replaces the parent's resolved openGraph object
// wholesale when a child segment defines one. twitter:image autofills
// from openGraph, so no separate twitter wiring is needed.
export const OG_IMAGE_ALT =
  'Eric Caskey — I build the systems other engineers depend on.';

export const ogImage = {
  url: '/og.png',
  width: 1200,
  height: 630,
  alt: OG_IMAGE_ALT,
};
