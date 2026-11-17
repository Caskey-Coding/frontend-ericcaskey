import { test, expect, type Page } from '@playwright/test';

// Open-source-first copy refresh (caskeycoding-specs content-strategy 031,
// acceptance criterion 4). Runs against the local production build in
// Chromium at desktop width and at a 390px phone width. It proves rendering
// and link resolution there, not the deployed site.

test.use({ reducedMotion: 'reduce' });

const HERO_FIELDS = [
  ['role:', 'AI Reliability Engineer'],
  ['day job:', 'Senior Software Engineer at Amazon'],
  ['focus:', 'Open-source guardrails, evals, and agent workflows'],
  ['claim:', 'Safe by default. Validated before it ships.'],
];

const LOOP_HARNESS_DESCRIPTION =
  'A versioned backlog schema and loop protocol for agent work. The agent takes one item per iteration, verifies before merge, and never starts an item marked for a human.';

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

// Every external target the new copy adds.
const NEW_EXTERNAL_LINKS = [
  'https://caskeycoding.com',
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

    test('hero shows the four fields, two actions, and About and Contact as text links', async ({ page }) => {
      await page.goto('/');
      const hero = page.locator('header.identity-hero');
      const rows = hero.locator('dl.identity-fields > div');
      await expect(rows).toHaveCount(4);
      for (const [index, [term, value]] of HERO_FIELDS.entries()) {
        await expect(rows.nth(index).locator('dt')).toHaveText(term);
        await expect(rows.nth(index).locator('dd')).toHaveText(value);
        await expect(rows.nth(index)).toBeVisible();
      }
      const cta = hero.locator('.identity-cta');
      await expect(cta.getByRole('link', { name: 'Explore the open-source work →' })).toHaveAttribute('href', '/work#projects');
      expect(withoutTheme(await cta.getByRole('link', { name: 'Read the writing →' }).getAttribute('href'))).toBe(withoutTheme('https://caskeycoding.com'));
      for (const [name, href] of [['About →', '/about'], ['Contact →', '/contact']]) {
        const link = cta.getByRole('link', { name, exact: true });
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('href', href);
        await expect(link).not.toHaveClass(/sr-btn|btn-/);
      }
      const about = await cta.getByRole('link', { name: 'About →', exact: true }).boundingBox();
      const contact = await cta.getByRole('link', { name: 'Contact →', exact: true }).boundingBox();
      expect(Math.abs(about!.y - contact!.y), 'About and Contact sit beside each other').toBeLessThan(4);
      await expectNoHorizontalOverflow(page, '/');
    });

    test('Ballast and Loop Harness lead the project cards, above Amazon, with two-link cards', async ({ page }) => {
      await page.goto('/');
      const cards = page.locator('main article[data-project]');
      await expect(cards).toHaveCount(3);
      await expect(cards.nth(0)).toHaveAttribute('data-project', 'Ballast');
      await expect(cards.nth(1)).toHaveAttribute('data-project', 'Loop Harness');
      const amazon = page.locator('article[data-employer="Amazon"]');
      const amazonTop = (await amazon.boundingBox())!.y;
      for (const index of [0, 1]) {
        expect((await cards.nth(index).boundingBox())!.y, 'project card above Amazon').toBeLessThan(amazonTop);
      }
      const loopHarness = page.locator('article[data-project="Loop Harness"]');
      await expect(loopHarness).toContainText(LOOP_HARNESS_DESCRIPTION);
      for (const [name, links] of CARD_LINKS) {
        const card = page.locator(`article[data-project="${name}"]`);
        const anchors = card.getByRole('link');
        await expect(anchors).toHaveCount(links.length);
        for (const [index, [label, href]] of links.entries()) {
          await expect(anchors.nth(index)).toHaveAccessibleName(label);
          await expect(anchors.nth(index)).toBeVisible();
          expect(withoutTheme(await anchors.nth(index).getAttribute('href'))).toBe(withoutTheme(href));
        }
      }
      await expectNoHorizontalOverflow(page, '/');
    });

    test('the primary hero action opens /work with the project tiles in view', async ({ page }) => {
      await page.goto('/');
      await page.locator('.identity-cta').getByRole('link', { name: 'Explore the open-source work →' }).click();
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

test('every external link the new copy adds returns HTTP 200', async ({ request }) => {
  for (const url of NEW_EXTERNAL_LINKS) {
    const response = await request.get(url, { maxRedirects: 5, timeout: 20_000 });
    expect(response.status(), url).toBe(200);
  }
});
