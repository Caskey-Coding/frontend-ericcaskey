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
    a: "I'm a Senior Software Engineer at Amazon and a platform engineer based in New Jersey. Before Amazon, I worked in remote access and cloud engineering at Prudential Financial. I build production infrastructure that is safe enough to automate, and my independent practice, Caskey Engineering, helps teams assess context, review, and release checks in AI-assisted software delivery.",
  },
  {
    q: 'What does Eric Caskey work on at Amazon?',
    a: "I own the monitoring platform that standardizes monitors across application stages, and I architected a workflow orchestration platform built safe by default. Its validation guardrails run before every automated change. I also drove the platform's spec-as-code system, which gives AI coding agents curated context instead of raw access.",
  },
  {
    q: 'What has Eric Caskey built outside work?',
    a: "I built a spec-driven engineering platform that runs my independent practice and a fleet of AI coding agents through a work queue and an attested merge gate, written up as a case study and a lesson series on Caskey Engineering. I also built Ballast, an open-source RAG system with a guardrails gateway, engineered to refuse when it should; SpecSelf, a spec-driven personal operating system whose AI agents read but never write; a C++ Black-Scholes options engine; and a Finance Reviewer where the model narrates numbers it never derives.",
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
            <dd>Senior Software Engineer, Amazon</dd>
          </div>
          <div>
            <dt>focus:</dt>
            <dd>Platform engineering / AI reliability</dd>
          </div>
          <div>
            <dt>claim:</dt>
            <dd className="identity-claim">Safe by default. Validated before it ships.</dd>
          </div>
        </dl>
        <div className="identity-cta">
          <CrossSiteLink
            href="https://caskeycoding.com/case-studies"
            rel="noopener"
            className="sr-btn sr-btn--p"
          >
            Read the case studies →
          </CrossSiteLink>
          <Link href="/about" className="sr-btn sr-btn--s">About →</Link>
          <Link href="/contact" className="sr-btn sr-btn--s">Contact →</Link>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="eyebrow">Work</p>
          <h2 className="text-xl font-semibold [letter-spacing:var(--ls-tight)]">Featured work</h2>
        </div>
        <div className="flex flex-col">
          {featuredWork.map((employer) => (
            <TimelineItem key={employer.company} {...employer} />
          ))}
          {personalProjects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
        <p className="leading-relaxed">
          <Link href="/work">More on the work page →</Link>
        </p>
        <p className="leading-relaxed text-pretty" data-bridge="independent-work">
          For independent work on AI-assisted delivery, explore{' '}
          <CrossSiteLink href="https://caskeycoding.com/#workflow-assessment">Caskey Engineering</CrossSiteLink>.
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
          Fifteen years in enterprise infrastructure, from a help desk at
          Prudential Financial to the workflow orchestration and monitoring
          platforms I own at Amazon. The through-line has not changed: remove
          the failure mode instead of papering over it, and make the safe path
          the default one. I share the work at <CrossSiteLink href="https://caskeycoding.com">Caskey Engineering</CrossSiteLink>.
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
