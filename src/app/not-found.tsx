import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <article className="flex flex-col gap-6">
      <p className="text-sm font-medium tracking-wide text-[var(--color-accent)]">
        404
      </p>
      <h1
        className="font-semibold tracking-tight leading-[1.05]"
        style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}
      >
        This page doesn’t exist
      </h1>
      <p className="text-[var(--color-text-secondary)] max-w-prose">
        The link may be out of date, or the page may have moved. Here are a few
        places to pick back up:
      </p>
      <ul className="flex flex-col gap-2">
        <li>
          <Link href="/" className="font-medium">
            Home
          </Link>
        </li>
        <li>
          <Link href="/work" className="font-medium">
            Work
          </Link>
        </li>
        <li>
          <Link href="/writing" className="font-medium">
            Writing
          </Link>
        </li>
        <li>
          <Link href="/contact" className="font-medium">
            Contact
          </Link>
        </li>
      </ul>
    </article>
  );
}
