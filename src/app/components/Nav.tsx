'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type MouseEvent as ReactMouseEvent } from 'react';
import {
  applyTheme,
  resolveEffectiveTheme,
  setTheme,
  type SiteThemeMode,
} from '../lib/theme';

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/work', label: 'Work' },
  { href: '/writing', label: 'Writing' },
  { href: '/contact', label: 'Contact' },
] as const;

export function Nav() {
  const pathname = usePathname();
  const [mode, setMode] = useState<SiteThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMode(resolveEffectiveTheme());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) applyTheme(mode);
  }, [mode, mounted]);

  const toggle = (e?: ReactMouseEvent<HTMLButtonElement>) => {
    const next: SiteThemeMode = mode === 'dark' ? 'light' : 'dark';
    // setTheme() applies data-theme synchronously, so the view-transition
    // callback captures the new theme without flushSync.
    const commit = () => {
      setMode(next);
      setTheme(next);
    };

    // Circular theme reveal (family design spec v2.1 §motion): bloom the new
    // theme out of a circle centered on the toggle. Bail to an instant swap
    // where the View Transitions API is unavailable or reduced motion is set
    // (the global `*` 0.01ms guard cannot reach ::view-transition-* pseudos).
    const startViewTransition = (
      document as Document & {
        startViewTransition?: (cb: () => void) => unknown;
      }
    ).startViewTransition;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (typeof startViewTransition !== 'function' || reduced) {
      commit();
      return;
    }

    const rect = e?.currentTarget.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth;
    const y = rect ? rect.top + rect.height / 2 : 0;
    const r = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    const root = document.documentElement;
    root.style.setProperty('--vt-x', `${x}px`);
    root.style.setProperty('--vt-y', `${y}px`);
    root.style.setProperty('--vt-r', `${r}px`);

    startViewTransition.call(document, commit);
  };

  return (
    <header
      className="sticky top-0 z-10 border-b border-border"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-bg) 88%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        height: 'var(--nav-height)',
      }}
    >
      <div className="mx-auto w-full max-w-3xl px-6 flex items-center justify-between h-full">
        <Link
          href="/"
          className="inline-flex items-center min-h-11 font-semibold tracking-tight text-text"
          style={{ fontSize: '1.0625rem' }}
          aria-label="Eric Caskey, home"
        >
          {/* Below md the full wordmark + links + toggle overflow a 360px
              viewport, so collapse to a monogram. aria-label keeps the
              accessible name as the full wordmark. */}
          <span className="md:hidden" aria-hidden="true">
            E<span className="text-accent">C</span>
          </span>
          <span className="hidden md:inline">
            Eric <span className="text-accent">Caskey</span>
          </span>
        </Link>
        <div className="flex items-center gap-3 md:gap-4">
          <nav aria-label="Primary">
            <ul className="flex items-center gap-3 md:gap-5 text-[0.8125rem] md:text-sm font-medium">
              {navLinks.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <li key={href}>
                    {/* Active treatment is color + underline only — both are
                        zero-width, so the 320px header (B-073: zero slack)
                        never reflows between states. No weight change, no
                        padding/letter-spacing change. */}
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={`inline-flex items-center min-h-11${
                        active
                          ? ' text-accent underline decoration-2 underline-offset-[6px]'
                          : ''
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <button
            type="button"
            onClick={toggle}
            aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="theme-toggle"
          >
            {mounted ? (mode === 'dark' ? <SunIcon /> : <MoonIcon />) : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
