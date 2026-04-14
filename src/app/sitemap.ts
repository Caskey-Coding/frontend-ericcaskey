import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://ericcaskey.com';
  const lastModified = new Date();

  return [
    { url: `${base}/`, lastModified, changeFrequency: 'monthly', priority: 1.0 },
    { url: `${base}/about`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/work`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/contact`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
  ];
}
