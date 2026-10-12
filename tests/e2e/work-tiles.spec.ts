import { test, expect } from '@playwright/test';

// Guardrails for the 2026-10-11 brand pivot (spec 005): the Method tile
// leads the Selected builds band on /work, the tiles stack without
// horizontal overflow at 375px, and /about carries the Cloud Engineer
// year and the control-plane wording, without the retired "Nights and weekends" copy.

test('work: first Selected builds tile is the spec-driven engineering platform', async ({ page }) => {
  await page.goto('/work');
  const firstTile = page.locator('.sr-tiles a').first();
  // CrossSiteLink rewrites href to append ?theme= after hydration, so
  // match the canonical URL as a prefix rather than the whole attribute.
  await expect(firstTile).toHaveAttribute(
    'href',
    /^https:\/\/caskeycoding\.com\/case-studies\/sdd-platform/,
  );
  await expect(firstTile).toContainText('Spec-driven engineering platform');
});

test('work: tiles stack without horizontal overflow at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/work');
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(375);
});

test('about: Cloud Engineer year and control-plane wording present, retired copy gone', async ({ page }) => {
  await page.goto('/about');
  const body = page.locator('body');
  await expect(body).toContainText('Cloud Engineer in Site Reliability Engineering');
  await expect(body).toContainText('workflow orchestration control plane');
  await expect(body).not.toContainText('Nights and weekends');
});
