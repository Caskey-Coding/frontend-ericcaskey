import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Career narrative, values, and engineering background of Eric Caskey — Amazon platform engineer, former Prudential SRE, Army veteran.',
};

export default function About() {
  return (
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">About</h1>
      </header>

      <section className="flex flex-col gap-4 leading-relaxed">
        <p>
          I&apos;m a platform engineer focused on safety-critical, fleet-scale
          systems. Today I work at Amazon, building the infrastructure
          observability layer and the workflow orchestration platform that
          hundreds of engineering teams across six global offices depend on.
          Before Amazon I spent eight years at Prudential Financial in Cloud
          Engineering and SRE, where I shipped the enterprise monitoring
          platform, the COVID-era reporting continuity systems, and the
          multi-factor authentication portals that served the company&apos;s
          workforce. Before that, I served in the New Jersey Army National
          Guard.
        </p>
        <p>
          The thread across all of it is the same: build platforms that make
          the right thing the easy thing for the engineers who depend on them.
        </p>
        <p>
          Outside of work I run marathons (next up: New York 2026), build small
          AI tools, and write about platform engineering and spec-driven
          development at{' '}
          <a href="https://caskeycoding.com" rel="me noopener">
            caskeycoding.com
          </a>
          .
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Values</h2>
        <ul className="flex flex-col gap-4">
          <li>
            <strong>Build for the engineer who comes after you.</strong>{' '}
            Platforms succeed when the next person on call doesn&apos;t need to
            read the source to make a safe change.
          </li>
          <li>
            <strong>Safety isn&apos;t a feature.</strong> It&apos;s the
            constraint that determines which features are even possible.
          </li>
          <li>
            <strong>Specs before code.</strong> Every system I&apos;ve shipped at
            scale started as a written spec and stayed in sync with one.
          </li>
          <li>
            <strong>Less, but better.</strong> A small platform that does one
            thing predictably beats a large one that does many things
            ambiguously.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Mission</h2>
        <p className="leading-relaxed italic">
          Build platform primitives that make safe, observable, well-specified
          software the path of least resistance for the teams that depend on
          them.
        </p>
      </section>
    </article>
  );
}
