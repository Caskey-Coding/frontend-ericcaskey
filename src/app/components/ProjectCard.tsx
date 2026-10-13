import { CrossSiteLink } from './CrossSiteLink';
import { ExternalLinkIcon } from './ExternalLinkIcon';
import type { PersonalProject } from '../lib/work';

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
      <CrossSiteLink
        href={project.href}
        rel="noopener"
        className="sr-tile link-plain"
        data-project={project.name}
      >
        <span className="k">{project.kind}</span>
        <span className="t">{project.name} →</span>
        {status}
        {project.dates && <span className="text-sm text-muted tabular-nums">{project.dates}</span>}
        <span className="d">{project.description}</span>
      </CrossSiteLink>
    );
  }

  return (
    <article data-project={project.name}>
      <CrossSiteLink
        href={project.href}
        rel="noopener"
        className="link-plain block transition-colors hover:[&_.font-semibold]:text-[color:var(--color-accent)] hover:[&>div]:border-[color:var(--color-border-strong)]"
      >
        <div className="flex flex-col gap-2 py-5 border-b border-border transition-colors">
          <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1">
            <div className="flex flex-col md:flex-row md:items-baseline md:gap-3">
              <h3 className="font-semibold">{project.name}</h3>
              <span className="text-sm text-muted">{project.context}</span>
            </div>
            {project.dates && <span className="text-sm text-muted tabular-nums">{project.dates}</span>}
          </div>
          {status}
          <p className="leading-relaxed text-sm md:text-base">{project.description}</p>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
            {project.cta} →
            <ExternalLinkIcon className="shrink-0" />
          </span>
        </div>
      </CrossSiteLink>
    </article>
  );
}
