import { test, expect, type Page } from '@playwright/test';

// Home copy (owner-approved 2026-11-18 homepage copy, superseding the 031
// home rows pending a spec amendment) and the /work project tiles from
// caskeycoding-specs content-strategy 031, acceptance criterion 4. Runs
// against the local production build in Chromium at desktop width and at a
// 390px phone width. It proves rendering and link resolution there, not the
// deployed site.

test.use({ reducedMotion: 'reduce' });

const HERO_INTRO =
  'I build platforms that help engineers make changes to production systems safely and see how their applications are running.';
const HERO_ACTION = 'Explore my platform experiments →';

// Home "Selected projects": project name, then its one link's name and target.
const HOME_PROJECTS: Array<[string, string, string]> = [
  ['Loop Harness', 'Inspect the protocol', 'https://github.com/CaskeyCoding/loop-harness'],
  ['SpecSelf', 'Try the worked example', 'https://specself.ai/start/'],
];

// Card name, then each action's accessible name and target, in order.
const CARD_LINKS: Array<[string, Array<[string, string]>]> = [
  ['Ballast', [
    ['Read the Ballast case study →', 'https://caskeycoding.com/case-studies/ballast'],
    ['Inspect the source →', 'https://github.com/CaskeyCoding/ballast'],
  ]],
  ['Loop Harness', [
    ['Inspect Loop Harness on GitHub →', 'https://github.com/CaskeyCoding/loop-harness'],
  ]],
  ['SpecSelf', [
    ['Explore SpecSelf →', 'https://specself.ai'],
    ['Inspect SpecSelf Starter →', 'https://github.com/CaskeyCoding/specself-starter'],
  ]],
];

// Every external target the /work tiles and the home copy link to.
const NEW_EXTERNAL_LINKS = [
  'https://caskeycoding.com',
  'https://specself.ai/start/',
  'https://caskeycoding.com/case-studies/ballast',
  'https://github.com/CaskeyCoding/ballast',
  'https://github.com/CaskeyCoding/loop-harness',
  'https://github.com/CaskeyCoding/specself-starter',
  'https://specself.ai',
];

// CrossSiteLink rewrites the href after hydration (adds ?theme=, and URL
// serialization adds a root slash); compare normalized URLs without the theme.
function withoutTheme(href: string | null) {
  const url = new URL(href ?? '');
  url.searchParams.delete('theme');
  return url.toString();
}

async function expectNoHorizontalOverflow(page: Page, label: string) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, `${label}: horizontal overflow`).toBeLessThanOrEqual(clientWidth);
}

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'phone 390px', width: 390, height: 844 },
]) {
  test.describe(`open-source-first at ${viewport.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
    });

    test('hero shows the role, the one-sentence intro, and a single action', async ({ page }) => {
      await page.goto('/');
      const hero = page.locator('header.identity-hero');
      const rows = hero.locator('dl.identity-fields > div');
      await expect(rows).toHaveCount(1);
      await expect(rows.locator('dt')).toHaveText('role:');
      await expect(rows.locator('dd')).toHaveText('Platform engineer');
      await expect(hero.locator('[data-intro]')).toHaveText(HERO_INTRO);
      await expect(hero.locator('[data-intro]')).toBeVisible();
      const links = hero.getByRole('link');
      await expect(links).toHaveCount(1);
      await expect(links.first()).toHaveAccessibleName(HERO_ACTION);
      await expect(links.first()).toHaveAttribute('href', '/work#projects');
      await expectNoHorizontalOverflow(page, '/');
    });

    test('home shows Selected projects, Writing and Get in touch in order, with their links and no cards', async ({ page }) => {
      await page.goto('/');
      const headings = page.locator('main h2');
      await expect(headings).toHaveText(['Selected projects', 'Writing', 'Get in touch']);
      const projects = page.locator('main [data-home-project]');
      await expect(projects).toHaveCount(HOME_PROJECTS.length);
      for (const [index, [name, label, href]] of HOME_PROJECTS.entries()) {
        const entry = projects.nth(index);
        await expect(entry).toHaveAttribute('data-home-project', name);
        await expect(entry.locator('strong')).toHaveText(name);
        const anchors = entry.getByRole('link');
        await expect(anchors).toHaveCount(1);
        await expect(anchors.first()).toHaveAccessibleName(label);
        await expect(anchors.first()).toBeVisible();
        expect(withoutTheme(await anchors.first().getAttribute('href'))).toBe(withoutTheme(href));
      }
      await expect(page.locator('main').getByRole('link', { name: 'Browse selected writing', exact: true })).toHaveAttribute('href', '/writing');
      await expect(page.locator('main').getByRole('link', { name: 'Send me a note', exact: true })).toHaveAttribute('href', '/contact');
      await expect(page.locator('main article[data-project], main [data-employer]')).toHaveCount(0);
      await expectNoHorizontalOverflow(page, '/');
    });

    test('the primary hero action opens /work with the project tiles in view', async ({ page }) => {
      await page.goto('/');
      await page.locator('.identity-cta').getByRole('link', { name: HERO_ACTION }).click();
      await expect(page).toHaveURL(/\/work#projects$/);
      const section = page.locator('section#projects');
      await expect(section).toHaveCount(1);
      await expect(section.locator('.sr-tiles')).toBeInViewport();
      for (const [name, links] of CARD_LINKS) {
        const tile = section.locator(`.sr-tile[data-project="${name}"]`);
        await expect(tile).toHaveCount(1);
        const anchors = tile.getByRole('link');
        await expect(anchors).toHaveCount(links.length);
        for (const [index, [label]] of links.entries()) await expect(anchors.nth(index)).toHaveAccessibleName(label);
      }
      await expectNoHorizontalOverflow(page, '/work');
    });

    test('/about has no horizontal overflow', async ({ page }) => {
      await page.goto('/about');
      await expectNoHorizontalOverflow(page, '/about');
    });
  });
}

test('every external link the /work tiles and the home copy use returns HTTP 200', async ({ request }) => {
  for (const url of NEW_EXTERNAL_LINKS) {
    const response = await request.get(url, { maxRedirects: 5, timeout: 20_000 });
    expect(response.status(), url).toBe(200);
  }
});
