import { LAST_MODIFIED, formatUpdated } from '../lib/lastModified';
import type { Metadata } from 'next';
import { TimelineItem } from '../components/TimelineItem';
import { ProjectCard } from '../components/ProjectCard';
import { employers, personalProjects } from '../lib/work';
import { CrossSiteLink } from '../components/CrossSiteLink';
import { ogImage } from '../lib/og';
import { BreadcrumbJsonLd } from '../components/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Where Eric Caskey has built platforms, infrastructure, and safety-critical systems. Amazon, Prudential Financial, Caskey Coding LLC, NJ Army National Guard.',
  openGraph: {
    siteName: 'Eric Caskey',
    locale: 'en_US',
    type: 'website',
    title: 'Work',
    description:
      'Where Eric Caskey has built platforms, infrastructure, and safety-critical systems. Amazon, Prudential Financial, Caskey Coding LLC, NJ Army National Guard.',
    url: 'https://ericcaskey.com/work',
    images: [ogImage],
  },
  alternates: { canonical: '/work' },
};

// EC-BRAND-1 (specs → ericcaskey-com/content/004 amendment 2026-07-08):
// "Selected builds" range band. Each entry is a portfolio-proof OUTBOUND link
// (spec 009 policy: work-shaped surfaces resolve to caskeycoding, never
// duplicated here) to the live tool, the public writeup, or the playground.
// `kind` is the mono tile label. Finance entries are framed as engineering,
// never as investment edge (the composite fails net-of-cost; an edge claim to
// a finance-literate reader is a credibility risk, not a selling point).
type Build = {
  kind: string;
  name: string;
  tagline: string;
  url: string;
  project?: (typeof personalProjects)[number];
};

const tools: Build[] = [
  {
    kind: 'Method',
    name: 'Spec-driven engineering platform',
    tagline:
      'One engineer, a fleet of AI coding agents, a work queue, and an attested merge gate, written up as a case study and taught as a lesson series.',
    url: 'https://caskeycoding.com/case-studies/sdd-platform',
  },
  {
    kind: 'Tool',
    name: 'Marathon Coach',
    tagline: 'Grounded AI marathon training plans with Garmin integration.',
    // EC-WORK-1: the public preview (/lab/marathon-coach), not the signed-in door (/coach) which
    // lands anonymous visitors on a sign-in wall.
    url: 'https://caskeycoding.com/lab/marathon-coach',
  },
  {
    kind: 'Tool',
    name: 'Finance Reviewer',
    tagline:
      'Deterministic factor scores narrated through six investor perspectives.',
    // EC-WORK-1: the public preview (/lab/investment-committee), not /finance.
    url: 'https://caskeycoding.com/lab/investment-committee',
  },
  ...personalProjects.map((project) => ({
    kind: project.kind,
    name: project.name,
    tagline: project.description,
    url: project.href,
    project,
  })),
  {
    kind: 'Engine',
    name: 'C++ pricing engine',
    tagline:
      'A Black-Scholes options engine tuned from 15 to 215 million prices a second on AVX2 SIMD.',
    url: 'https://caskeycoding.com/blog/pricing-215-million-options-a-second',
  },
  {
    kind: 'Playground',
    name: 'Market visualizations',
    tagline:
      'Real-data 3D views of market structure, volatility surfaces, and factor behavior.',
    url: 'https://caskeycoding.com/lab',
  },
  {
    kind: 'Platform',
    name: 'Finance research platform',
    tagline:
      'The decision engine, backtester, and methodology behind the Reviewer, documented in the open.',
    url: 'https://caskeycoding.com/finance/methodology',
  },
];

const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://ericcaskey.com/work#webpage',
  url: 'https://ericcaskey.com/work',
  name: 'Work',
  dateModified: LAST_MODIFIED.work,
  about: { '@id': 'https://ericcaskey.com/#person' },
};

export default function Work() {
  return (
    <article className="sr flex flex-col gap-12">
      <BreadcrumbJsonLd name="Work" path="/work" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      {/* Sub-page header: a mono coordinate line +
          Inter title, hairline-sealed. */}
      <header className="sr-pagehead">
        <p className="coord">
          <span>Experience</span>
          <span className="sep" aria-hidden="true">·</span>
          <span>5 roles</span>
          <span className="sep" aria-hidden="true">·</span>
          <span>2009 → present</span>
          <span className="sep" aria-hidden="true">·</span>
          <span>updated <time dateTime={LAST_MODIFIED.work}>{formatUpdated(LAST_MODIFIED.work)}</time></span>
        </p>
        <h1 className="page-title">Work</h1>
        <p className="sub">
          Eric Caskey has held five roles since 2009, fifteen of those years in
          technology, from the NJ Army National Guard to Senior Software
          Engineer at Amazon today. He joined Amazon in June 2022 and has held
          the Senior Software Engineer title since August 2024. The deep case
          studies, with the metrics and the architectural decisions, live on{' '}
          <CrossSiteLink href="https://caskeycoding.com/case-studies" rel="noopener">
            Caskey Engineering case studies
          </CrossSiteLink>
          .
        </p>
      </header>

      <section className="flex flex-col border-t border-border">
        {employers.map((e) => (
          <TimelineItem key={e.company} {...e} />
        ))}
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <p className="eyebrow">Projects</p>
          <h2 className="text-xl font-semibold [letter-spacing:var(--ls-tight)]">Selected builds</h2>
        </div>
        <p className="leading-relaxed">
          A selection of what I build on my own time, on the same stack I use at
          work. Most link to the live tool, the writeup, or the playground on
          Caskey Engineering. The finance work is engineering, not investment
          advice.
        </p>
        <div className="sr-tiles">
          {tools.map((t) => t.project ? (
            <ProjectCard key={t.name} project={t.project} variant="tile" />
          ) : (
            <CrossSiteLink
              key={t.name}
              href={t.url}
              rel="noopener"
              className="sr-tile link-plain"
            >
              <span className="k">{t.kind}</span>
              <span className="t">{t.name} →</span>
              <span className="d">{t.tagline}</span>
            </CrossSiteLink>
          ))}
        </div>
      </section>

      <p className="leading-relaxed text-muted">
        Read the architectural decisions and tradeoffs in my{' '}
        <CrossSiteLink href="https://caskeycoding.com/case-studies" rel="noopener">
          public case studies
        </CrossSiteLink>
        .
      </p>
    </article>
  );
}
