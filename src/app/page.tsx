import type { CSSProperties } from 'react';
import Link from 'next/link';
import { Headshot } from './components/Headshot';
import { CrossSiteLink } from './components/CrossSiteLink';
import { TimelineItem } from './components/TimelineItem';
import { EssayCard } from './components/EssayCard';
import StatusReadout from './components/StatusReadout';

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
    jobTitle: 'Senior Software Engineer',
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

// Status-panel figures , broadened to show range across the career, every
// figure traceable to canonical copy: the Amazon scale numbers (hero bio +
// /work Amazon row), the Prudential continuity number (/work Prudential row:
// "60,000 corporate users through the early months of COVID"), and the tenure
// from the bio ("Fifteen years at enterprise scale"). No new/unsourced numbers.
const stats = [
  { tag: 'Scale', figure: '3,000,000', label: 'active monitors' },
  { tag: 'Throughput', figure: '500,000', label: 'scans + checks / day' },
  { tag: 'Continuity', figure: '60,000', label: 'users kept online' },
  { tag: 'Experience', figure: '15 yrs', label: 'at enterprise scale' },
];

// Top two rows of the /work timeline, copy verbatim from
// src/app/work/page.tsx , same claims, same hrefs, same chip metrics
// (B-076 mirror rule: metrics are verbatim substrings of oneLineImpact,
// additive metadata only; any change here must match /work byte-for-byte).
const featuredWork = [
  {
    company: 'Amazon',
    role: 'Senior Software Engineer',
    dates: 'Jun 2022 – Present',
    oneLineImpact:
      "Architected a workflow orchestration platform built safe by default: validation guardrails run before every automated change, and a spec-as-code system gives AI coding agents curated context instead of raw access. It maintains 3 million active monitors and runs 500,000 daily scans and health checks across Amazon's fleet, on monitoring patterns I standardized across 2,750+ application stages.",
    metrics: ['3 million active monitors', '500,000 daily scans and health checks'],
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
];

// Two selected /writing cards, copy verbatim from src/app/writing/page.tsx
// (MIRROR RULE, content/001 rule 6). EC-BRAND-1 (2026-07-08): curated to the
// AI-safety pair: Ballast (an AI system that refuses when it should) and the
// workflow-guardrails essay, so the home stays safety-led while surfacing a
// flagship independent build. Any copy edit here must match /writing exactly.
const selectedWriting = [
  {
    title: "Ballast: An LLM App Whose Best Feature Is Saying 'I Don't Know'",
    url: 'https://caskeycoding.com/blog/ballast-an-llm-that-says-i-dont-know',
    publishedDate: 'June 27, 2026',
    editorNote:
      'A RAG system whose most important feature is refusing to answer. How trust got built into the architecture instead of the prompt.',
  },
  {
    title: 'Designing Safety Guardrails for Distributed Workflow Orchestration',
    url: 'https://caskeycoding.com/blog/designing-safety-guardrails-for-distributed-workflow-orchestration',
    publishedDate: 'April 10, 2026',
    editorNote:
      "What I've learned building validation engines for infrastructure where an incorrect “yes” is a production incident.",
  },
];

export default function Home() {
  return (
    <article className="sr flex flex-col gap-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/*
        Masthead , "Systems Readout" (ericcaskey home redesign). A full-bleed,
        always-dark "readout" band: JetBrains Mono structural labels + a left
        spec-rail of mono coordinates, a Newsreader-serif bio, and the scale
        figures rendered as a status panel. Self-contained dark palette
        (.sr-* in globals.css) so it reads identically under either site theme;
        the sections below stay on the global themed tokens. Reveal-on-load
        keeps the one-orchestrated-load motion contract.
      */}
      <header className="sr-hero reveal" style={reveal(0)}>
        <p className="sr-tag">Platform engineering · AI reliability</p>
        <div className="sr-grid">
          <aside className="sr-rail" aria-label="Profile at a glance">
            <div><span className="k">LOC</span> new jersey</div>
            <div><span className="k">ROLE</span> senior swe</div>
            <div><span className="k">ORG</span> amazon</div>
            <div><span className="k">SINCE</span> 2022</div>
            <div><span className="k">PRIOR</span> prudential</div>
            <div><span className="k">WRITES</span> caskeycoding.com</div>
          </aside>
          <div>
            <div className="sr-masthead">
              <div>
                <h1 className="sr-name">Eric Caskey</h1>
                {/*
                  Positioning one-liner (WREC-6, D-13 scope-not-title): reach is
                  expressed as org-wide SCOPE, never a title. Both figures are
                  already published and CSV-backed: "3 million active monitors"
                  (hero bio + /work Amazon row) and "2,750+ application stages"
                  (/work Amazon row). No new or unsourced numbers here.
                */}
                <p className="sr-lead">
                  I make AI systems safe enough to depend on, at org scale: 3
                  million monitors, 2,750+ application stages.
                </p>
                <p className="sr-bio">
                  Fifteen years making production infrastructure safe to depend
                  on. At Amazon I architect a multi-region workflow orchestration
                  platform with validation guardrails that run before anything
                  executes. Now I bring that same rigor to AI: spec-driven
                  systems, curated context, and validation that catches a wrong
                  “yes” before it ships. I write about how this work actually gets
                  done at Caskey Engineering.
                </p>
                <div className="sr-cta">
                  <CrossSiteLink
                    href="https://caskeycoding.com"
                    rel="noopener"
                    className="sr-btn sr-btn--p"
                  >
                    read the work →
                  </CrossSiteLink>
                  <Link href="/about" className="sr-btn sr-btn--s">
                    about →
                  </Link>
                </div>
              </div>
              <div className="sr-photo">
                <Headshot alt="Eric Caskey, headshot" eager />
              </div>
            </div>
            <StatusReadout stats={stats} />
          </div>
        </div>
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
