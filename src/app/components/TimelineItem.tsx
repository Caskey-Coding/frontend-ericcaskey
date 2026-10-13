import { CrossSiteLink } from './CrossSiteLink';
import { ExternalLinkIcon } from './ExternalLinkIcon';
import type { Employer } from '../lib/work';

export function TimelineItem({
  company,
  role,
  dates,
  oneLineImpact,
  href,
  metrics,
}: Employer) {
  const content = (
    <div className="flex flex-col gap-2 py-5 border-b border-border transition-colors">
      <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1">
        <div className="flex flex-col md:flex-row md:items-baseline md:gap-3">
          <h3 className="font-semibold">{company}</h3>
          <span className="text-sm text-muted">{role}</span>
        </div>
        {/* tabular-nums: date ranges are comparable data (v2.1 §2.2). */}
        <span className="text-sm text-muted tabular-nums">{dates}</span>
      </div>
      <p className="leading-relaxed text-sm md:text-base">{oneLineImpact}</p>
      {metrics && metrics.length > 0 && (
        <dl className="work-metrics">
          {metrics.map(({ label, value }) => (
            <div key={label}>
              <dt>{label}:</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {href && (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
          Case study on Caskey Engineering →
          <ExternalLinkIcon className="shrink-0" />
        </span>
      )}
    </div>
  );

  return (
    <article data-employer={company}>
      {href ? (
        <CrossSiteLink
          href={href}
          rel="noopener"
          className="link-plain block transition-colors hover:[&_.font-semibold]:text-[color:var(--color-accent)] hover:[&>div]:border-[color:var(--color-border-strong)]"
        >
          {content}
          <span className="sr-only">(opens Caskey Engineering)</span>
        </CrossSiteLink>
      ) : content}
    </article>
  );
}
