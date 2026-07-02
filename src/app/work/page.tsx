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
    role: 'Platform engineer',
    dates: 'Jun 2022 – Present',
    oneLineImpact:
      "Architected a workflow orchestration platform built safe by default: validation guardrails run before every automated change, and a spec-as-code system gives AI coding agents curated context instead of raw access. It maintains 3 million active monitors and runs 500,000 daily scans and health checks across Amazon's fleet, on monitoring patterns I standardized across 2,750+ application stages.",
    metrics: ['3 million active monitors', '500,000 daily scans and health checks'],
    href: 'https://caskeycoding.com/case-studies/multi-region-workflow-orchestration',
  },
  {
    company: 'Prudential Financial',
    role: 'Remote Access SRE → Senior Remote Access SRE',
    dates: 'Apr 2013 – Jun 2022',
    oneLineImpact:
      'Built the MFA self-service portal used over 18,000 times in six languages, automated 200,000+ administrative actions, and kept the VPN running for 60,000 corporate users through the early months of COVID.',
    metrics: ['200,000+ administrative actions', '60,000 corporate users'],
    href: 'https://caskeycoding.com/case-studies/qr-code-mfa-portal',
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

const tools = [
  {
    name: 'Marathon Coach',
    tagline: 'Grounded AI marathon training plans with Garmin integration.',
    url: 'https://caskeycoding.com/coach',
  },
  {
    name: 'Finance Reviewer',
    tagline:
      'Committee-based AI investment analysis with a five-persona scoring model.',
    url: 'https://caskeycoding.com/finance',
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
          <h2 className="text-xl font-semibold [letter-spacing:var(--ls-tight)]">Tools I&apos;ve built</h2>
        </div>
        <p className="leading-relaxed">
          Two small AI applications built on the same stack I use at work,
          published as field notes on Caskey Engineering.
        </p>
        <div className="sr-tiles">
          {tools.map((t) => (
            <CrossSiteLink
              key={t.name}
              href={t.url}
              rel="noopener"
              className="sr-tile link-plain"
            >
              <span className="k">Tool</span>
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
