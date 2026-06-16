import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

// Staggered page-load reveal, same idiom as the home masthead (family design
// spec v2.1 §motion). Consumed by `.reveal` in globals.css.
const reveal = (ms: number): CSSProperties =>
  ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;

const destinations = [
  { href: '/', label: 'Home' },
  { href: '/work', label: 'Work' },
  { href: '/writing', label: 'Writing' },
  { href: '/contact', label: 'Contact' },
] as const;

export default function NotFound() {
  return (
    <article className="flex flex-col gap-8">
      {/* Locator rule — echoes the masthead's arrivals-board idiom (FDS-2):
          a hairline framed by eyebrow microlabels. */}
      <div
        className="reveal flex items-center justify-between gap-4 border-b border-border pb-3"
        style={reveal(0)}
      >
        <p className="eyebrow text-accent">Error 404</p>
        <p className="eyebrow">Page not found</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Tracking/leading come from the global h1 rule (v2.1 §2.4). */}
        <h1
          className="reveal font-semibold"
          style={{ ...reveal(60), fontSize: 'clamp(2rem, 5vw, 3rem)' }}
        >
          This page doesn’t exist
        </h1>
        <p
          className="reveal text-muted max-w-prose leading-relaxed"
          style={reveal(120)}
        >
          The link may be out of date, or the page may have moved. Pick back up
          below.
        </p>
      </div>

      {/* Destinations as a departures board: hairline-divided rows, label +
          arrow that nudges on hover. Whole row is a 44px tap target. */}
      <nav
        aria-label="Site sections"
        className="reveal flex flex-col border-t border-border"
        style={reveal(180)}
      >
        {destinations.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center justify-between min-h-11 py-3 border-b border-border font-medium transition-colors"
          >
            <span>{label}</span>
            <span
              aria-hidden="true"
              className="text-muted transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        ))}
      </nav>
    </article>
  );
}
