import { CrossSiteLink } from './CrossSiteLink';

interface TimelineItemProps {
  company: string;
  role: string;
  dates: string;
  oneLineImpact: string;
  href?: string;
  /** Hides the connecting line below the dot on the final entry. */
  isLast?: boolean;
}

export function TimelineItem({
  company,
  role,
  dates,
  oneLineImpact,
  href,
  isLast = false,
}: TimelineItemProps) {
  const body = (
    <div className="grid gap-4" style={{ gridTemplateColumns: '14px 1fr' }}>
      <div className="flex flex-col items-center" aria-hidden="true">
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: 'var(--color-accent)',
            flexShrink: 0,
            marginTop: 6,
          }}
        />
        {!isLast && (
          <span
            style={{ width: 2, flex: 1, background: 'var(--color-border)', marginTop: 4 }}
          />
        )}
      </div>
      <div style={{ paddingBottom: isLast ? 0 : '1.75rem' }}>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: '0.04em',
            color: 'var(--color-text-faint)',
          }}
        >
          {dates}
        </p>
        <h3
          className="font-semibold"
          style={{ margin: '0.25rem 0 0.125rem', fontSize: 'var(--text-lg)' }}
        >
          {role} · <span style={{ color: 'var(--color-accent)' }}>{company}</span>
        </h3>
        <p className="leading-relaxed" style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
          {oneLineImpact}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <CrossSiteLink
        href={href}
        rel="noopener"
        className="block transition-colors hover:[&_h3]:text-[color:var(--color-accent)]"
      >
        {body}
      </CrossSiteLink>
    );
  }

  return body;
}
