'use client';

import { useEffect, useRef, type AnchorHTMLAttributes } from 'react';
import { withThemeQuery } from './theme';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** Anchor for outbound cross-site links that appends ?theme={current} at click time. */
export function CrossSiteLink({ href, children, ...rest }: Props) {
  const ref = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => {
      el.href = withThemeQuery(href);
    };
    sync();
    el.addEventListener('mouseenter', sync);
    el.addEventListener('focus', sync);
    return () => {
      el.removeEventListener('mouseenter', sync);
      el.removeEventListener('focus', sync);
    };
  }, [href]);

  return (
    <a ref={ref} href={href} {...rest}>
      {children}
    </a>
  );
}
