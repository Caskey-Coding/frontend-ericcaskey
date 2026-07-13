import type { Metadata } from 'next';
import { TimelineItem } from '../components/TimelineItem';
import { CrossSiteLink } from '../components/CrossSiteLink';
import { ogImage } from '../lib/og';
import { BreadcrumbJsonLd } from '../components/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Where Eric Caskey has built platforms, infrastructure, and safety-critical systems. Amazon, Prudential Financial, Caskey Coding LLC, NJ Army National Guard.',
  openGraph: {
    title: 'Work',
    description:
      'Where Eric Caskey has built platforms, infrastructure, and safety-critical systems. Amazon, Prudential Financial, Caskey Coding LLC, NJ Army National Guard.',
    url: 'https://ericcaskey.com/work',
    images: [ogImage],
  },
  alternates: { canonical: '/work' },
};

// B-076: `metrics` chips are verbatim substrings of each row's
// oneLineImpact (additive display metadata, no new claims).
const employers = [
  {
    company: 'Amazon',
    role: 'Senior Software Engineer',
    dates: 'Jun 2022 – Present',
    oneLineImpact:
      "Architected a workflow orchestration platform built safe by default: validation guardrails run before every automated change, and a spec-as-code system gives AI coding agents curated context instead of raw access. It runs 500,000 automated actions a day across Amazon's fleet. I also own the monitoring platform underneath it, which keeps 3 million monitors standardized across 2,750+ application stages.",
    metrics: ['500,000 automated actions a day', '3 million monitors'],
    href: 'https://caskeycoding.com/case-studies/workflow-orchestration',
  },
  {
    company: 'Prudential Financial',
    role: 'Remote Access SRE → Senior Remote Access SRE',
    dates: 'Apr 2013 – Jun 2022',
    oneLineImpact:
      'Built the MFA self-service portal used over 18,000 times in six languages, automated 200,000+ administrative actions, and kept the VPN running for 60,000 corporate users through the early months of COVID.',
    metrics: ['200,000+ administrative actions', '60,000 corporate users'],
    href: 'https://caskeycoding.com/case-studies/mfa-at-scale',
  },
  {
    company: 'Workforce Opportunity Services',
    role: 'Consultant',
    dates: '2011 – 2013',
    oneLineImpact:
      "Launched my technology career as a WOS consultant, rapidly learning enterprise IT environments and contributing to Prudential's remote access platform operations.",
  },
  {
    company: 'Caskey Coding, LLC',
    role: 'Owner, operator',
    dates: 'Feb 2015 – May 2018',
    oneLineImpact:
      'Ran a New Jersey WordPress shop. Delivered ten sites for small businesses and community organizations. SEO work for The Drain Guys took monthly organic clicks from 2 to 52 in six months.',
    metrics: ['ten sites', 'clicks from 2 to 52'],
  },
  {
    company: 'NJ Army National Guard',
    role: 'Military Police Officer, 50th Brigade Special Troops Battalion',
    dates: 'Jul 2009 – Jun 2015',
    oneLineImpact:
      'Reached senior Specialist rank. Activated for 2012 Superstorm Sandy recovery, assigned to safeguard and distribute 241,000 gallons of FEMA fuel for nearly a month.',
    metrics: ['241,000 gallons of FEMA fuel'],
  },
];

// EC-BRAND-1 (specs → ericcaskey-com/content/004 amendment 2026-07-08):
// "Selected builds" range band. Each entry is a portfolio-proof OUTBOUND link
// (spec 009 policy: work-shaped surfaces resolve to caskeycoding, never
// duplicated here) to the live tool, the public writeup, or the playground.
// `kind` is the mono tile label. Finance entries are framed as engineering,
// never as investment edge (the composite fails net-of-cost; an edge claim to
// a finance-literate reader is a credibility risk, not a selling point).
const tools = [
  {
    kind: 'Tool',
    name: 'Marathon Coach',
    tagline: 'Grounded AI marathon training plans with Garmin integration.',
    // EC-WORK-1: the public preview, not the signed-in door (/coach) which
    // lands anonymous visitors on a sign-in wall.
    url: 'https://caskeycoding.com/tools/marathon-coach',
  },
  {
    kind: 'Tool',
    name: 'Finance Reviewer',
    tagline:
      'Committee-based AI investment analysis with a five-persona scoring model.',
    // EC-WORK-1: the public preview (/tools/investment-committee), not /finance.
    url: 'https://caskeycoding.com/tools/investment-committee',
  },
  {
    kind: 'Open source',
    name: 'Ballast',
    tagline:
      'An open-source RAG system with a guardrails gateway, engineered to refuse when it should.',
    url: 'https://caskeycoding.com/blog/ballast-an-llm-that-says-i-dont-know',
  },
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
    url: 'https://caskeycoding.com/play',
  },
  {
    kind: 'Platform',
    name: 'Finance research platform',
    tagline:
      'The decision engine, backtester, and methodology behind the Reviewer, documented in the open.',
    url: 'https://caskeycoding.com/finance/methodology',
  },
];

export default function Work() {
  return (
    <article className="sr flex flex-col gap-12">
      <BreadcrumbJsonLd name="Work" path="/work" />
      {/* Systems Readout sub-page header (FDS-7): a mono coordinate line +
          serif title, hairline-sealed, same voice as the home masthead. */}
      <header className="sr-pagehead">
        <p className="coord">
          <span>Experience</span>
          <span className="sep">·</span>
          <span>5 roles</span>
          <span className="sep">·</span>
          <span>2009 → present</span>
        </p>
        <h1 className="text-3xl md:text-4xl">Work</h1>
        <p className="sub">
          Fifteen years across five roles. The deep case studies, with metrics,
          diagrams, and architectural decisions, live on{' '}
          <CrossSiteLink href="https://caskeycoding.com" rel="noopener">
            Caskey Engineering
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
          work. Each links to the live tool, the writeup, or the playground on
          Caskey Engineering. The finance work is engineering, not investment
          advice.
        </p>
        <div className="sr-tiles">
          {tools.map((t) => (
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
        Everything above, and several things that are not, lives in full on{' '}
        <CrossSiteLink href="https://caskeycoding.com" rel="noopener">
          Caskey Engineering
        </CrossSiteLink>
        .
      </p>
    </article>
  );
}
