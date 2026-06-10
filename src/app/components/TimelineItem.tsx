import { CrossSiteLink } from './CrossSiteLink';
import { ExternalLinkIcon } from './ExternalLinkIcon';

interface TimelineItemProps {
  company: string;
  role: string;
  dates: string;
  oneLineImpact: string;
  href?: string;
  /**
   * B-076: 1-2 headline metrics rendered as accent-tinted chips above the
   * prose. Additive display metadata only — every entry must be a verbatim
   * substring of oneLineImpact (no new claims; the prose sentence stays the
   * canonical copy per ericcaskey-com/content/001).
   */
  metrics?: string[];
}

export function TimelineItem({
  company,
  role,
  dates,
  oneLineImpact,
  href,
  metrics,
}: TimelineItemProps) {
  const content = (
    <div
      className="flex flex-col gap-2 py-5 border-b"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1">
        <div className="flex flex-col md:flex-row md:items-baseline md:gap-3">
          <span className="font-semibold">{company}</span>
          <span
            className="text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {role}
          </span>
        </div>
        <span
          className="text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {dates}
        </span>
      </div>
      {metrics && metrics.length > 0 && (
        // flex-wrap so chips stack instead of overflowing at 375/320px.
        <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
          {metrics.map((m) => (
            <li
              key={m}
              className="px-2.5 py-1 text-xs font-medium tabular-nums"
              style={{
                // Chip text uses text-primary, not accent: accent on
                // accent-tint over the light bg computes to ~3.9:1 (<4.5);
                // text-primary on the tint is ~14:1 light / ~12:1 dark.
                background: 'var(--color-accent-tint)',
                color: 'var(--color-text-primary)',
                borderRadius: 'var(--radius-pill)',
              }}
            >
              {m}
            </li>
          ))}
        </ul>
      )}
      <p className="leading-relaxed text-sm md:text-base">{oneLineImpact}</p>
      {href && (
        <span
          className="inline-flex items-center gap-1.5 text-sm font-medium"
          style={{ color: 'var(--color-accent)' }}
        >
          Case study on Caskey Engineering →
          <ExternalLinkIcon className="shrink-0" />
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <CrossSiteLink
        href={href}
        rel="noopener"
        className="link-plain block transition-colors hover:[&_.font-semibold]:text-[color:var(--color-accent)]"
      >
        {content}
        <span className="sr-only">(opens Caskey Engineering)</span>
      </CrossSiteLink>
    );
  }

  return content;
}
