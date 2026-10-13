// Bounded static-export inspection, not a general browser/HTML sanitizer.
// Deploy jobs install no npm dependencies. Ignore raw script/style/template
// payloads before inspecting actual elements and their body text.
const ESSAYS = [
  '/blog/ballast-an-llm-that-says-i-dont-know',
  '/blog/designing-safety-guardrails-for-distributed-workflow-orchestration',
];
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

function decode(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (_, entity) => {
    if (entity[0] === '#') return String.fromCodePoint(entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1)));
    return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }[entity.toLowerCase()];
  });
}

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([^\s=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)]
    .map(match => [match[1].toLowerCase(), decode(match[2] ?? match[3] ?? match[4] ?? '')]));
}

function parseBody(html) {
  const body = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
  const root = { tag: '', attrs: {}, children: [] };
  const stack = [root];
  for (const token of body.matchAll(/<\/?[a-z][\w:-]*\b(?:[^>"']|"[^"]*"|'[^']*')*>|[^<]+/gi)) {
    const value = token[0];
    const match = value.match(/^<(\/)?([\w:-]+)\b([\s\S]*?)>$/);
    if (!match) { stack.at(-1).children.push(decode(value)); continue; }
    const tag = match[2].toLowerCase();
    if (match[1]) {
      const index = stack.findLastIndex(node => node.tag === tag);
      if (index > 0) stack.length = index;
    } else {
      const node = { tag, attrs: attributes(match[3]), children: [] };
      stack.at(-1).children.push(node);
      if (!VOID.has(tag) && !/\/$/.test(match[3])) stack.push(node);
    }
  }
  return elements(root, node => node.tag === 'body')[0] ?? root;
}

function elements(root, predicate) {
  if (typeof root === 'string' || 'hidden' in root.attrs) return [];
  return [...(predicate(root) ? [root] : []), ...root.children.flatMap(child => elements(child, predicate))];
}

function textContent(node) {
  if (typeof node === 'string') return node;
  if ('hidden' in node.attrs) return '';
  return node.children.map(textContent).join(' ').replace(/\s+/g, ' ').trim();
}

export function assertRouteHeading(html, title) {
  const heading = elements(parseBody(html), node => node.tag === 'h1')[0];
  // Current /writing uses "Selected writing"; old exports use "Writing".
  const expected = title === 'Writing' ? ['writing', 'selected writing'] : [title.toLowerCase()];
  if (!heading || !expected.includes(textContent(heading).toLowerCase())) throw Error(`deploy: route heading does not match ${title}`);
}

export function assertIdentityContent(html) {
  const body = parseBody(html);
  const hero = elements(body, node => node.tag === 'header' && node.attrs['data-identity'] === 'spec')[0];
  if (!hero) throw Error('deploy: required spec identity marker is missing');
  const heading = elements(hero, node => node.tag === 'h1');
  if (heading.length !== 1 || textContent(heading[0]) !== 'Eric Caskey') throw Error('deploy: identity heading must be Eric Caskey');
  const shelf = elements(body, node => node.tag === 'section' && node.attrs.id === 'selected-writing')[0];
  const cards = (shelf ? elements(shelf, node => node.tag === 'article') : [])
    .filter(card => textContent(card))
    .map(card => elements(card, node => node.tag === 'a').flatMap(link => {
      try { const url = new URL(link.attrs.href); return url.origin === 'https://caskeycoding.com' && ESSAYS.includes(url.pathname) ? [url.pathname] : []; } catch { return []; }
    })).filter(paths => paths.length);
  if (cards.length < 2 || !ESSAYS.every(path => cards.some(paths => paths.includes(path)))) throw Error('deploy: required initial HTML writing cards are missing');
  const text = textContent(body);
  for (const metric of ['500,000', '3 million', '2,750+', '18,000', '200,000+', '60,000']) {
    if (text.split(metric).length - 1 !== 1) throw Error(`deploy: metric ${metric} must occur once in homepage body`);
  }
  if (!elements(hero, node => node.tag === 'img' && node.attrs.src?.startsWith('/eric-caskey-avatar')).length) throw Error('deploy: small identity avatar is missing');
  const schemas = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)]
    .filter(match => attributes(match[1]).type === 'application/ld+json')
    .flatMap(match => { try { const value = JSON.parse(match[2]); return Array.isArray(value) ? value : value['@graph'] ?? [value]; } catch { return []; } });
  if (!schemas.some(value => value['@type'] === 'Person' && value['@id'] === 'https://ericcaskey.com/#person' && value.image === 'https://ericcaskey.com/eric-caskey-1200.jpg')) throw Error('deploy: full Person image must be preserved');
}
