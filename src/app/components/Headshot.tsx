interface HeadshotProps {
  alt: string;
  eager?: boolean;
  className?: string;
  variant?: 'portrait' | 'avatar';
}

export function Headshot({ alt, eager = false, className, variant = 'portrait' }: HeadshotProps) {
  const avatar = variant === 'avatar';
  const sizes = avatar ? '80px' : '(max-width: 640px) 80vw, 360px';
  const sources = (format: string) => avatar
    ? `/eric-caskey-avatar-160.${format} 160w, /eric-caskey-avatar-320.${format} 320w`
    : `/eric-caskey-600.${format} 600w, /eric-caskey-1200.${format} 1200w`;
  return (
    <picture className={className}>
      {/* UX-EC-4: AVIF first (smallest), then WebP, then the JPEG <img>
          fallback. Browsers pick the first <source> type they support. */}
      <source
        type="image/avif"
        srcSet={sources('avif')}
        sizes={sizes}
      />
      <source
        type="image/webp"
        srcSet={sources('webp')}
        sizes={sizes}
      />
      <img
        src={avatar ? '/eric-caskey-avatar-160.jpg' : '/eric-caskey-1200.jpg'}
        srcSet={avatar ? sources('jpg') : undefined}
        sizes={avatar ? sizes : undefined}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager && !avatar ? 'high' : 'auto'}
        width={avatar ? 80 : 1200}
        height={avatar ? 80 : 1600}
        style={{
          display: 'block',
          width: avatar ? '80px' : '100%',
          height: avatar ? '80px' : 'auto',
          aspectRatio: avatar ? '1' : '3 / 4',
          objectFit: 'cover',
          borderRadius: '0.5rem',
          background: 'var(--color-surface)',
        }}
      />
    </picture>
  );
}
