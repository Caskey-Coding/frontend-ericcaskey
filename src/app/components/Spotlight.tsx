'use client';

import { useEffect } from 'react';

/**
 * Cursor spotlight. A single delegated pointer listener tracks the cursor over
 * any `.spotlight` element and writes its local --mx/--my, which a CSS
 * radial-gradient ::after overlay reads (see globals.css). The glow fades in/out
 * via CSS :hover, so JS only ever updates position.
 *
 * Renders nothing. No-ops on touch / coarse pointers — there is no cursor to
 * follow, and the CSS overlay is gated behind the same hover/fine-pointer query.
 */
export default function Spotlight() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let raf = 0;
    let pending: { el: HTMLElement; x: number; y: number } | null = null;

    const flush = () => {
      raf = 0;
      if (!pending) return;
      pending.el.style.setProperty('--mx', `${pending.x}px`);
      pending.el.style.setProperty('--my', `${pending.y}px`);
    };

    const onMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.('.spotlight') as
        | HTMLElement
        | null;
      if (!target) return;
      const r = target.getBoundingClientRect();
      pending = { el: target, x: e.clientX - r.left, y: e.clientY - r.top };
      if (!raf) raf = requestAnimationFrame(flush);
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      document.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
