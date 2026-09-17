import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const pages = {
  home: 'src/app/page.tsx',
  about: 'src/app/about/page.tsx',
  work: 'src/app/work/page.tsx',
  writing: 'src/app/writing/page.tsx',
  contact: 'src/app/contact/page.tsx',
};

try {
  const fallback = JSON.parse(readFileSync(new URL('../content/last-modified.fallback.json', import.meta.url), 'utf8'));
  const dates = {};
  for (const [key, page] of Object.entries(pages)) {
    try {
      const date = execFileSync('git', ['log', '-1', '--format=%cs', '--', page], {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 10000,
        windowsHide: true,
      }).trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('No valid date in git history');
      dates[key] = date;
    } catch {
      dates[key] = fallback[key];
      console.warn(`[last-modified] ${key}: git history unavailable; using fallback ${fallback[key]}`);
    }
  }
  const directory = new URL('../src/generated/', import.meta.url);
  mkdirSync(directory, { recursive: true });
  writeFileSync(new URL('last-modified.json', directory), `${JSON.stringify(dates, null, 2)}\n`);
} catch (error) {
  console.warn(`[last-modified] Unable to generate dates: ${error.message}`);
}
