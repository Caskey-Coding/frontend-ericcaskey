#!/usr/bin/env node
// Shared production, rollback, and local uploader. Old hashes are retained so
// cached HTML remains usable while new assets and reference files propagate.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://ericcaskey.com';
const BUCKET = 's3://ericcaskey.com';
const ROUTES = [['/', 'Eric Caskey'], ['/about', 'About'], ['/work', 'Work'], ['/writing', 'Writing'], ['/contact', 'Contact']];

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isSymbolicLink()) throw Error(`deploy: symlink in export: ${path}`);
    return entry.isDirectory() ? files(path) : [path];
  });
}

function nonempty(file) {
  if (!existsSync(file) || !statSync(file).isFile() || statSync(file).size === 0) {
    throw Error(`deploy: missing or empty export file: ${file}`);
  }
}

function routeBody(html, title) {
  const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1].replace(/<[^>]+>/g, '').trim();
  // Current /writing uses "Selected writing"; retain the earlier plain title
  // so the current control-plane uploader can verify older rollback exports.
  const expected = title === 'Writing' ? ['writing', 'selected writing'] : [title.toLowerCase()];
  if (!expected.includes(heading?.toLowerCase())) throw Error(`deploy: route heading does not match ${title}`);
}

/** Only executable scripts and stylesheet links, excluding third-party URLs. */
export function assetUrls(html, base) {
  const assets = [];
  for (const tag of html.matchAll(/<(script|link)\b[^>]*>/gi)) {
    const attrs = Object.fromEntries([...tag[0].matchAll(/([\w-]+)\s*=\s*["']([^"']*)["']/g)].map(m => [m[1].toLowerCase(), m[2]]));
    const script = tag[1].toLowerCase() === 'script';
    if (!script && !attrs.rel?.split(/\s+/).includes('stylesheet')) continue;
    const reference = script ? attrs.src : attrs.href;
    if (!reference) continue;
    const url = new URL(reference.replaceAll('&amp;', '&'), base);
    if (url.origin === new URL(base).origin) assets.push({ url, script });
  }
  return assets;
}

export function validateExport({ outDir, contactApi }) {
  let endpoint;
  try { endpoint = new URL(contactApi); } catch { /* Reject malformed configuration below. */ }
  if (!endpoint || endpoint.protocol !== 'https:' || !endpoint.hostname || /\s/.test(contactApi) || endpoint.username || endpoint.password) {
    throw Error('deploy: configured HTTPS contact API is required');
  }
  if (!existsSync(outDir) || !statSync(outDir).isDirectory()) throw Error('deploy: export directory missing');
  const root = realpathSync(outDir);
  const exported = files(root);
  if (!exported.length) throw Error('deploy: export is empty');
  for (const [route, title] of ROUTES) {
    const file = join(root, route === '/' ? 'index.html' : `${route.slice(1)}.html`);
    nonempty(file);
    const html = readFileSync(file, 'utf8');
    routeBody(html, title);
    if (!assetUrls(html, `${SITE}${route}`).some(asset => asset.script)) throw Error(`deploy: route has no scripts: ${route}`);
  }
  const scripts = exported.filter(p => /[\\/]_next[\\/]static[\\/].*\.js$/.test(p));
  if (!scripts.length) throw Error('deploy: no exported Next.js scripts');
  for (const script of scripts) nonempty(script);
  for (const file of exported.filter(p => p.endsWith('.html'))) {
    const route = relative(root, file).replaceAll('\\', '/').replace(/index\.html$/, '').replace(/\.html$/, '');
    for (const { url } of assetUrls(readFileSync(file, 'utf8'), `${SITE}/${route}`)) {
      const local = resolve(root, `.${decodeURIComponent(url.pathname)}`);
      const rel = relative(root, local);
      if (rel.startsWith('..') || isAbsolute(rel)) throw Error('deploy: asset escapes export');
      nonempty(local);
    }
  }
  if (!scripts.some(p => readFileSync(p, 'utf8').includes(contactApi))) {
    throw Error('deploy: exported JavaScript does not contain configured contact API');
  }
}

export function resolveAwsLaunch(args, { platform = process.platform, pathEnv = process.env.PATH ?? '', exists = existsSync } = {}) {
  if (platform !== 'win32') return { file: 'aws', args, shell: false };
  // Prefer native executables; only use a PATH shim when no executable exists.
  for (const ext of ['exe', 'com', 'cmd', 'bat']) {
    for (const dir of pathEnv.split(';').filter(Boolean)) {
      const file = join(dir, `aws.${ext}`);
      if (!exists(file)) continue;
      if (ext === 'exe' || ext === 'com') return { file, args, shell: false };
      // cmd expands percent and delayed-expansion variables even inside quotes.
      // Refuse those and shell controls rather than attempting fragile escaping.
      for (const value of [file, ...args]) {
        if (/["%!&|<>^\r\n]/.test(value)) throw Error('deploy: unsafe Windows shim argument');
      }
      return { file: `"${file}"`, args: args.map(arg => `"${arg}"`), shell: true };
    }
  }
  throw Error('deploy: AWS CLI executable not found on PATH');
}

function runAws(args) {
  const launch = resolveAwsLaunch(args);
  return execFileSync(launch.file, launch.args, { shell: launch.shell, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], env: { ...process.env, AWS_PAGER: '' } });
}

export async function verifyLive(contactApi, fetcher = fetch) {
  const checked = new Map();
  let contactFound = false;
  for (const [route, title] of ROUTES) {
    const url = `${SITE}${route}`;
    const response = await fetcher(url, { signal: AbortSignal.timeout(15000), redirect: 'error' });
    if (response.status !== 200 || !response.headers.get('content-type')?.includes('text/html')) throw Error(`deploy: live route failed: ${route}`);
    const html = await response.text();
    routeBody(html, title);
    const assets = assetUrls(html, url);
    if (!assets.some(asset => asset.script)) throw Error(`deploy: live route has no scripts: ${route}`);
    for (const { url: asset, script } of assets) {
      const key = asset.href;
      if (checked.has(key)) continue;
      const res = await fetcher(key, { signal: AbortSignal.timeout(15000), redirect: 'error' });
      const contentType = res.headers.get('content-type') ?? '';
      if (res.status !== 200 || !(script ? /javascript|ecmascript/ : /text\/css/).test(contentType)) throw Error(`deploy: live asset failed: ${asset.pathname}`);
      const body = await res.text();
      if (!body.trim() || /^\s*</.test(body)) throw Error(`deploy: empty or HTML live asset: ${asset.pathname}`);
      if (script && body.includes(contactApi)) contactFound = true;
      checked.set(key, true);
    }
  }
  if (!contactFound) throw Error('deploy: live JavaScript lacks configured contact API');
}

export async function deploy(config, { run = runAws, fetcher = fetch } = {}) {
  validateExport(config);
  if (config.validateOnly) return;
  if (!/^[A-Z0-9]+$/.test(config.distributionId ?? '')) throw Error('deploy: valid CloudFront distribution ID required');
  run(['s3', 'sync', join(resolve(config.outDir), '_next'), `${BUCKET}/_next/`, '--cache-control', 'public, max-age=31536000, immutable']);
  run(['s3', 'sync', resolve(config.outDir), `${BUCKET}/`, '--exclude', '_next/*', '--cache-control', 'public, max-age=0, s-maxage=3600, must-revalidate']);
  const result = run(['cloudfront', 'create-invalidation', '--distribution-id', config.distributionId, '--paths', '/*', '--output', 'json']);
  let id;
  try { id = JSON.parse(result).Invalidation?.Id; } catch { /* Refuse malformed CLI output below. */ }
  if (!/^[A-Z0-9]+$/.test(id ?? '')) throw Error('deploy: missing or invalid CloudFront invalidation ID');
  run(['cloudfront', 'wait', 'invalidation-completed', '--distribution-id', config.distributionId, '--id', id]);
  await verifyLive(config.contactApi, fetcher);
}

async function main() {
  const args = process.argv.slice(2);
  let outDir = resolve('out');
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--out-dir' && args[i + 1]) outDir = resolve(args[++i]);
    else if (!['--no-build', '--validate-only'].includes(args[i])) throw Error(`deploy: unknown or incomplete option ${args[i]}`);
  }
  if (!args.includes('--no-build') && !args.includes('--validate-only')) {
    if (!process.env.NEXT_PUBLIC_CONTACT_API_URL) throw Error('deploy: contact API required before build');
    for (const command of ['ci', 'run build']) {
      execFileSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', command.split(' '), { stdio: 'inherit', shell: process.platform === 'win32' });
    }
  }
  await deploy({ outDir, contactApi: process.env.NEXT_PUBLIC_CONTACT_API_URL, distributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID, validateOnly: args.includes('--validate-only') });
  console.log(args.includes('--validate-only') ? 'Export preflight passed.' : 'Deploy complete: invalidation completed and live routes/assets verified.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
