interface ToolCardProps {
  name: string;
  tagline: string;
  url: string;
}

export function ToolCard({ name, tagline, url }: ToolCardProps) {
  return (
    <a
      href={url}
      rel="noopener"
      className="flex flex-col md:flex-row md:items-baseline md:gap-3 py-4 border-b hover:opacity-90 transition-opacity"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <span className="font-semibold">{name}</span>
      <span
        className="text-sm md:text-base"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {tagline}
      </span>
    </a>
  );
}
