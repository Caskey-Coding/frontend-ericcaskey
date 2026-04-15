interface TimelineItemProps {
  company: string;
  role: string;
  dates: string;
  oneLineImpact: string;
  href?: string;
}

export function TimelineItem({
  company,
  role,
  dates,
  oneLineImpact,
  href,
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
      <p className="leading-relaxed text-sm md:text-base">{oneLineImpact}</p>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        rel="noopener"
        className="block hover:opacity-90 transition-opacity"
      >
        {content}
      </a>
    );
  }

  return content;
}
