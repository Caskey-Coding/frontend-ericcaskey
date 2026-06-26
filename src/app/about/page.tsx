import type { Metadata } from 'next';
import { ValuesList } from '../components/ValuesList';
import { Headshot } from '../components/Headshot';
import { CrossSiteLink } from '../components/CrossSiteLink';
import { ogImage } from '../lib/og';

export const metadata: Metadata = {
  title: 'About',
  description:
    "Career narrative, values, and the mission behind Eric Caskey's platform engineering work.",
  openGraph: {
    title: 'About',
    description:
      "Career narrative, values, and the mission behind Eric Caskey's platform engineering work.",
    url: 'https://ericcaskey.com/about',
    images: [ogImage],
  },
  alternates: { canonical: '/about' },
};

const values = [
  {
    title: 'Safety is not a tax on velocity.',
    body: 'It is what makes velocity trustworthy at scale. Every guardrail I build has to explain not just what failed, but why, what would make it pass, and who owns remediation.',
  },
  {
    title: 'Structure before code.',
    body: 'Design before you dive in. The hard part is rarely the implementation; it is the thinking that has to precede it. Specs, folder structure, decision logs. The structure does not follow the AI; the AI follows the structure.',
  },
  {
    title: 'Scope, not labels.',
    body: 'A title is a claim; scale is evidence. I would rather describe the systems I am responsible for than the level I am paid at.',
  },
  {
    title: 'Earned lessons only.',
    body: 'I write what I have learned by getting it wrong first, in production. The things I would have done differently are the things worth writing about.',
  },
];

export default function About() {
  return (
    <article className="sr flex flex-col gap-12">
      {/* Systems Readout sub-page header: mono coordinate line + serif title,
          hairline-sealed , same voice as the home masthead. */}
      <header className="sr-pagehead">
        <p className="coord">
          <span>Background</span>
          <span className="sep">·</span>
          <span>new jersey</span>
          <span className="sep">·</span>
          <span>since 2013</span>
        </p>
        <h1 className="text-3xl md:text-4xl">About</h1>
      </header>

      <section className="flex flex-col gap-5 leading-relaxed text-pretty">
        <p>
          I came into tech through Workforce Opportunity Services, then started
          writing code in 2013 as the Remote Access Analyst at{' '}
          <a
            href="https://medium.com/@wforceorg/success-story-eric-caskey-prudential-financial-d2d2e7258f49"
            target="_blank"
            rel="noopener noreferrer"
          >
            Prudential Financial
          </a>
          : Tier 3 help desk work with a side project generating QR codes for
          MFA enrollment. That side project ran for eight years and produced
          over 300,000 activation codes. It also convinced me the job I wanted
          was the engineering one, not the support one.
        </p>
        <p>
          From there I moved up through Remote Access SRE and Senior Remote
          Access SRE at Prudential, where I built the MFA self-service portal
          used more than 18,000 times in six languages, automated over 200,000
          administrative actions, and kept the VPN running for 60,000
          corporate users through the early months of COVID. Most of that work
          was figuring out how to make safety-critical infrastructure quiet:
          how to remove failure modes rather than paper over them.
        </p>
        <p>
          In June 2022 I joined Amazon, where I built a monitoring lifecycle
          platform that onboarded more than 2,750 application stages and over
          200,000 monitors, and hired and mentored eight new-to-industry
          engineers in New York. In August 2024 I moved into the platform
          engineering role I have now, architecting a twelve-service
          workflow orchestration platform that maintains 3 million active
          monitors and powers 500,000 daily automated actions across
          Amazon&apos;s fleet.
        </p>
        <p>
          Along the way I ran a New Jersey WordPress shop called Caskey Coding
          from 2015 to 2018 (ten sites for small businesses and community
          organizations), and served as a Military Police Officer in the 50th
          Brigade of the NJ Army National Guard from 2009 to 2015, including a
          2012 Superstorm Sandy activation where I safeguarded the
          distribution of 241,000 gallons of FEMA fuel for nearly a month.
        </p>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold [letter-spacing:var(--ls-tight)]">Values</h2>
        <ValuesList values={values} />
      </section>

      {/* Hairlines only (v2.1 §2.5): 1px border; 2px belongs to the focus
          ring alone. */}
      <blockquote className="border-l border-accent pl-4 italic text-lg leading-snug text-text">
        Build the systems other engineers depend on. Write honestly about how
        it goes.
      </blockquote>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold [letter-spacing:var(--ls-tight)]">On writing</h2>
        <p className="leading-relaxed">
          I publish long-form essays on workflow orchestration, safety-critical
          platforms, and spec-driven development at{' '}
          <strong>
            <CrossSiteLink href="https://caskeycoding.com" rel="noopener">
              Caskey Engineering
            </CrossSiteLink>
          </strong>
          {' '}(caskeycoding.com). It is the engineering side of this website,
          a working notebook where the arguments get worked out in full.
        </p>
      </section>

      {/* FDS-8: border-led frame on the headshot (v2.1 §2.1, no lift),
          matching the hero treatment. */}
      <div className="max-w-xs overflow-hidden rounded-[var(--radius-lg)] border border-border">
        <Headshot alt="Eric Caskey" />
      </div>
    </article>
  );
}
