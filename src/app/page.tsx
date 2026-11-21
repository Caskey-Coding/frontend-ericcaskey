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

export default function Home() {
  return (
    <article className="sr flex flex-col gap-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
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
    </article>
  );
}
