import type { Metadata } from 'next';
import { CrossSiteLink } from '../components/CrossSiteLink';
import { ExternalLinkIcon } from '../components/ExternalLinkIcon';
import { ogImage } from '../lib/og';
import { BreadcrumbJsonLd } from '../components/BreadcrumbJsonLd';

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

// B-077: publishedDate matches each essay's canonical publish date on
// caskeycoding.com/blog (post frontmatter `date`), one "Month D, YYYY"
// format, list sorted newest-first.
// EC-BRAND-1 (2026-07-08): shelf widened 3 → 5 to surface the two flagship
// builder essays (C++ pricing engine, Ballast). Order stays strictly
// newest-first; home cards 1-2 mirror the top two (MIRROR RULE, content/001).
const essays = [
  {
    title: 'Fifteen Million Was the Easy Part',
    url: 'https://caskeycoding.com/blog/pricing-215-million-options-a-second',
    publishedDate: 'July 15, 2026',
    editorNote:
      'A clean C++ options pricer, tuned from 15 to 215 million prices a second. Most of my speedup assumptions died one measurement at a time.',
  },
  {
    title: "Ballast: An LLM App Whose Best Feature Is Saying 'I Don't Know'",
    url: 'https://caskeycoding.com/blog/ballast-an-llm-that-says-i-dont-know',
    publishedDate: 'June 27, 2026',
    editorNote:
      'A RAG system whose most important feature is refusing to answer. How trust got built into the architecture instead of the prompt.',
  },
  {
    title: 'Building an AI Finance App',
    url: 'https://caskeycoding.com/blog/building-an-ai-finance-app',
    publishedDate: 'May 19, 2026',
    editorNote:
      'An honest account of what worked, what did not, and why the hard part is rarely the AI.',
  },
  {
    title: 'Designing Safety Guardrails for Distributed Workflow Orchestration',
    url: 'https://caskeycoding.com/blog/designing-safety-guardrails-for-distributed-workflow-orchestration',
    publishedDate: 'April 10, 2026',
    editorNote:
      "What I've learned building validation engines for infrastructure where an incorrect “yes” is a production incident.",
  },
  {
    title:
      'Spec-Driven Development and the Folder Architecture That Makes It Work',
    url: 'https://caskeycoding.com/blog/spec-driven-development-and-the-folder-architecture-that-makes-it-work',
    publishedDate: 'June 20, 2025',
    editorNote:
      'How I structure projects so AI agents and humans can both find their way around. This is the methodology behind everything else.',
  },
];

type Essay = (typeof essays)[number];

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
