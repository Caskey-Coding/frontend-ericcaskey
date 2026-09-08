import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { deploy, validateExport, resolveAwsLaunch } from '../scripts/deploy.mjs';

const contactApi = 'https://api.example.test';
function fixture(t) {
  const outDir = mkdtempSync(join(tmpdir(), 'personal-deploy-'));
  t.after(() => rmSync(outDir, { recursive: true, force: true }));
  mkdirSync(join(outDir, '_next/static'), { recursive: true });
  writeFileSync(join(outDir, '_next/static/app.js'), `const api = '${contactApi}';`);
  writeFileSync(join(outDir, '_next/static/app.css'), 'body {color:black}');
  for (const [file, title] of [['index', 'Eric Caskey'], ['about', 'About'], ['work', 'Work'], ['writing', 'Selected writing'], ['contact', 'Contact']]) {
    writeFileSync(join(outDir, `${file}.html`), `<html><h1>${title}</h1><script src="/_next/static/app.js"></script><link rel="stylesheet" href="/_next/static/app.css"></html>`);
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
    if (fault === 'escape') writeFileSync(join(config.outDir, 'index.html'), '<h1>Eric Caskey</h1><script src="/%2e%2e%2fsecret.js"></script>');
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
    return new Response(`<h1>${title}</h1><script src="/_next/static/app.js"></script><link rel="stylesheet" href="/_next/static/app.css">`, { headers: { 'content-type': 'text/html' } });
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
    fetcher: async () => new Response('<h1>Eric Caskey</h1><script src="/bad.js"></script>', { headers: { 'content-type': 'text/html' } }),
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
