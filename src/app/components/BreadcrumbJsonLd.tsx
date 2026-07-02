const SITE = 'https://ericcaskey.com';

/**
 * BreadcrumbList JSON-LD for secondary pages (EC-SEO-1): a two-level
 * Home -> Page trail so search results can render breadcrumbs. Items use
 * absolute URLs consistent with the page canonicals (metadataBase). Schema
 * only — renders no visible markup, so the no-title-claims copy rule is
 * untouched.
 *
 * Security note: the serialized payload is JSON.stringify of a static,
 * compile-time literal built from the two string props below, which are only
 * ever called with hardcoded route constants (never user input) — same
 * pattern as PersonJsonLd.tsx.
 */
export function BreadcrumbJsonLd({ name, path }: { name: string; path: string }) {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name, item: `${SITE}${path}` },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
    />
  );
}
