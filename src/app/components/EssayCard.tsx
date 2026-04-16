import { CrossSiteLink } from './CrossSiteLink';

interface EssayCardProps {
  title: string;
  url: string;
  publishedDate: string;
  editorNote: string;
}

export function EssayCard({
  title,
  url,
  publishedDate,
  editorNote,
}: EssayCardProps) {
  return (
    <article
      className="flex flex-col gap-2 py-5 border-b"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <h3 className="text-lg font-semibold leading-snug">
        <CrossSiteLink href={url} rel="noopener">
          {title}
        </CrossSiteLink>
      </h3>
      <p
        className="text-sm"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {publishedDate} · Caskey Engineering
      </p>
      <p className="leading-relaxed">{editorNote}</p>
    </article>
  );
}
