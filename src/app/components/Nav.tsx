'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  applyTheme,
  resolveEffectiveTheme,
  setTheme,
  type SiteThemeMode,
} from './theme';

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

export function Nav() {
  const [mode, setMode] = useState<SiteThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMode(resolveEffectiveTheme());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) applyTheme(mode);
  }, [mode, mounted]);

  const toggle = () => {
    const next: SiteThemeMode = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    setTheme(next);
  };

  return (
    <header
      className="sticky top-0 z-10 border-b"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-bg) 88%, transparent)',
        borderColor: 'var(--color-border)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        height: 56,
      }}
    >
      <div className="mx-auto w-full max-w-3xl px-6 flex items-center justify-between h-full">
        <Link
          href="/"
          className="font-semibold tracking-tight"
          style={{ fontSize: '1.0625rem', color: 'var(--color-text-primary)' }}
          aria-label="Eric Caskey — home"
        >
          Eric <span style={{ color: 'var(--color-accent)' }}>Caskey</span>
        </Link>
        <div className="flex items-center gap-4">
          <nav aria-label="Primary">
            <ul className="flex items-center gap-5 text-sm font-medium">
              <li>
                <Link href="/about" className="inline-flex items-center min-h-11">About</Link>
              </li>
              <li>
                <Link href="/work" className="inline-flex items-center min-h-11">Work</Link>
              </li>
              <li>
                <Link href="/writing" className="inline-flex items-center min-h-11">Writing</Link>
              </li>
              <li>
                <Link href="/contact" className="inline-flex items-center min-h-11">Contact</Link>
              </li>
            </ul>
          </nav>
          <button
            type="button"
            onClick={toggle}
            aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex items-center justify-center border"
            style={{
              minWidth: 44,
              minHeight: 44,
              borderRadius: 'var(--radius-md)',
              borderColor: 'var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-secondary)',
              transition: 'color var(--duration-base) var(--ease-standard), border-color var(--duration-base) var(--ease-standard), background-color var(--duration-base) var(--ease-standard)',
            }}
          >
            {mounted ? (mode === 'dark' ? <SunIcon /> : <MoonIcon />) : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
