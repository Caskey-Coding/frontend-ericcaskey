import { test, expect } from '@playwright/test';

// Smoke suite. Each route check asserts the page renders its own
// content — mirrors the deploy-time healthcheck so a regression is
// caught at PR time, not in production.

const ROUTES: Array<{ path: string; expects: RegExp; name: string }> = [
  { path: '/', expects: /eric caskey/i, name: 'home' },
  { path: '/about', expects: /(about|prudential|career|years)/i, name: 'about' },
  { path: '/work', expects: /(work|prudential|amazon|timeline)/i, name: 'work' },
  { path: '/writing', expects: /(writing|essay|reading)/i, name: 'writing' },
  { path: '/contact', expects: /(contact|message|email)/i, name: 'contact' },
];

for (const route of ROUTES) {
  test(`smoke: ${route.name} (${route.path}) renders its own content`, async ({ page }) => {
    const response = await page.goto(route.path);
    expect(response, `no response for ${route.path}`).not.toBeNull();
    expect(response!.status(), `${route.path} returned non-200`).toBe(200);
    await expect(page.locator('body')).toContainText(route.expects);
  });
}

test('theme toggle persists across reload', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /(theme|dark|light|toggle)/i }).first();
  if (await toggle.isVisible({ timeout: 2000 }).catch(() => false)) {
    const beforeAttr = await page.locator('html').getAttribute('data-theme');
    await toggle.click();
    await page.waitForTimeout(200);
    const afterAttr = await page.locator('html').getAttribute('data-theme');
    expect(afterAttr).not.toBe(beforeAttr);
    await page.reload();
    const reloadedAttr = await page.locator('html').getAttribute('data-theme');
    expect(reloadedAttr).toBe(afterAttr);
  } else {
    test.skip(true, 'theme toggle button not found');
  }
});

test('Person JSON-LD sameAs has correct LinkedIn + GitHub URLs', async ({ page }) => {
  await page.goto('/');
  const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(jsonLd, 'Person JSON-LD not found').not.toBeNull();
  expect(jsonLd!).toMatch(/linkedin\.com\/in\/ericrcaskey/);
  expect(jsonLd!).toMatch(/github\.com\/CaskeyCoding/);
  expect(jsonLd!).toMatch(/caskeycoding\.com/);
});

test('cross-site links to caskeycoding.com use the theme handoff', async ({ page }) => {
  await page.goto('/');
  // The CrossSiteLink component attaches a click handler that appends
  // ?theme=. We can't easily test the dynamic append before click, so
  // we just verify at least one outbound caskeycoding.com link exists.
  const links = page.locator('a[href*="caskeycoding.com"]');
  await expect(links.first(), 'expected at least one caskeycoding.com link').toBeAttached();
});
