import { LAST_MODIFIED } from './lib/lastModified';
import Link from 'next/link';
import { Headshot } from './components/Headshot';
import { CrossSiteLink } from './components/CrossSiteLink';
import { TimelineItem } from './components/TimelineItem';
import { ProjectCard } from './components/ProjectCard';
import { EssayCard } from './components/EssayCard';
import { PERSON_ID } from './components/PersonJsonLd';
import { featuredWork, personalProjects } from './lib/work';
import writingShelf from '../data/writing-shelf.json';

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

// Keep the curated safety pair while taking titles, dates, and editor notes
// from the same generated source as /writing. Feed order does not select them.
const selectedWriting = [
  'ballast-an-llm-that-says-i-dont-know',
  'designing-safety-guardrails-for-distributed-workflow-orchestration',
].map((slug) => {
  const essay = writingShelf.essays.find(({ url }) => url.endsWith(`/blog/${slug}`));
  if (!essay) throw new Error(`Missing curated homepage essay: ${slug}`);
  return essay;
});

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
            <dd>AI Reliability Engineer</dd>
          </div>
          <div>
            <dt>day job:</dt>
            <dd>Senior Software Engineer at Amazon</dd>
          </div>
          <div>
            <dt>focus:</dt>
            <dd>Open-source guardrails, evals, and agent workflows</dd>
          </div>
          <div>
            <dt>claim:</dt>
            <dd className="identity-claim">Safe by default. Validated before it ships.</dd>
          </div>
        </dl>
        <div className="identity-cta">
          <Link href="/work#projects" className="sr-btn sr-btn--p">
            Explore the open-source work →
          </Link>
          <CrossSiteLink
            href="https://caskeycoding.com"
            rel="noopener"
            className="sr-btn sr-btn--s"
          >
            Read the writing →
          </CrossSiteLink>
          {/* About and Contact are text links, not buttons. The span carries the
              hover color because the base anchor color rule is unlayered. */}
          <span className="inline-flex flex-wrap items-center gap-x-5" data-hero-text-links>
            <Link href="/about" className="group inline-flex items-center min-h-[44px]">
              <span className="group-hover:text-[color:var(--color-hero-accent)]">About →</span>
            </Link>
            <Link href="/contact" className="group inline-flex items-center min-h-[44px]">
              <span className="group-hover:text-[color:var(--color-hero-accent)]">Contact →</span>
            </Link>
          </span>
        </div>
      </header>

      <section className="flex flex-col gap-4 leading-relaxed text-pretty" data-intro="open-source-first">
        <p>
          I build the checks around AI-assisted software delivery: guardrails
          that block unsafe output, evaluation gates that fail a build on
          regression, and written specs that tell an agent what done means.
          The method is open source in Ballast, Loop Harness, and SpecSelf,
          all built on my own time.
        </p>
        <p>
          The work draws on fifteen years in enterprise infrastructure. I am a
          Senior Software Engineer at Amazon, where I architect a workflow
          orchestration platform that gates every operation behind concurrent
          safety checks. Before Amazon, I spent nine years at Prudential
          Financial building remote-access, self-service, and cloud
          reliability systems.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="eyebrow">Work</p>
          <h2 className="text-xl font-semibold [letter-spacing:var(--ls-tight)]">Featured work</h2>
        </div>
        <div className="flex flex-col">
          {personalProjects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
          {featuredWork.map((employer) => (
            <TimelineItem key={employer.company} {...employer} />
          ))}
        </div>
        <p className="leading-relaxed">
          <Link href="/work">More on the work page →</Link>
        </p>
        <p className="leading-relaxed text-pretty" data-bridge="independent-work">
          I write up what I build at{' '}
          <CrossSiteLink href="https://caskeycoding.com">caskeycoding.com</CrossSiteLink>: case studies with
          the design decisions and the limits, a lesson series on running an
          engineering team of one, and a lab of working experiments.
        </p>
        <p className="leading-relaxed" data-writing-action>
          <CrossSiteLink href="https://caskeycoding.com" rel="noopener">
            Read the case studies and lessons →
          </CrossSiteLink>
        </p>
      </section>

      <section id="selected-writing" aria-labelledby="selected-writing-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="eyebrow">Writing</p>
          <h2 id="selected-writing-heading" className="text-xl font-semibold [letter-spacing:var(--ls-tight)]">Selected writing</h2>
        </div>
        <div className="flex flex-col">
          {selectedWriting.map((essay) => (
            <EssayCard key={essay.url} {...essay} />
          ))}
        </div>
        <p className="leading-relaxed">
          <Link href="/writing">More on the writing page →</Link>
        </p>
      </section>

      <section className="flex flex-col items-start gap-4">
        <h2 className="text-xl font-semibold [letter-spacing:var(--ls-tight)]">Get in touch</h2>
        <p className="leading-relaxed">
          Get in touch about an engineering project, a question about the
          writing, or a professional conversation. I read everything and reply
          within a week. The contact form is the fastest route.
        </p>
        <Link href="/contact" className="btn-primary">Contact →</Link>
      </section>

      <section id="about-eric" aria-labelledby="about-eric-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="eyebrow">Who</p>
          <h2 id="about-eric-heading" className="text-xl font-semibold [letter-spacing:var(--ls-tight)]">About Eric Caskey</h2>
        </div>
        <p className="leading-relaxed text-pretty">
          I am an AI reliability engineer and open-source builder. My projects
          share one set of rules: a written spec first, deterministic checks in
          the delivery path, and a human on consequential decisions.
        </p>
        <p className="leading-relaxed text-pretty">
          The approach comes from infrastructure work where a bad change is
          expensive. I am a Senior Software Engineer at Amazon and previously
          worked at Prudential Financial.
        </p>
        <p><Link href="/about">More about me →</Link></p>
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
