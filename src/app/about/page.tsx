import type { Metadata } from 'next';
import { ValuesList } from '../components/ValuesList';
import { Headshot } from '../components/Headshot';
import { CrossSiteLink } from '../components/CrossSiteLink';

export const metadata: Metadata = {
  title: 'About',
  description:
    "Career narrative, values, and the mission behind Eric Caskey's platform engineering work.",
};

const values = [
  {
    title: 'Safety is not a tax on velocity.',
    body: 'It is what makes velocity trustworthy at scale. Every guardrail I build has to explain not just what failed, but why, what would make it pass, and who owns remediation.',
  },
  {
    title: 'Structure before code.',
    body: 'Design before you dive in. The hard part is rarely the implementation — it is the thinking that has to precede it. Specs, folder structure, decision logs. The structure does not follow the AI; the AI follows the structure.',
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
    <article className="flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          About
        </h1>
      </header>

      <section className="flex flex-col gap-5 leading-relaxed">
        <p>
          I started writing code in 2013 as the Remote Access Analyst at{' '}
          <a
            href="https://medium.com/@wforceorg/success-story-eric-caskey-prudential-financial-d2d2e7258f49"
            target="_blank"
            rel="noopener noreferrer"
          >
            Prudential Financial
          </a>{' '}
          — Tier 3 help desk work with a side project generating QR codes for
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
          was figuring out how to make safety-critical infrastructure quiet —
          how to remove failure modes rather than paper over them.
        </p>
        <p>
          In June 2022 I joined Amazon, where I built a monitoring lifecycle
          platform that onboarded more than 2,750 application stages and over
          200,000 monitors, and hired and mentored eight new-to-industry
          engineers in New York. In August 2024 I moved into the platform
          engineering role I have now — architecting a twelve-service
          workflow orchestration platform that maintains 3 million active
          monitors and powers 500,000 daily automated actions across
          Amazon&apos;s global fleet.
        </p>
        <p>
          Along the way I ran a New Jersey WordPress shop called Caskey Coding
          from 2015 to 2018 — ten sites for small businesses and community
          organizations — and served as a Military Police Officer in the 50th
          Brigade of the NJ Army National Guard from 2009 to 2015, including a
          2012 Superstorm Sandy activation where I safeguarded the
          distribution of 241,000 gallons of FEMA fuel for nearly a month.
        </p>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold">Values</h2>
        <ValuesList values={values} />
      </section>

      <blockquote
        className="border-l-2 pl-4 italic text-lg leading-snug"
        style={{
          borderColor: 'var(--color-accent)',
          color: 'var(--color-text-primary)',
        }}
      >
        Build the systems other engineers depend on. Write honestly about how
        it goes.
      </blockquote>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">On writing</h2>
        <p className="leading-relaxed">
          I publish long-form essays on workflow orchestration, safety-critical
          platforms, and spec-driven development at{' '}
          <strong>
            <CrossSiteLink href="https://caskeycoding.com" rel="noopener">
              Caskey Engineering
            </CrossSiteLink>
          </strong>
          {' '}(caskeycoding.com). It is the engineering side of this website —
          a working notebook where the arguments get worked out in full. If
          you are here looking for proof, that is where the proof lives.
        </p>
      </section>

      <div className="max-w-xs">
        <Headshot alt="Eric Caskey" />
      </div>
    </article>
  );
}
