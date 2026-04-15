import Link from 'next/link';

export function Nav() {
  return (
    <header
      className="sticky top-0 z-10 border-b"
      style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
    >
      <div className="mx-auto w-full max-w-3xl px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-semibold tracking-tight text-lg"
          aria-label="Eric Caskey — home"
        >
          Eric Caskey
        </Link>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-6 text-sm">
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/work">Work</Link>
            </li>
            <li>
              <Link href="/writing">Writing</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
