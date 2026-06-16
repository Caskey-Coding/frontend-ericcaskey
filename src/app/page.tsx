import type { CSSProperties } from 'react';
import Link from 'next/link';
import { Headshot } from './components/Headshot';
import { CrossSiteLink } from './components/CrossSiteLink';
import { TimelineItem } from './components/TimelineItem';
import { EssayCard } from './components/EssayCard';

// Staggered page-load reveal delay (one orchestrated load, family design
// spec v2.1 §motion). Custom property consumed by `.reveal` in globals.css.
const reveal = (ms: number): CSSProperties =>
  ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Eric Caskey',
  url: 'https://ericcaskey.com',
  author: {
    '@type': 'Person',
    // Same @id as the canonical Person node (see PersonJsonLd.tsx) so this
    // author reference resolves to the one entity rather than spawning a new one.
    '@id': 'https://ericcaskey.com/#person',
    name: 'Eric Caskey',
    url: 'https://ericcaskey.com',
    jobTitle: 'Platform Engineer',
    // Declare the cross-domain + social profiles so search engines resolve
    // ericcaskey.com and caskeycoding.com to one entity (caskeycoding's Person
    // already links back here) rather than treating them as competitors.
    sameAs: [
      'https://caskeycoding.com',
      'https://www.linkedin.com/in/ericrcaskey',
      'https://github.com/CaskeyCoding',
    ],
  },
};

// B-075: figures and labels lifted verbatim out of the hero bio paragraph
// ("maintaining 3 million active monitors", "powering 500,000 daily
// automated actions") and /work ("2,750+ application stages",
// src/app/work/page.tsx Amazon row). No new numbers — every figure traces
// to the canonical copy spec and Positions.csv.
const stats = [
  { figure: '3 million', label: 'active monitors' },
  { figure: '500,000', label: 'daily automated actions' },
  { figure: '2,750+', label: 'application stages' },
];

// Top two rows of the /work timeline, copy verbatim from
// src/app/work/page.tsx — same claims, same hrefs, same chip metrics
// (B-076 mirror rule: metrics are verbatim substrings of oneLineImpact,
// additive metadata only; any change here must match /work byte-for-byte).
const featuredWork = [
  {
    company: 'Amazon',
    role: 'Platform engineer',
    dates: 'Jun 2022 – Present',
    oneLineImpact:
      "Architected a workflow orchestration platform maintaining 3 million active monitors and powering 500,000 daily automated actions across Amazon's global fleet. Previously standardized monitoring across 2,750+ application stages.",
    metrics: ['3 million active monitors', '500,000 daily automated actions'],
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
];

// Two of the three /writing cards, copy verbatim from
// src/app/writing/page.tsx (newest-first, B-077).
const selectedWriting = [
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

export default function Home() {
  return (
    <article className="flex flex-col gap-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/*
        Masthead (FDS-2): the archetypal name+tagline+headshot+CTAs block,
        recomposed as an editorial dossier. A hairline locator rule frames
        the top, the headshot gets a border-led frame (v2.1 §2.1, no lift),
        and the scale figures are folded UP into the masthead as a
        hairline-divided stat strip (its own "Numbers" section is gone) so
        the data reads as part of the identity, not an afterthought. Stays
        inside the 002/004 contract: Inter only, single green accent on
        interactive elements only, no gradients, dividers not cards.
      */}
      <header className="flex flex-col gap-8">
        <div
          className="reveal flex items-center justify-between gap-4 border-b border-border pb-3"
          style={reveal(0)}
        >
          <p className="eyebrow">Platform engineering</p>
          <p className="eyebrow tabular-nums">Amazon · since 2022</p>
        </div>

        <div className="grid md:grid-cols-[1fr_240px] gap-10 items-start">
          <div className="flex flex-col gap-5">
            {/* Tracking/leading come from the global h1 rule
                (--ls-tight/--lh-tight, family design spec v2.1 §2.4). Size
                held to the canonical h1 clamp (002 clash #8) for the
                cross-domain wordmark handoff. */}
            <h1
              className="reveal font-semibold"
              style={{ ...reveal(60), fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}
            >
              Eric Caskey
            </h1>

            <p
              className="reveal text-xl md:text-2xl leading-snug text-muted max-w-xl"
              style={reveal(120)}
            >
              I build the systems other engineers depend on.
            </p>

            <p
              className="reveal text-base md:text-lg leading-relaxed max-w-xl"
              style={reveal(180)}
            >
              Fifteen years at enterprise scale — most of it spent making fleet-wide
              infrastructure safer, more predictable, and less demanding of the
              engineers who use it. At Amazon I architect a multi-region workflow
              orchestration platform. Before that I built the MFA self-service
              portal that got 60,000 Prudential users through the first months of
              COVID. I write about how this work actually gets done at Caskey
              Engineering.
            </p>

            <div
              className="reveal flex flex-col sm:flex-row gap-3 mt-2"
              style={reveal(240)}
            >
              <CrossSiteLink
                href="https://caskeycoding.com"
                rel="noopener"
                className="btn-primary"
              >
                Read the work →
              </CrossSiteLink>
              <Link href="/about" className="btn-secondary">
                About →
              </Link>
            </div>
          </div>

          <div className="reveal" style={reveal(120)}>
            <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
              <Headshot alt="Eric Caskey, headshot" eager />
            </div>
          </div>
        </div>

        {/* Scale figures, folded into the masthead. Hairline-divided cells,
            tabular figures (v2.1 §2.2); verbatim from /work (B-075). */}
        <section
          aria-label="Scale in numbers"
          className="reveal grid grid-cols-1 sm:grid-cols-3 border-t border-border"
          style={reveal(300)}
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col gap-1 py-5 sm:px-6 sm:first:pl-0 border-border border-b sm:border-b-0 ${
                i > 0 ? 'sm:border-l' : ''
              }`}
            >
              <span className="text-3xl md:text-4xl font-semibold [letter-spacing:var(--ls-tight)] tabular-nums">
                {s.figure}
              </span>
              <span className="text-sm text-muted">{s.label}</span>
            </div>
          ))}
        </section>
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="eyebrow">Work</p>
          <h2 className="text-xl font-semibold [letter-spacing:var(--ls-tight)]">Featured work</h2>
        </div>
        <div className="flex flex-col">
          {featuredWork.map((e) => (
            <TimelineItem key={e.company} {...e} />
          ))}
        </div>
        <p className="leading-relaxed">
          <Link href="/work">More on the work page →</Link>
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="eyebrow">Writing</p>
          <h2 className="text-xl font-semibold [letter-spacing:var(--ls-tight)]">Selected writing</h2>
        </div>
        <div className="flex flex-col">
          {selectedWriting.map((e) => (
            <EssayCard key={e.url} {...e} />
          ))}
        </div>
        <p className="leading-relaxed">
          <Link href="/writing">More on the writing page →</Link>
        </p>
      </section>

      <section className="flex flex-col items-start gap-4">
        <h2 className="text-xl font-semibold [letter-spacing:var(--ls-tight)]">Get in touch</h2>
        <p className="leading-relaxed">
          I read everything. The contact form is the fastest route.
        </p>
        <Link href="/contact" className="btn-primary">
          Contact →
        </Link>
      </section>
    </article>
  );
}
