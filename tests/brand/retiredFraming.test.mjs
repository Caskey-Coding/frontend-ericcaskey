// Guard: the site describes personal open-source projects and writing.
// No public surface may describe a company, legal entity, or paid offer.
// Scans every text file under src/, content/, and public/ and fails on a
// case-insensitive match of the retired terms, listing each offending line.
// Matching runs over whole files with \s+ between words, so a term that JSX
// wraps across a line break is still caught.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const scanDirs = ['src', 'content', 'public'];
// Text extensions; csv is excluded per the governing spec.
const textExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.md', '.mdx', '.txt', '.xml', '.svg', '.yaml', '.yml', '.css', '.html']);

const RETIRED_SOURCE = String.raw`Caskey\s+Engineering|Caskey\s+Coding,?\s+LLC|legalName|independent\s+(?:engineering\s+)?practice|workflow[-\s]+assessment|implementation\s+pilot`;
const retiredPattern = () => new RegExp(RETIRED_SOURCE, 'gi');

// The 2015 to 2018 company stays in the career history as dated fact. These
// are the only permitted occurrences: (file, exact string, maximum count).
// Any other match, a different spelling, or a count above the maximum fails.
const ALLOWLIST = [
  { file: 'src/app/lib/work.ts', text: 'Caskey Coding, LLC', max: 1 },
  { file: 'src/app/work/page.tsx', text: 'Caskey Coding LLC', max: 2 },
  { file: 'public/llms-full.txt', text: 'Caskey Coding, LLC', max: 1 },
];

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && textExtensions.has(extname(entry.name).toLowerCase())) yield full;
  }
}

function matchesIn(text) {
  const found = [];
  for (const match of text.matchAll(retiredPattern())) {
    const line = text.slice(0, match.index).split('\n').length;
    found.push({ line, term: match[0].replace(/\s+/g, ' '), raw: match[0] });
  }
  return found;
}

function findRetiredFraming(baseDir = root, allowlist = ALLOWLIST) {
  const hits = [];
  for (const sub of scanDirs) {
    for (const file of walk(join(baseDir, sub))) {
      const name = relative(baseDir, file).replaceAll('\\', '/');
      const seen = new Map();
      for (const { line, term, raw } of matchesIn(readFileSync(file, 'utf8'))) {
        const entry = allowlist.find(e => e.file === name && e.text === raw);
        if (!entry) {
          hits.push(`${name}:${line}: ${term}`);
          continue;
        }
        const count = (seen.get(entry) ?? 0) + 1;
        seen.set(entry, count);
        if (count > entry.max) hits.push(`${name}:${line}: ${term} (allowlist max ${entry.max} exceeded)`);
      }
    }
  }
  return hits;
}

test('every allowlisted past-business occurrence is present at its maximum count', () => {
  for (const { file, text, max } of ALLOWLIST) {
    const count = readFileSync(join(root, file), 'utf8').split(text).length - 1;
    assert.equal(count, max, `${file}: expected ${max} of "${text}", found ${count}`);
  }
});

test('no retired practice or entity framing in src/, content/, or public/', () => {
  const hits = findRetiredFraming();
  assert.deepEqual(hits, [], `Retired framing found:\n${hits.join('\n')}`);
});

// The sister site no longer publishes an Organization node, so nothing may
// reference it by id.
const ORGANIZATION_REF = 'caskeycoding.com/#organization';

function findOrganizationRefs(baseDir = root) {
  const hits = [];
  for (const sub of ['src', 'public']) {
    for (const file of walk(join(baseDir, sub))) {
      const name = relative(baseDir, file).replaceAll('\\', '/');
      readFileSync(file, 'utf8').split('\n').forEach((text, index) => {
        if (text.includes(ORGANIZATION_REF)) hits.push(`${name}:${index + 1}: ${ORGANIZATION_REF}`);
      });
    }
  }
  return hits;
}

test('no reference to the removed caskeycoding.com Organization node in src/ or public/', () => {
  const hits = findOrganizationRefs();
  assert.deepEqual(hits, [], `Organization reference found:\n${hits.join('\n')}`);
});

test('the pattern catches each retired term, including across a line break', () => {
  for (const sample of [
    'caskey engineering',
    'the full writeups live on Caskey\n          Engineering.',
    'Caskey Coding, LLC',
    'Caskey Coding LLC',
    '"legalName": "x"',
    'my independent practice',
    'independent engineering\n practice',
    'https://caskeycoding.com/#workflow-assessment',
    'a workflow assessment',
    'an implementation pilot',
  ]) {
    assert.equal(matchesIn(sample).length, 1, sample);
  }
  for (const allowed of ['Caskey Coding', 'a daily practice', 'workflow orchestration']) {
    assert.equal(matchesIn(allowed).length, 0, allowed);
  }
});
