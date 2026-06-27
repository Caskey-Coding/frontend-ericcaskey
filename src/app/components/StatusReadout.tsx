'use client';

import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Animated "Systems Readout" status panel. Renders the same .sr-status markup
 * as before, but each figure counts up from 0 when the panel enters view.
 *
 * Sourcing contract is unchanged: every figure string comes from the caller
 * (page.tsx `stats`, traceable to canonical /work copy, B-076). This component
 * only animates the digits — it must never alter the displayed final value.
 *
 * Robustness:
 * - SSR / no-JS / reduced-motion render the exact final figures, so the built
 *   HTML the voice + mirror scans read is byte-identical to the source strings.
 * - A useLayoutEffect resets to 0 before first paint so there is no final->0
 *   flash; the count-up runs once on intersection.
 * - The final value is announced to screen readers via aria-label; the
 *   churning digits are aria-hidden.
 */
type Stat = { tag: string; figure: string; label: string };

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const DURATION = 1300;

/** Split "3,000,000" -> {value: 3000000, suffix: ""}, "15 yrs" -> {15, " yrs"}. */
function parse(figure: string): { value: number; suffix: string } {
  const m = figure.match(/^([\d,]+)(.*)$/);
  if (!m) return { value: 0, suffix: figure };
  return { value: parseInt(m[1].replace(/,/g, ''), 10), suffix: m[2] };
}

export default function StatusReadout({ stats }: { stats: Stat[] }) {
  const parsed = stats.map((s) => parse(s.figure));
  const ref = useRef<HTMLDivElement>(null);
  // Init to final values so SSR / no-JS / reduced-motion show real numbers.
  const [current, setCurrent] = useState<number[]>(() => parsed.map((p) => p.value));

  useLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') return;

    setCurrent(parsed.map(() => 0)); // before paint — no final->0 flash
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / DURATION, 1);
      const e = easeOutCubic(t);
      setCurrent(parsed.map((p) => Math.round(p.value * e)));
      if (t < 1) raf = requestAnimationFrame(step);
    };

    // Trigger as soon as the panel is actually visible. A negative bottom
    // rootMargin would push the trigger line above the fold, so a panel that
    // sits low under the masthead could be on-screen yet still showing 0 until
    // the user scrolls — start on first visibility instead.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((en) => en.isIntersecting)) {
          io.disconnect();
          raf = requestAnimationFrame(step);
        }
      },
      { rootMargin: '0px' },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className="sr-status" aria-label="Scale in numbers">
      {stats.map((s, i) => (
        <div className="row" key={s.label}>
          <span className="lbl">{s.tag}</span>
          <span className="bar" aria-hidden="true" />
          <span className="val" aria-label={`${s.figure} ${s.label}`}>
            <span aria-hidden="true">
              {current[i].toLocaleString('en-US')}
              {parsed[i].suffix}
            </span>{' '}
            <small aria-hidden="true">{s.label}</small>
          </span>
        </div>
      ))}
    </div>
  );
}
