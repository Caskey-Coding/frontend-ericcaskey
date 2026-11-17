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

// Open-source-first copy refresh (caskeycoding-specs content-strategy 031,
// acceptance criterion 1). Proves source-file content in the governed files
// only, not rendering and not other files.
const GOVERNED_FILES = [
  'src/app/page.tsx',
  'src/app/layout.tsx',
  'src/app/lib/work.ts',
  'src/app/about/page.tsx',
  'public/llms.txt',
  'public/llms-full.txt',
  'src/app/lib/og-card.tsx',
  'src/app/lib/og.ts',
];

// Criterion 1a: string-literal rows, verbatim, in their named source files.
const OPEN_SOURCE_FIRST_ROWS = [
  ['src/app/layout.tsx', 'E1', 'Eric Caskey: AI Reliability & Open-Source Engineering'],
  ['src/app/layout.tsx', 'E2', 'Eric Caskey builds open-source guardrails, evaluation gates, and spec-driven agent workflows for AI-assisted software delivery.'],
  ['src/app/page.tsx', 'E3', '<dd>AI Reliability Engineer</dd>'],
  ['src/app/page.tsx', 'E4', '<dd>Senior Software Engineer at Amazon</dd>'],
  ['src/app/page.tsx', 'E5', '<dd>Open-source guardrails, evals, and agent workflows</dd>'],
  ['src/app/page.tsx', 'claim (already live)', 'Safe by default. Validated before it ships.'],
  ['src/app/page.tsx', 'E18', 'I am an AI reliability engineer and open-source builder. I build guardrails, evaluation gates, and spec-driven agent workflows for AI-assisted software delivery, and I write about them at caskeycoding.com. I am a Senior Software Engineer at Amazon. My open-source projects are personal work, separate from my role at Amazon.'],
  ['src/app/page.tsx', 'E19', 'I built Ballast, an open-source RAG system with a guardrails gateway and an evaluation gate, and Loop Harness, a backlog schema and loop protocol for controlled agent work. I also built SpecSelf Starter, a local-first Markdown template for principles, goals, and reviews, and SpecSelf Local, a read-only MCP server for selected Markdown. The wider portfolio includes a C++ options-pricing engine tuned from 15 million to 215 million prices per second.'],
  ['public/llms.txt', 'E21', 'Ballast (shipped, public versioned release; https://caskeycoding.com/case-studies/ballast), Loop Harness (shipped, public versioned release; https://github.com/CaskeyCoding/loop-harness), SpecSelf (active, evolving spec; https://specself.ai)'],
  ['src/app/lib/og-card.tsx', 'E22', '<span>Open-source guardrails, evals, and agent workflows</span>'],
  ['src/app/lib/og.ts', 'E24', "'Eric Caskey: open-source guardrails, evals, and agent workflows. Safe by default. Validated before it ships.'"],
];

// Criterion 1b: patterns that may not appear in any governed file. The em
// dash is written as an escape so this file carries none.
const FORBIDDEN_PATTERNS = [
  /\u2014/,
  /\bthings?\b/i,
  /\bprincipal\b/i,
  /\bmillions\b/i,
  /actions(\/| per )day/i,
  /founder/i,
  /\bfees?\b/i,
  /\bengagements?\b/i,
  /\bclients?\b/i,
  /independent practice|my practice/i,
];
// Spec 031 requirement 2 (and 030) permits exactly this sentence, which the
// llms-full.txt contact mirror carries. It is removed before matching in that
// file only; in every other governed file it is flagged like any other match.
const PERMITTED_SENTENCE = 'I am not taking client work.';
const PERMITTED_SENTENCE_FILE = 'public/llms-full.txt';

function readGoverned(file) {
  return readFileSync(join(root, file), 'utf8');
}

function forbiddenHits(file, text) {
  const hits = [];
  text.split('\n').forEach((line, index) => {
    const checked = file === PERMITTED_SENTENCE_FILE ? line.replaceAll(PERMITTED_SENTENCE, '') : line;
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(checked)) hits.push(`${file}:${index + 1}: ${pattern} in "${line.trim().slice(0, 120)}"`);
    }
  });
  return hits;
}

// Criterion 1c: number-context rules, one line at a time.
function numberHits(file, text) {
  const hits = [];
  text.split('\n').forEach((line, index) => {
    const where = `${file}:${index + 1}`;
    if (/3 million|3,000,000/.test(line) && !/monitor/i.test(line)) hits.push(`${where}: 3 million without monitor`);
    if (/500,000/.test(line) && /per day|a day|daily|\/day/i.test(line)) hits.push(`${where}: 500,000 stated per day`);
    if (/500,000/.test(line) && /safety checks/i.test(line) && !/cumulative/i.test(line)) hits.push(`${where}: 500,000 safety checks without cumulative`);
  });
  return hits;
}

// Criterion 1a, per personalProjects record: each field is checked inside its
// own record, so a value shared by two records cannot satisfy the other.
const PROJECT_RECORDS = {
  Ballast: {
    'Ballast kind (already live)': "kind: 'Open source'",
    'E11 context': "context: 'Personal project · Open source'",
    'E12 primary href': "href: 'https://caskeycoding.com/case-studies/ballast',",
    'E12 primary label': "cta: 'Read the Ballast case study',",
    'E12 secondary': "secondary: { cta: 'Inspect the source', href: 'https://github.com/CaskeyCoding/ballast' }",
  },
  'Loop Harness': {
    'E15 kind': "kind: 'Open source'",
    'E15 context': "context: 'Personal project · Open source'",
    'E15 description': "'A versioned backlog schema and loop protocol for agent work. The agent takes one item per iteration, verifies before merge, and never starts an item marked for a human.'",
    'E15 action href': "href: 'https://github.com/CaskeyCoding/loop-harness',",
    'E15 action label': "cta: 'Inspect Loop Harness on GitHub',",
    'E15 status': "status: 'shipped',",
    'E15 statusMeaning': "statusMeaning: 'Public versioned release',",
  },
  SpecSelf: {
    'E13 kind': "kind: 'Open source'",
    'E13 context': "context: 'Personal project · Open source'",
    'E14 primary href': "href: 'https://specself.ai',",
    'E14 primary label': "cta: 'Explore SpecSelf',",
    'E14 secondary': "secondary: { cta: 'Inspect SpecSelf Starter', href: 'https://github.com/CaskeyCoding/specself-starter' }",
  },
};

function projectRecord(work, name) {
  const start = work.indexOf(`    name: '${name}',`);
  if (start < 0) return '';
  // A record ends at the next top-level closing brace of the array entry.
  const rest = work.slice(start);
  const end = rest.search(/\r?\n {2}\},/);
  return end < 0 ? rest : rest.slice(0, end);
}

test('open-source-first: each string-literal row renders verbatim in its source file (1a)', () => {
  const missing = OPEN_SOURCE_FIRST_ROWS
    .filter(([file, , text]) => !readGoverned(file).includes(text))
    .map(([file, row, text]) => `${row} missing from ${file}: ${text}`);
  const work = readGoverned('src/app/lib/work.ts');
  for (const [name, fields] of Object.entries(PROJECT_RECORDS)) {
    const record = projectRecord(work, name);
    if (!record) missing.push(`${name} record missing from src/app/lib/work.ts`);
    for (const [row, text] of Object.entries(fields)) {
      if (record && !record.includes(text)) missing.push(`${row} missing from the ${name} record in src/app/lib/work.ts: ${text}`);
    }
  }
  assert.deepEqual(missing, [], `Open-source-first rows missing:\n${missing.join('\n')}`);
  const order = ['Ballast', 'Loop Harness', 'SpecSelf'].map(name => work.indexOf(`name: '${name}'`));
  assert.ok(order.every((at, i) => at > 0 && (i === 0 || at > order[i - 1])), `personalProjects order must be Ballast, Loop Harness, SpecSelf (${order})`);
});

test('open-source-first: no forbidden pattern in the governed files (1b)', () => {
  const hits = GOVERNED_FILES.flatMap(file => forbiddenHits(file, readGoverned(file)));
  assert.deepEqual(hits, [], `Forbidden pattern found:\n${hits.join('\n')}`);
});

test('open-source-first: number context rules hold in the governed files (1c)', () => {
  const hits = GOVERNED_FILES.flatMap(file => numberHits(file, readGoverned(file)));
  assert.deepEqual(hits, [], `Number context violation:\n${hits.join('\n')}`);
});

test('open-source-first: the 1b and 1c rules catch their fixtures and pass the permitted lines', () => {
  for (const sample of ['Principal Engineer', 'a \u2014 b', 'millions of workflows', 'other things', 'a founder', 'no fees', 'client work', 'my practice', '100 actions per day']) {
    assert.ok(forbiddenHits('sample', sample).length > 0, sample);
  }
  const contactLine = `Send a note. ${PERMITTED_SENTENCE} Recruiting`;
  assert.deepEqual(forbiddenHits(PERMITTED_SENTENCE_FILE, contactLine), []);
  for (const other of GOVERNED_FILES.filter(file => file !== PERMITTED_SENTENCE_FILE)) {
    assert.ok(forbiddenHits(other, contactLine).length > 0, `the permitted sentence is flagged in ${other}`);
  }
  for (const sample of ['3 million safety checks', '500,000 safety checks', '500,000 cumulative safety checks a day']) {
    assert.ok(numberHits('sample', sample).length > 0, sample);
  }
  for (const allowed of ['3 million monitors', '3,000,000 monitors standardized', '500,000 cumulative safety checks']) {
    assert.deepEqual(numberHits('sample', allowed), [], allowed);
  }
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
