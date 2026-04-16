import { CrossSiteLink } from './CrossSiteLink';

interface ToolCardProps {
  name: string;
  tagline: string;
  url: string;
}

export function ToolCard({ name, tagline, url }: ToolCardProps) {
  return (
    <CrossSiteLink
      href={url}
      rel="noopener"
      className="flex flex-col md:flex-row md:items-baseline md:gap-3 py-4 border-b min-h-11 items-start transition-colors hover:[&>.font-semibold]:text-[color:var(--color-accent)]"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <span className="font-semibold">{name}</span>
      <span
        className="text-sm md:text-base"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {tagline}
      </span>
    </CrossSiteLink>
  );
}
