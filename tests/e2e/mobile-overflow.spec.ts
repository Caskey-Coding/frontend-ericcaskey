import { test, expect, type Page } from '@playwright/test';

// B-073: the header used to overflow at 360-375px (wordmark + 4 links +
// theme toggle needed ~390-425px against ~312px of usable width), and
// the desktop-only Playwright project could never see it. This spec
// runs in the `mobile-chromium` project (375px viewport) and asserts no
// horizontal overflow on every top-level route, plus visible/clickable
// nav links with >=44px touch targets.

const ROUTES = ['/', '/about', '/work', '/writing', '/contact'];

const NAV_LINKS: Array<{ name: string; href: string }> = [
  { name: 'About', href: '/about' },
  { name: 'Work', href: '/work' },
  { name: 'Writing', href: '/writing' },
  { name: 'Contact', href: '/contact' },
];

async function expectNoHorizontalOverflow(page: Page, label: string) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    scrollWidth,
    `${label}: horizontal overflow (scrollWidth ${scrollWidth} > clientWidth ${clientWidth})`,
  ).toBeLessThanOrEqual(clientWidth);
}

for (const route of ROUTES) {
  test(`no horizontal overflow on ${route}`, async ({ page }) => {
    await page.goto(route);
    await expectNoHorizontalOverflow(page, route);
  });
}

test('all nav links are visible with >=44px touch targets', async ({ page }) => {
  await page.goto('/');
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  for (const { name } of NAV_LINKS) {
    const link = page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name });
    await expect(link, `nav link "${name}" not visible`).toBeVisible();
    const box = await link.boundingBox();
    expect(box, `nav link "${name}" has no bounding box`).not.toBeNull();
    expect(box!.height, `nav link "${name}" touch target < 44px`).toBeGreaterThanOrEqual(44);
    expect(
      box!.x + box!.width,
      `nav link "${name}" extends past the viewport`,
    ).toBeLessThanOrEqual(viewport!.width);
  }
});

for (const { name, href } of NAV_LINKS) {
  test(`nav link "${name}" is clickable and navigates`, async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name })
      .click();
    await page.waitForURL(`**${href}`);
    expect(new URL(page.url()).pathname.replace(/\/$/, '') || '/').toBe(href);
  });
}

test('header fits at 320px (no overflow, links still visible)', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  await expectNoHorizontalOverflow(page, '/ at 320px');
  for (const { name } of NAV_LINKS) {
    await expect(
      page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name }),
    ).toBeVisible();
  }
});
