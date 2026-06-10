import type { Metadata } from 'next';
import { EssayCard } from '../components/EssayCard';
import { CrossSiteLink } from '../components/CrossSiteLink';
import { ogImage } from '../lib/og';

export const metadata: Metadata = {
  title: 'Writing',
  description:
    'Three selected essays by Eric Caskey on spec-driven development, safety-critical distributed systems, and AI application engineering.',
  openGraph: {
    title: 'Writing',
    description:
      'Three selected essays by Eric Caskey on spec-driven development, safety-critical distributed systems, and AI application engineering.',
    url: 'https://ericcaskey.com/writing',
    images: [ogImage],
  },
  alternates: { canonical: '/writing' },
};

// B-077: publishedDate matches each essay's canonical publish date on
// caskeycoding.com/blog (post frontmatter `date`), one "Month D, YYYY"
// format, list sorted newest-first.
const essays = [
  {
    title: 'Building an AI Finance App',
    url: 'https://caskeycoding.com/blog/building-an-ai-finance-app',
    publishedDate: 'May 19, 2026',
    editorNote:
      'An honest account of what worked, what did not, and why the hard part is rarely the AI.',
  },
  {
    title: 'Designing Safety Guardrails for Distributed Workflow Orchestration',
    url: 'https://caskeycoding.com/blog/designing-safety-guardrails-for-distributed-workflow-orchestration',
    publishedDate: 'April 10, 2026',
    editorNote:
      "What I've learned building validation engines for infrastructure where an incorrect \u201Cyes\u201D is a production incident.",
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

export default function Writing() {
  return (
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Selected writing
        </h1>
        <p className="leading-relaxed text-muted">
          Three essays from Caskey Engineering that cover how I think about
          this work. Each opens on caskeycoding.com.
        </p>
      </header>

      <section className="flex flex-col">
        {essays.map((e) => (
          <EssayCard key={e.url} {...e} />
        ))}
      </section>

      <p className="leading-relaxed text-muted">
        The full archive lives at{' '}
        <CrossSiteLink href="https://caskeycoding.com/blog" rel="noopener">
          caskeycoding.com/blog
        </CrossSiteLink>
        .
      </p>
    </article>
  );
}
