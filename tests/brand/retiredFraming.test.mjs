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
    found.push({ line, term: match[0].replace(/\s+/g, ' ') });
  }
  return found;
}

function findRetiredFraming(baseDir = root) {
  const hits = [];
  for (const sub of scanDirs) {
    for (const file of walk(join(baseDir, sub))) {
      const name = relative(baseDir, file).replaceAll('\\', '/');
      for (const { line, term } of matchesIn(readFileSync(file, 'utf8'))) hits.push(`${name}:${line}: ${term}`);
    }
  }
  return hits;
}

test('no retired practice or entity framing in src/, content/, or public/', () => {
  const hits = findRetiredFraming();
  assert.deepEqual(hits, [], `Retired framing found:\n${hits.join('\n')}`);
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
