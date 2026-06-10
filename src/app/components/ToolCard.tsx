import { CrossSiteLink } from './CrossSiteLink';
import { ExternalLinkIcon } from './ExternalLinkIcon';

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
      // Border-led hover (v2.1 §2.1): hairline steps up to border-strong.
      className="link-plain flex flex-col gap-2 py-4 border-b border-border min-h-11 transition-colors hover:[&_.font-semibold]:text-[color:var(--color-accent)] hover:border-[color:var(--color-border-strong)]"
    >
      <span className="flex flex-col md:flex-row md:items-baseline md:gap-3">
        <span className="font-semibold">{name}</span>
        <span className="text-sm md:text-base text-muted">{tagline}</span>
      </span>
      {/* B-076: visible CTA — the whole row was a bare link with only a
          hover color change as the cue. */}
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
        Open tool →
        <ExternalLinkIcon className="shrink-0" />
      </span>
      <span className="sr-only">(opens Caskey Engineering)</span>
    </CrossSiteLink>
  );
}
