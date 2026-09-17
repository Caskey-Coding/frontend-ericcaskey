import type { MetadataRoute } from 'next';
import { LAST_MODIFIED } from './lib/lastModified';

export const dynamic = 'force-static';

// B-077: per-route lastModified dates come from git at prebuild with a
// committed fallback, never the build time (which made the sitemap lie
// about freshness on every deploy).

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://ericcaskey.com';

  return [
    { url: `${base}/`, lastModified: new Date(LAST_MODIFIED.home), changeFrequency: 'monthly', priority: 1.0 },
    { url: `${base}/about`, lastModified: new Date(LAST_MODIFIED.about), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/work`, lastModified: new Date(LAST_MODIFIED.work), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/writing`, lastModified: new Date(LAST_MODIFIED.writing), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/contact`, lastModified: new Date(LAST_MODIFIED.contact), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/privacy`, lastModified: new Date(LAST_MODIFIED.privacy), changeFrequency: 'yearly', priority: 0.3 },
  ];
}
