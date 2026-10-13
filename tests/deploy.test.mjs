import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { deploy, validateExport, verifyLive, resolveAwsLaunch } from '../scripts/deploy.mjs';

const contactApi = 'https://api.example.test';
const writing = `<section id="selected-writing"><article><h3>Ballast</h3><a href="https://caskeycoding.com/blog/ballast-an-llm-that-says-i-dont-know">Read essay</a></article><article><h3>Workflow guardrails</h3><a href="https://caskeycoding.com/blog/designing-safety-guardrails-for-distributed-workflow-orchestration">Read essay</a></article></section>`;
const identity = `<header data-identity="spec"><h1>Eric Caskey</h1><img src="/eric-caskey-avatar-160.jpg" width="80" height="80" alt="Eric Caskey"></header>`;
const metrics = `<article data-employer="Amazon"><p>500,000 cumulative safety checks</p><p>The monitoring platform owns 3 million monitors and 2,750+ application stages.</p></article><article data-employer="Prudential Financial"><p>18,000 uses; 200,000+ administrative actions; 60,000 corporate users.</p></article>`;
const person = `<script type="application/ld+json">${JSON.stringify({ '@type': 'Person', '@id': 'https://ericcaskey.com/#person', image: 'https://ericcaskey.com/eric-caskey-1200.jpg' })}</script>`;
const home = `${identity}${metrics}${writing}${person}`;
const assets = '<script src="/_next/static/app.js"></script><link rel="stylesheet" href="/_next/static/app.css">';
const document = body => `<html><body>${body}${assets}</body></html>`;

function liveFixture(config) {
  return async url => {
    if (url.endsWith('.js')) return new Response(readFileSync(join(config.outDir, '_next/static/app.js')), { headers: { 'content-type': 'text/javascript' } });
    if (url.endsWith('.css')) return new Response('body{}', { headers: { 'content-type': 'text/css' } });
    const path = new URL(url).pathname;
    return new Response(readFileSync(join(config.outDir, path === '/' ? 'index.html' : `${path.slice(1)}.html`)), { headers: { 'content-type': 'text/html' } });
  };
}
function fixture(t) {
  const outDir = mkdtempSync(join(tmpdir(), 'personal-deploy-'));
  t.after(() => rmSync(outDir, { recursive: true, force: true }));
  mkdirSync(join(outDir, '_next/static'), { recursive: true });
  writeFileSync(join(outDir, '_next/static/app.js'), `const api = '${contactApi}';`);
  writeFileSync(join(outDir, '_next/static/app.css'), 'body {color:black}');
  for (const [file, title] of [['index', 'Eric Caskey'], ['about', 'About'], ['work', 'Work'], ['writing', 'Selected writing'], ['contact', 'Contact']]) {
    writeFileSync(join(outDir, `${file}.html`), document(file === 'index' ? home : `<h1>${title}</h1>`));
  }
  return { outDir, contactApi, distributionId: 'E123ABC' };
}

test('preflight refuses missing route, chunk or configuration before AWS', async t => {
  for (const fault of ['route', 'chunk', 'api', 'malformed-api', 'empty', 'escape']) {
    const config = fixture(t);
    if (fault === 'route') rmSync(join(config.outDir, 'about.html'));
    if (fault === 'chunk') rmSync(join(config.outDir, '_next/static/app.css'));
    if (fault === 'api') config.contactApi = '';
    if (fault === 'malformed-api') {
      config.contactApi = 'https://[';
      writeFileSync(join(config.outDir, '_next/static/app.js'), `const api = '${config.contactApi}';`);
    }
    if (fault === 'empty') writeFileSync(join(config.outDir, 'index.html'), '');
    if (fault === 'escape') writeFileSync(join(config.outDir, 'index.html'), document(home).replace('/_next/static/app.js', '/%2e%2e%2fsecret.js'));
    let calls = 0;
    await assert.rejects(deploy(config, { run: () => { calls++; } }));
    assert.equal(calls, 0, fault);
  }
});

test('uploads immutable assets first, retains old files, waits then verifies live references', async t => {
  const config = fixture(t);
  const calls = [];
  const run = args => { calls.push(args); return args.includes('create-invalidation') ? JSON.stringify({ Invalidation: { Id: 'I123' } }) : ''; };
  const fetcher = async url => {
    assert.equal(calls.at(-1)[1], 'wait');
    assert.ok(calls.at(-1).includes('I123'));
    if (url.endsWith('.js')) return new Response(`const api = '${contactApi}'`, { headers: { 'content-type': 'text/javascript' } });
    if (url.endsWith('.css')) return new Response('body{}', { headers: { 'content-type': 'text/css' } });
    const path = new URL(url).pathname;
    const title = path === '/' ? 'Eric Caskey' : path.slice(1);
    return new Response(document(path === '/' ? home : `<h1>${title}</h1>`), { headers: { 'content-type': 'text/html' } });
  };
  await deploy(config, { run, fetcher });
  assert.equal(calls.length, 4);
  assert.ok(calls[0][2].endsWith('_next'));
  assert.ok(calls[0].includes('public, max-age=31536000, immutable'));
  assert.ok(calls[1].includes('_next/*'));
  assert.ok(calls[1].includes('public, max-age=0, s-maxage=3600, must-revalidate'));
  assert.ok(calls.every(args => !args.includes('--delete')));
});

test('validate-only cannot mutate; missing endpoint in JS is refused', async t => {
  const config = fixture(t);
  await deploy({ ...config, validateOnly: true }, { run: () => { throw Error('mutation'); } });
  writeFileSync(join(config.outDir, '_next/static/app.js'), 'const api = "wrong"');
  assert.throws(() => validateExport(config), /contact API/);
});

test('AWS errors, missing invalidation ID, and live HTML masquerading as JS fail', async t => {
  const config = fixture(t);
  await assert.rejects(deploy(config, { run: () => { throw Error('AWS failure'); } }), /AWS failure/);
  await assert.rejects(deploy(config, { run: () => '{}' }), /invalidation ID/);
  let count = 0;
  await assert.rejects(deploy(config, {
    run: () => ++count === 3 ? '{"Invalidation":{"Id":"I123"}}' : '',
    fetcher: async () => new Response(document(home), { headers: { 'content-type': 'text/html' } }),
  }), /asset/);
});

test('waiter failure prevents all live verification', async t => {
  let calls = 0;
  let fetched = false;
  await assert.rejects(deploy(fixture(t), {
    run: () => {
      if (++calls === 3) return '{"Invalidation":{"Id":"I123"}}';
      if (calls === 4) throw Error('waiter failed');
      return '';
    },
    fetcher: async () => { fetched = true; throw Error('unexpected fetch'); },
  }), /waiter failed/);
  assert.equal(fetched, false);
});

test('Windows native AWS is direct; shim arguments are quoted and injection refused', () => {
  const options = { platform: 'win32', pathEnv: 'C:/AWS', exists: p => /aws.cmd$/i.test(p) };
  const shim = resolveAwsLaunch(['s3', 'sync', 'C:/site export/out', 's3://ericcaskey.com'], options);
  assert.equal(shim.shell, true);
  assert.ok(shim.args.includes('"C:/site export/out"'));
  for (const dangerous of ['%PATH%', '!var!', 'x&whoami', 'x"y', 'x\ny']) {
    assert.throws(() => resolveAwsLaunch([dangerous], options), /unsafe/i);
  }
  const native = resolveAwsLaunch(['s3'], { ...options, exists: p => /aws.exe$/i.test(p) });
  assert.equal(native.shell, false);
});

// Each fault must reach both real content gates: a mocked HTTP boundary keeps
// this regression independent of production while retaining response parsing.
for (const [name, body, error] of [
  ['missing cards', home.replace(writing, ''), /writing cards/],
  ['script-only fake cards', home.replace(writing, `<script type="application/json">${JSON.stringify(writing)}</script>`), /writing cards/],
  ['cards outside selected writing', home.replace('id="selected-writing"', 'id="other"'), /writing cards/],
  ['empty article padding one real card', home.replace('</a></article><article><h3>Workflow guardrails</h3>', '</a>').replace('</section>', '<article></article></section>'), /writing cards/],
  ['wrong essay destination', home.replace('https://caskeycoding.com/blog/ballast-an-llm-that-says-i-dont-know', 'https://example.test/essay'), /writing cards/],
  ['missing identity marker', home.replace('data-identity="spec"', ''), /identity marker/],
  ['script-only heading', home.replace('<h1>Eric Caskey</h1>', '<script type="application/json">"<h1>Eric Caskey</h1>"</script>'), /heading/],
  ['changed full Person image', home.replace('eric-caskey-1200.jpg', 'avatar.jpg'), /Person image/],
  ['large avatar source', home.replace('/eric-caskey-avatar-160.jpg', '/eric-caskey-1200.jpg'), /avatar/],
  ...['500,000', '3 million', '2,750+', '18,000', '200,000+', '60,000'].map(metric => [`duplicate ${metric}`, `${home}<p>${metric}</p>`, /metric.*once/]),
]) {
  test(`strict preflight and live check reject ${name}`, async t => {
    const config = fixture(t);
    writeFileSync(join(config.outDir, 'index.html'), document(body));
    await t.test('preflight', () => assert.throws(() => validateExport(config), error));
    await t.test('live response', () => assert.rejects(verifyLive(contactApi, liveFixture(config)), error));
  });
}

test('strict missing content cannot reach AWS', async t => {
  const config = fixture(t);
  writeFileSync(join(config.outDir, 'index.html'), document(home.replace(writing, '')));
  let commands = 0;
  await assert.rejects(deploy(config, { run: () => { commands++; } }));
  assert.equal(commands, 0, 'missing writing cards must be refused before AWS');
});

test('script/schema metric copies do not count as visible duplicates', async t => {
  const config = fixture(t);
  writeFileSync(join(config.outDir, 'index.html'), document(`${home}<script>self.__next_f.push(${JSON.stringify(metrics)})</script><style>/* 500,000 */</style><!-- 500,000 -->`));
  validateExport(config);
  await verifyLive(contactApi, liveFixture(config));
});

test('legacy content requires explicit opt-in for preflight and the same live deployment', async t => {
  const config = fixture(t);
  writeFileSync(join(config.outDir, 'index.html'), document('<h1>Eric Caskey</h1>'));
  assert.throws(() => validateExport(config), /identity marker/);
  await assert.rejects(verifyLive(contactApi, liveFixture(config)), /identity marker/);
  validateExport({ ...config, legacyContent: true });
  const calls = [];
  await deploy({ ...config, legacyContent: true }, {
    run: args => { calls.push(args); return args.includes('create-invalidation') ? '{"Invalidation":{"Id":"I123"}}' : ''; },
    fetcher: liveFixture(config),
  });
  assert.equal(calls.length, 4);
  assert.equal(calls.at(-1)[1], 'wait');
  assert.ok(calls.every(args => !args.includes('--delete')));
  const cli = spawnSync(process.execPath, ['scripts/deploy.mjs', '--validate-only', '--legacy-content', '--out-dir', config.outDir], {
    encoding: 'utf8', env: { ...process.env, NEXT_PUBLIC_CONTACT_API_URL: contactApi },
  });
  assert.equal(cli.status, 0, cli.stderr);
});

for (const fault of ['route', 'contact', 'asset']) {
  test(`legacy mode still refuses invalid ${fault} preflight and live responses`, async t => {
    const config = { ...fixture(t), legacyContent: true };
    writeFileSync(join(config.outDir, 'index.html'), document('<h1>Eric Caskey</h1>'));
    if (fault === 'route') writeFileSync(join(config.outDir, 'about.html'), document('<h1>Eric Caskey</h1>'));
    if (fault === 'contact') writeFileSync(join(config.outDir, '_next/static/app.js'), 'const wrong = true');
    if (fault === 'asset') writeFileSync(join(config.outDir, '_next/static/app.js'), '');
    assert.throws(() => validateExport(config));
    await assert.rejects(verifyLive(contactApi, liveFixture(config), { legacyContent: true }));
  });
}
