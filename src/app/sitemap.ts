import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

// B-077: per-route static lastModified instead of `new Date()` (which
// stamped every route with the build time and made the sitemap lie about
// freshness on every deploy). Each date is the route's last meaningful
// rendered-content change (git log of its page.tsx, ignoring metadata-only
// commits). Bump the matching constant when a page's copy changes.
const LAST_MODIFIED = {
  home: new Date('2026-06-10'), // selected-writing dates corrected (B-077)
  about: new Date('2026-04-19'), // career duration + tone pass (#8)
  work: new Date('2026-06-10'), // case-study affordances + metric chips (#55)
  writing: new Date('2026-06-10'), // canonical dates + newest-first (B-077)
  contact: new Date('2026-05-21'), // LinkedIn URL slug fix (#13)
} as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://ericcaskey.com';

  return [
    { url: `${base}/`, lastModified: LAST_MODIFIED.home, changeFrequency: 'monthly', priority: 1.0 },
    { url: `${base}/about`, lastModified: LAST_MODIFIED.about, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/work`, lastModified: LAST_MODIFIED.work, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/writing`, lastModified: LAST_MODIFIED.writing, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/contact`, lastModified: LAST_MODIFIED.contact, changeFrequency: 'yearly', priority: 0.5 },
  ];
}
