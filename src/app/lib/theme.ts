'use client';

import { THEME_COLORS } from './theme-colors';

export type SiteThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'eric-caskey-theme';
const LEGACY_STORAGE_KEYS = ['theme', 'caskey-site-theme'];

export function resolveStoredTheme(): SiteThemeMode | null {
  if (typeof window === 'undefined') return null;
  try {
    const s = localStorage.getItem(THEME_STORAGE_KEY);
    if (s === 'dark' || s === 'light') return s;
    for (const legacy of LEGACY_STORAGE_KEYS) {
      const v = localStorage.getItem(legacy);
      if (v === 'dark' || v === 'light') {
        localStorage.setItem(THEME_STORAGE_KEY, v);
        localStorage.removeItem(legacy);
        return v;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function resolveEffectiveTheme(): SiteThemeMode {
  const stored = resolveStoredTheme();
  if (stored) return stored;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(mode: SiteThemeMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', mode);
  // Both media-qualified tags take the explicit choice. With JS disabled,
  // their initial values continue to follow the operating-system preference.
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach(meta => {
    meta.content = THEME_COLORS[mode];
  });
}

export function setTheme(mode: SiteThemeMode) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
  applyTheme(mode);
}

/** Append ?theme={current} to outbound cross-site links so the receiver can adopt mode before first paint. */
export function withThemeQuery(url: string): string {
  if (typeof window === 'undefined') return url;
  try {
    const mode = resolveEffectiveTheme();
    const u = new URL(url, window.location.href);
    u.searchParams.set('theme', mode);
    return u.toString();
  } catch {
    return url;
  }
}
