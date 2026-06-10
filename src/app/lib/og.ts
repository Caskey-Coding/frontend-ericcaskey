// Shared Open Graph image descriptor for pages that export their own
// `openGraph` metadata. Next.js replaces the parent's resolved openGraph
// object wholesale when a child segment defines one, which drops the
// file-convention image from src/app/opengraph-image.tsx — so subpages
// must reference the card explicitly. The URL is the stable metadata
// route the static export emits for that file.
export const OG_IMAGE_ALT =
  'Eric Caskey — I build the systems other engineers depend on.';

export const ogImage = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: OG_IMAGE_ALT,
};
