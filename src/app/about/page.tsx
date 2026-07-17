import type { Metadata } from 'next';
import { ValuesList } from '../components/ValuesList';
import { Headshot } from '../components/Headshot';
import { CrossSiteLink } from '../components/CrossSiteLink';
import { ogImage } from '../lib/og';
import { BreadcrumbJsonLd } from '../components/BreadcrumbJsonLd';

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
    title: 'Guardrails, not booleans.',
    body: 'Safety systems that explain themselves are what keep velocity sustainable past the first incident. Every guardrail I build has to say not just what failed, but why, what would make it pass, and who owns remediation.',
  },
  {
    title: 'Structure before code.',
    body: 'Design before you dive in. Implementation is the fast half; the specs, folder structure, and decision logs that precede it decide whether the system holds up. The structure does not follow the AI; the AI follows the structure.',
  },
  {
    title: 'Scale is the evidence.',
    body: 'A title tells you where someone sits, not what they own. I state mine for context, then let the systems, and the numbers behind them, carry the argument.',
  },
  {
    title: 'Earned lessons only.',
    body: 'I write what I have learned by getting it wrong first, in production. The decisions I would make differently are the ones worth writing about.',
  },
];

export default function About() {
  return (
    <article className="sr flex flex-col gap-12">
      <BreadcrumbJsonLd name="About" path="/about" />
      {/* Systems Readout sub-page header: mono coordinate line + serif title,
          hairline-sealed , same voice as the home masthead. */}
      <header className="sr-pagehead">
        <p className="coord">
          <span>Background</span>
          <span className="sep">·</span>
          <span>new jersey</span>
          <span className="sep">·</span>
          <span>since 2011</span>
        </p>
        <h1 className="text-3xl md:text-4xl">About</h1>
      </header>

      <section className="flex flex-col gap-5 leading-relaxed text-pretty">
        <p>
          I came into tech in 2011 through{' '}
          <a
            href="https://medium.com/@wforceorg/success-story-eric-caskey-prudential-financial-d2d2e7258f49"
            target="_blank"
            rel="noopener noreferrer"
          >
            Workforce Opportunity Services
          </a>
          , placed at Prudential Financial while I was still serving in the NJ
          Army National Guard, and taught myself to code on the job. By 2013 I
          was the Remote Access Analyst: Tier 3 help desk work with a side
          project generating QR codes for MFA enrollment. That side project
          ran for eight years and produced over 300,000 activation codes. It
          also settled which job I wanted: the engineering one, not the
          support one.
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
          platform that onboarded more than 2,750 application stages and
          brought 3 million monitors under standardized management, and hired
          and mentored eight new-to-industry engineers in New York. In August
          2024 I moved into my current role as a Senior Software Engineer on a
          platform team, architecting a twelve-service workflow orchestration
          platform that runs roughly 500,000 automated actions a day across
          Amazon&apos;s fleet, behind a safety framework that validates every
          change before it lands. The lesson carried over from Prudential
          intact: the platforms worth building are the ones that stay quiet
          while everything they watch does not.
        </p>
        <p>
          Nights and weekends I test the same convictions where nobody is
          grading me: an open-source RAG system engineered to refuse when it
          should, a C++ options engine tuned to 215 million prices a second,
          and AI finance tools where the model narrates numbers it is never
          allowed to derive. The selected builds are on the{' '}
          <a href="/work">work page</a>; the full writeups live on Caskey
          Engineering.
        </p>
        <p>
          Along the way I ran a New Jersey WordPress shop called Caskey Coding
          from 2015 to 2018 (ten sites for small businesses and community
          organizations), and served six years as a Military Police Officer in
          the 50th Brigade of the NJ Army National Guard, including a 2012
          Superstorm Sandy activation where I safeguarded the distribution of
          241,000 gallons of FEMA fuel for nearly a month.
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
