import { LAST_MODIFIED } from './lib/lastModified';
import Link from 'next/link';
import { Headshot } from './components/Headshot';
import { CrossSiteLink } from './components/CrossSiteLink';
import { PERSON_ID } from './components/PersonJsonLd';

const websiteJsonLd = {
  dateModified: LAST_MODIFIED.home,
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://ericcaskey.com/#website',
  name: 'Eric Caskey',
  url: 'https://ericcaskey.com',
  author: { '@id': PERSON_ID, '@type': 'Person', name: 'Eric Caskey' },
};

// The visible answers and structured data deliberately share one source.
const HOME_FAQ = [
  {
    q: 'Who is Eric Caskey?',
    a: 'I am an AI reliability engineer and open-source builder. I build guardrails, evaluation gates, and spec-driven agent workflows for AI-assisted software delivery, and I write about them at caskeycoding.com. I am a Senior Software Engineer at Amazon. My open-source projects are personal work, separate from my role at Amazon.',
  },
  {
    q: 'What does Eric Caskey work on at Amazon?',
    a: "I own the monitoring platform that standardizes monitors across application stages, and I architected a workflow orchestration platform built safe by default. Its validation guardrails run before every automated change. I also drove the platform's spec-as-code system, which gives AI coding agents curated context instead of raw access.",
  },
  {
    q: 'What has Eric Caskey built outside work?',
    a: 'I built Ballast, an open-source RAG system with a guardrails gateway and an evaluation gate, and Loop Harness, a backlog schema and loop protocol for controlled agent work. I also built SpecSelf Starter, a local-first Markdown template for principles, goals, and reviews, and SpecSelf Local, a read-only MCP server for selected Markdown. The wider portfolio includes a C++ options-pricing engine tuned from 15 million to 215 million prices per second.',
  },
  {
    q: 'How do I contact Eric Caskey?',
    a: 'The contact form at ericcaskey.com/contact is the fastest route. I read everything and reply within a week. You can also find me on LinkedIn at linkedin.com/in/ericrcaskey and on GitHub at github.com/CaskeyCoding.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://ericcaskey.com/#faq',
  mainEntity: HOME_FAQ.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

export default function Home() {
  return (
    <article className="sr flex flex-col gap-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <header className="identity-hero" data-identity="spec">
        <div className="identity-top">
          <div>
            <p className="identity-prompt">$ whoami</p>
            <h1 className="identity-name">Eric Caskey</h1>
          </div>
          <Headshot
            alt="Eric Caskey, headshot"
            variant="avatar"
            eager
            className="identity-avatar"
          />
        </div>
        <dl className="identity-fields">
          <div>
            <dt>role:</dt>
            <dd>Platform engineer</dd>
          </div>
        </dl>
        <p className="mt-6 text-lg leading-relaxed text-pretty" data-intro>
          I build platforms that help engineers make changes to production
          systems safely and see how their applications are running.
        </p>
        <div className="identity-cta">
          <Link href="/work#projects" className="sr-btn sr-btn--p">
            Explore my platform experiments →
          </Link>
        </div>
      </header>

      <section id="selected-projects" aria-labelledby="selected-projects-heading" className="flex flex-col gap-4">
        <h2 id="selected-projects-heading" className="text-xl font-semibold [letter-spacing:var(--ls-tight)]">Selected projects</h2>
        <p className="leading-relaxed text-pretty" data-home-project="Loop Harness">
          <strong>Loop Harness</strong> gives a coding agent one backlog item
          at a time. The item carries the checks it has to pass and identifies
          work that needs a human. The backlog format and the rules for running
          the loop are both public.{' '}
          <a href="https://github.com/CaskeyCoding/loop-harness" rel="noopener">Inspect the protocol</a>
        </p>
        <p className="leading-relaxed text-pretty" data-home-project="SpecSelf">
          <strong>SpecSelf</strong> lets me keep principles, goals, and
          decisions in plain Markdown. An agent can point out that a project
          serves none of my goals. I decide whether to change the project or
          reconsider the goal. You can try a weekly review with fictional data
          before writing anything about yourself.{' '}
          <CrossSiteLink href="https://specself.ai/start/" rel="noopener">Try the worked example</CrossSiteLink>
        </p>
      </section>

      <section id="writing" aria-labelledby="writing-heading" className="flex flex-col gap-4">
        <h2 id="writing-heading" className="text-xl font-semibold [letter-spacing:var(--ls-tight)]">Writing</h2>
        <p className="leading-relaxed text-pretty">
          I write about the decisions behind the software. One essay follows a
          C++ options pricer through the measurements that changed how I
          optimized it. Another uses Ballast, a small question-answering app,
          to show how I tested whether its answers held up against its
          sources. <Link href="/writing">Browse selected writing</Link>
        </p>
      </section>

      <section id="get-in-touch" aria-labelledby="get-in-touch-heading" className="flex flex-col items-start gap-4">
        <h2 id="get-in-touch-heading" className="text-xl font-semibold [letter-spacing:var(--ls-tight)]">Get in touch</h2>
        <p className="leading-relaxed text-pretty">
          If you want to talk about platform engineering, speaking, or
          something I wrote, I&apos;d like to hear from you. I read every
          message and reply within a week.
        </p>
        <Link href="/contact" className="btn-primary">Send me a note</Link>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="eyebrow">Questions</p>
          <h2 className="text-xl font-semibold [letter-spacing:var(--ls-tight)]">Common questions</h2>
        </div>
        <dl className="identity-faq flex flex-col gap-4">
          {HOME_FAQ.map(({ q, a }) => (
            <div key={q}>
              <dt className="font-semibold">{q}</dt>
              <dd className="leading-relaxed text-pretty mt-1">{a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  );
}
