import type { Metadata } from 'next';
import { TimelineItem } from '../components/TimelineItem';
import { ToolCard } from '../components/ToolCard';
import { CrossSiteLink } from '../components/CrossSiteLink';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Where Eric Caskey has built platforms, infrastructure, and safety-critical systems. Amazon, Prudential Financial, Caskey Coding LLC, NJ Army National Guard.',
};

const employers = [
  {
    company: 'Amazon',
    role: 'Platform engineer',
    dates: 'Jun 2022 – Present',
    oneLineImpact:
      "Architected a workflow orchestration platform maintaining 3 million active monitors and powering 500,000 daily automated actions across Amazon's global fleet. Previously standardized monitoring across 2,750+ application stages.",
    href: 'https://caskeycoding.com/case-studies/multi-region-workflow-orchestration',
  },
  {
    company: 'Prudential Financial',
    role: 'Remote Access SRE → Senior Remote Access SRE',
    dates: 'Apr 2013 – Jun 2022',
    oneLineImpact:
      'Built the MFA self-service portal used over 18,000 times in six languages, automated 200,000+ administrative actions, and kept the VPN running for 60,000 corporate users through the early months of COVID.',
    href: 'https://caskeycoding.com/case-studies/qr-code-mfa-portal',
  },
  {
    company: 'Caskey Coding, LLC',
    role: 'Owner, operator',
    dates: 'Feb 2015 – May 2018',
    oneLineImpact:
      'Ran a New Jersey WordPress shop. Delivered ten sites for small businesses and community organizations. SEO work for The Drain Guys took monthly organic clicks from 2 to 52 in six months.',
  },
  {
    company: 'NJ Army National Guard',
    role: 'Military Police Officer, 50th Brigade Special Troops Battalion',
    dates: 'Jul 2009 – Jun 2015',
    oneLineImpact:
      'Reached senior Specialist rank. Activated for 2012 Superstorm Sandy recovery, assigned to safeguard and distribute 241,000 gallons of FEMA fuel for nearly a month.',
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
    <article className="flex flex-col gap-12">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Work
        </h1>
        <p className="leading-relaxed">
          A decade of the career in four rows. The deep case studies — with
          metrics, diagrams, and architectural decisions — live on{' '}
          <CrossSiteLink href="https://caskeycoding.com" rel="noopener">
            Caskey Engineering
          </CrossSiteLink>
          .
        </p>
      </header>

      <section className="flex flex-col">
        {employers.map((e) => (
          <TimelineItem key={e.company} {...e} />
        ))}
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold">Tools I&apos;ve built</h2>
        <p className="leading-relaxed">
          Two small AI applications built on the same stack I use at work,
          published as field notes on Caskey Engineering.
        </p>
        <div className="flex flex-col">
          {tools.map((t) => (
            <ToolCard key={t.name} {...t} />
          ))}
        </div>
      </section>

      <p
        className="leading-relaxed"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Everything above — and several things that are not — lives in full on{' '}
        <CrossSiteLink href="https://caskeycoding.com" rel="noopener">
          Caskey Engineering
        </CrossSiteLink>
        .
      </p>
    </article>
  );
}
