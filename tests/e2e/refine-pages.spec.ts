import { test, expect } from '@playwright/test';

// Page-refinement boundaries, not copy or traffic-outcome assertions.
const PAGES = [
  // REFINE-139: retain the career narrative and connect to contact.
  { route: '/about', h1: /^About$/, canonical: 'https://ericcaskey.com/about', nextAction: '/contact' },
];

for (const p of PAGES) {
  test(`refined page ${p.route}`, async ({ page }) => {
    const response = await page.goto(p.route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1').first()).toHaveText(p.h1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', p.canonical);
    const article = page.locator('main article').first();
    // The global navigation already has Contact; verify the narrative's continuation.
    const next = article.locator(`a[href="${p.nextAction}"]`).first();
    await expect(next).toBeVisible();
    await expect(article.locator('a[href="/work"]').first()).toBeVisible();
    const target = await page.goto(p.nextAction);
    expect(target?.status()).toBe(200);
    await page.goto(p.route);
    await page.setViewportSize({ width: 390, height: 844 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
}
