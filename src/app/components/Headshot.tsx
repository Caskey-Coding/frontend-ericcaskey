interface HeadshotProps {
  alt: string;
  eager?: boolean;
  className?: string;
}

export function Headshot({ alt, eager = false, className }: HeadshotProps) {
  return (
    <picture className={className}>
      <source
        type="image/webp"
        srcSet="/eric-caskey-600.webp 600w, /eric-caskey-1200.webp 1200w"
        sizes="(max-width: 640px) 80vw, 360px"
      />
      <img
        src="/eric-caskey-1200.jpg"
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        width={1200}
        height={1600}
        style={{
          width: '100%',
          height: 'auto',
          aspectRatio: '3 / 4',
          objectFit: 'cover',
          borderRadius: '0.5rem',
          background: 'var(--color-surface)',
        }}
      />
    </picture>
  );
}
