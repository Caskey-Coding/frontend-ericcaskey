import type { Metadata } from 'next';
import { CrossSiteLink } from '../components/CrossSiteLink';
import { ExternalLinkIcon } from '../components/ExternalLinkIcon';
import { ogImage } from '../lib/og';
import { BreadcrumbJsonLd } from '../components/BreadcrumbJsonLd';
import writingShelf from '../../data/writing-shelf.json';

export const metadata: Metadata = {
  title: 'Writing',
  description:
    'Five selected essays by Eric Caskey on low-latency C++, spec-driven development, safety-critical distributed systems, and AI application engineering.',
  openGraph: {
    title: 'Writing',
    description:
      'Five selected essays by Eric Caskey on low-latency C++, spec-driven development, safety-critical distributed systems, and AI application engineering.',
    url: 'https://ericcaskey.com/writing',
    images: [ogImage],
  },
  alternates: { canonical: '/writing' },
};

// EC-WRITING-1 (2026-07-18): the shelf is no longer hardcoded here. Membership
// and each editorNote are curated in content/writing-shelf.yaml; title, date,
// and url are joined from caskeycoding.com/blog-index.json at build time by
// scripts/fetch-writing-feed.mjs (prebuild) and emitted to
// src/data/writing-shelf.json, so the shelf never drifts stale against the
// canonical blog. publishedDate is "Month D, YYYY", newest-first.
// EC-BRAND-1 (2026-07-08): shelf widened 3 → 5 to surface the two flagship
// builder essays (C++ pricing engine, Ballast). Order stays strictly
// newest-first; home cards 1-2 mirror the top two (MIRROR RULE, content/001).
type Essay = {
  title: string;
  url: string;
  publishedDate: string;
  editorNote: string;
};

const essays: Essay[] = writingShelf.essays;

// FDS-5: the writing index, recomposed as a dated editorial index. Each
// essay is one whole-row outbound link (TimelineItem grammar: border-led
// hover, external glyph + sr-only destination) with a leading date rail so
// the shelf scans by date. Stays inside the 002/004 contract: Inter only,
// single green accent on interaction, dividers not cards, h1-h2 only.
function EssayRow({ title, url, publishedDate, editorNote }: Essay) {
  return (
    <CrossSiteLink
      href={url}
      rel="noopener"
      className="link-plain block transition-colors hover:[&_h2]:text-[color:var(--color-accent)] hover:[&>div]:border-[color:var(--color-border-strong)]"
    >
      <div className="grid md:grid-cols-[150px_1fr] gap-1.5 md:gap-6 py-5 border-b border-border transition-colors">
        {/* Leading date rail — comparable data, tabular-nums (v2.1 §2.2). */}
        <p className="text-sm text-muted tabular-nums md:pt-1">
          {publishedDate}
        </p>
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold leading-snug flex items-start gap-1.5 transition-colors">
            <span>{title}</span>
            <ExternalLinkIcon className="shrink-0 mt-1 text-muted" />
          </h2>
          <p className="leading-relaxed">{editorNote}</p>
          <p className="text-sm text-muted">Caskey Engineering</p>
        </div>
      </div>
      <span className="sr-only">(opens Caskey Engineering)</span>
    </CrossSiteLink>
  );
}

export default function Writing() {
  return (
    <article className="sr flex flex-col gap-10">
      <BreadcrumbJsonLd name="Writing" path="/writing" />
      <header className="sr-pagehead">
        <p className="coord">
          <span>Essays</span>
          <span className="sep">·</span>
          <span>5 selected</span>
          <span className="sep">·</span>
          <span>caskeycoding.com</span>
        </p>
        <h1 className="text-3xl md:text-4xl">Selected writing</h1>
        <p className="sub">
          Selected essays on spec-driven systems, safety guardrails, and AI
          reliability, plus the low-latency C++ and open-source AI work behind
          them. The full archive lives at{' '}
          <CrossSiteLink href="https://caskeycoding.com/blog" rel="noopener">
            Caskey Engineering
          </CrossSiteLink>
          .
        </p>
      </header>

      <section className="flex flex-col border-t border-border">
        {essays.map((e) => (
          <EssayRow key={e.url} {...e} />
        ))}
      </section>

    </article>
  );
}
