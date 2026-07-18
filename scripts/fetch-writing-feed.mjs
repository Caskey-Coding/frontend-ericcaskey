/**
 * EC-WRITING-1: build the curated /writing shelf artifact.
 *
 * Runs as `prebuild` (see package.json), i.e. before `next build`. The shelf's
 * MEMBERSHIP and editorial NOTE are curated locally in
 * `content/writing-shelf.yaml`; the TITLE, DATE, and URL are joined in from
 * caskeycoding.com's published `blog-index.json` feed by slug, so the shelf can
 * never drift stale against the canonical blog.
 *
 * Output: `src/data/writing-shelf.json` (`{ essays: [...] }`, imported by
 * src/app/writing/page.tsx). No timestamp is written, so a rebuild with an
 * unchanged feed produces a byte-identical artifact (no git churn).
 *
 * Resilience (Operational Lesson #1, never collapse a failure to zero):
 *   - Fetch failure / non-200 / bad JSON  -> LOUD console.warn, then fall back
 *     to the committed snapshot `content/writing-shelf.snapshot.json`. Never a
 *     silent empty shelf.
 *   - A yaml slug the ACTIVE source (feed on success, snapshot on fallback)
 *     does not know -> HARD FAIL the build, naming the slug(s).
 *
 * Zero runtime deps: node builtin `fetch` + a tiny parser for the controlled
 * yaml subset (each note is a double-quoted JSON string). `--write-snapshot`
 * regenerates the committed snapshot from a live fetch.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const YAML_FILE = path.join(ROOT, 'content', 'writing-shelf.yaml');
const SNAPSHOT_FILE = path.join(ROOT, 'content', 'writing-shelf.snapshot.json');
const OUT_DIR = path.join(ROOT, 'src', 'data');
const OUT_FILE = path.join(OUT_DIR, 'writing-shelf.json');

const FEED_URL =
  process.env.WRITING_FEED_URL || 'https://caskeycoding.com/blog-index.json';
const BLOG_BASE = 'https://caskeycoding.com/blog';
const WRITE_SNAPSHOT = process.argv.includes('--write-snapshot');

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** ISO `YYYY-MM-DD` -> `Month D, YYYY` (no locale, no timezone shift). */
function formatDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
  if (!m) throw new Error(`unparseable date "${iso}"`);
  const [, y, mo, d] = m;
  const month = MONTHS[Number(mo) - 1];
  if (!month) throw new Error(`bad month in date "${iso}"`);
  return `${month} ${Number(d)}, ${y}`;
}

/**
 * Parse the curated shelf. Controlled subset of YAML: a top-level `essays:`
 * sequence, each item `- slug: <bare-token>` then `note: <double-quoted JSON
 * string>`. Fails loudly on anything it does not understand.
 */
function parseShelfYaml(text) {
  const entries = [];
  let current = null;
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.replace(/\s+$/, '');
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (line.trim() === 'essays:') continue;

    const slugMatch = /^\s*-\s*slug:\s*(\S+)\s*$/.exec(line);
    if (slugMatch) {
      if (current) entries.push(current);
      current = { slug: slugMatch[1], note: null };
      continue;
    }
    const noteMatch = /^\s*note:\s*(".*")\s*$/.exec(line);
    if (noteMatch) {
      if (!current) {
        throw new Error(`writing-shelf.yaml:${i + 1}: note before any slug`);
      }
      try {
        current.note = JSON.parse(noteMatch[1]);
      } catch {
        throw new Error(
          `writing-shelf.yaml:${i + 1}: note is not a valid double-quoted string`,
        );
      }
      continue;
    }
    throw new Error(`writing-shelf.yaml:${i + 1}: unrecognized line: ${line}`);
  }
  if (current) entries.push(current);

  if (entries.length === 0) {
    throw new Error('writing-shelf.yaml: no essays parsed');
  }
  for (const e of entries) {
    if (!e.slug || e.note == null) {
      throw new Error(
        `writing-shelf.yaml: entry "${e.slug}" is missing slug or note`,
      );
    }
  }
  return entries;
}

/** Reduce a source object ({ posts: [{slug,title,date}] }) to a slug->{title,date} map. */
function indexPosts(sourceObj, label) {
  const posts = sourceObj && Array.isArray(sourceObj.posts) ? sourceObj.posts : null;
  if (!posts) throw new Error(`${label} source has no posts array`);
  const map = new Map();
  for (const p of posts) {
    if (p && p.slug) map.set(String(p.slug), { title: String(p.title), date: String(p.date) });
  }
  return map;
}

/** Fetch the live feed; returns the parsed JSON or throws. */
async function fetchFeed(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`feed returned HTTP ${res.status}`);
  return res.json();
}

async function main() {
  const entries = parseShelfYaml(fs.readFileSync(YAML_FILE, 'utf8'));

  let sourceObj;
  let sourceLabel;
  try {
    sourceObj = await fetchFeed(FEED_URL);
    sourceLabel = 'feed';
    console.log(`writing-shelf: fetched live feed ${FEED_URL}`);
  } catch (err) {
    // Operational Lesson #1: loud, never a silent empty shelf.
    console.warn(
      `writing-shelf: WARNING, live feed fetch failed (${err.message}); ` +
        `falling back to committed snapshot ${path.relative(ROOT, SNAPSHOT_FILE)}`,
    );
    if (!fs.existsSync(SNAPSHOT_FILE)) {
      throw new Error(
        'feed unreachable AND no committed snapshot; refusing to emit an empty shelf',
      );
    }
    sourceObj = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));
    sourceLabel = 'snapshot';
  }

  const bySlug = indexPosts(sourceObj, sourceLabel);

  // Hard-fail on any curated slug the ACTIVE source does not know.
  const unknown = entries.filter((e) => !bySlug.has(e.slug)).map((e) => e.slug);
  if (unknown.length) {
    throw new Error(
      `${unknown.length} slug(s) in writing-shelf.yaml not found in ${sourceLabel}: ` +
        unknown.join(', '),
    );
  }

  const essays = entries.map((e) => {
    const src = bySlug.get(e.slug);
    return {
      title: src.title,
      url: `${BLOG_BASE}/${e.slug}`,
      publishedDate: formatDate(src.date),
      editorNote: e.note,
    };
  });

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify({ essays }, null, 2) + '\n', 'utf8');
  console.log(
    `writing-shelf: wrote ${essays.length} essays to ${path.relative(ROOT, OUT_FILE)} (source: ${sourceLabel})`,
  );

  if (WRITE_SNAPSHOT) {
    if (sourceLabel !== 'feed') {
      throw new Error('--write-snapshot requires a live feed (fetch failed)');
    }
    const posts = entries.map((e) => {
      const src = bySlug.get(e.slug);
      return { slug: e.slug, title: src.title, date: src.date };
    });
    const snapshot = {
      _comment:
        'EC-WRITING-1 committed fallback for scripts/fetch-writing-feed.mjs. ' +
        'Regenerate with: node scripts/fetch-writing-feed.mjs --write-snapshot',
      posts,
    };
    fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
    console.log(`writing-shelf: wrote snapshot to ${path.relative(ROOT, SNAPSHOT_FILE)}`);
  }
}

main().catch((err) => {
  console.error(`writing-shelf: ${err.message}`);
  process.exit(1);
});
