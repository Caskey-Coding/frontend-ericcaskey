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
    siteName: 'Eric Caskey',
    locale: 'en_US',
    type: 'website',
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

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  '@id': 'https://ericcaskey.com/writing#list',
  name: 'Selected writing by Eric Caskey',
  numberOfItems: essays.length,
  itemListElement: essays.map((e, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: e.url,
    name: e.title,
  })),
};

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <header className="sr-pagehead">
        <p className="coord">
          <span>Essays</span>
          <span className="sep" aria-hidden="true">·</span>
          <span>5 selected</span>
          <span className="sep" aria-hidden="true">·</span>
          <span>caskeycoding.com</span>
        </p>
        <h1 className="page-title">Selected writing</h1>
        <p className="sub">
          Eric Caskey writes long-form engineering essays at Caskey Engineering
          on spec-driven development, safety guardrails for distributed systems,
          and AI reliability. The five selected here best show the method rather
          than the result: a C++ options pricer tuned from 15 to 215 million
          prices a second, where most of the speedup assumptions died one
          measurement at a time; Ballast, a RAG system whose most important
          feature is refusing to answer; an honest account of building a
          personal finance reviewer, where the hard part was rarely the AI; the
          validation engines behind workflow orchestration, where an incorrect
          &quot;yes&quot; is a production incident; and the folder architecture
          that lets AI agents and humans both find their way around a codebase.
          The full archive lives at{' '}
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
