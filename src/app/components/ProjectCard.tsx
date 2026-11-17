import { CrossSiteLink } from './CrossSiteLink';
import { ExternalLinkIcon } from './ExternalLinkIcon';
import type { PersonalProject } from '../lib/work';

// The base `a { color: inherit }` rule is unlayered, so it outranks a color
// utility on the anchor itself. The accent color is set on the wrapper below
// and each link inherits it.
const LINK_CLASS = 'inline-flex items-center gap-1.5 text-sm font-medium';

// Eric's own sites carry the theme handoff (CrossSiteLink); other hosts, such
// as GitHub, get a plain anchor so no theme query leaves the family of sites.
function ProjectAction({ href, cta }: { href: string; cta: string }) {
  const content = (
    <>
      {cta} →
      <ExternalLinkIcon className="shrink-0" />
    </>
  );
  if (new URL(href).hostname === 'github.com') {
    return (
      <a href={href} rel="noopener" className={LINK_CLASS}>
        {content}
      </a>
    );
  }
  return (
    <CrossSiteLink href={href} rel="noopener" className={LINK_CLASS}>
      {content}
    </CrossSiteLink>
  );
}

// The primary and the optional secondary action render as two separate links,
// never one link wrapping the whole card.
function ProjectActions({ project, className = '' }: { project: PersonalProject; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-x-5 gap-y-2 text-accent ${className}`} data-project-actions>
      <ProjectAction href={project.href} cta={project.cta} />
      {project.secondary && (
        <ProjectAction href={project.secondary.href} cta={project.secondary.cta} />
      )}
    </div>
  );
}

export function ProjectCard({
  project,
  variant = 'row',
}: {
  project: PersonalProject;
  variant?: 'row' | 'tile';
}) {
  const status = (
    <span
      className="project-status"
      title={project.statusMeaning}
    >
      status: {project.status}
    </span>
  );

  if (variant === 'tile') {
    return (
      <div className="sr-tile" data-project={project.name}>
        <span className="k">{project.kind}</span>
        <span className="t">{project.name}</span>
        {status}
        {project.dates && <span className="text-sm text-muted tabular-nums">{project.dates}</span>}
        <span className="d">{project.description}</span>
        <ProjectActions project={project} className="mt-3" />
      </div>
    );
  }

  return (
    <article data-project={project.name}>
      <div className="flex flex-col gap-2 py-5 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1">
          <div className="flex flex-col md:flex-row md:items-baseline md:gap-3">
            <h3 className="font-semibold">{project.name}</h3>
            <span className="text-sm text-muted">{project.context}</span>
          </div>
          {project.dates && <span className="text-sm text-muted tabular-nums">{project.dates}</span>}
        </div>
        {status}
        <p className="leading-relaxed text-sm md:text-base">{project.description}</p>
        <ProjectActions project={project} />
      </div>
    </article>
  );
}
