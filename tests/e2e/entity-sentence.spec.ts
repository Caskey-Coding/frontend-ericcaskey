import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

const LAYOUT_DESCRIPTION =
  'Eric Caskey, Senior Software Engineer at Amazon: fifteen years in enterprise infrastructure and the guardrails that make automation safe. Caskey Engineering.';
const PERSON_SENTENCE =
  'His independent practice, Caskey Engineering, helps teams assess context, review, and release checks in AI-assisted software delivery.';
const SHARED_CLAUSE =
  'Caskey Engineering, helps teams assess context, review, and release checks in AI-assisted software delivery.';

test('home page carries one entity description across meta, Person JSON-LD, and visible FAQ', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', LAYOUT_DESCRIPTION);
  expect(await page.locator('body').innerText()).not.toContain('at Amazon scale');
  const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(node => JSON.parse(node.textContent ?? '{}')));
  const person = schemas.find(value => value['@type'] === 'Person');
  expect(person).toBeTruthy();
  expect(person.description.endsWith(PERSON_SENTENCE)).toBe(true);
  await expect(page.locator('dl.identity-faq')).toContainText(SHARED_CLAUSE);
});

test('FAQ answer with the practice clause stays visible at 390px phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const answer = page.locator('dl.identity-faq dd').filter({ hasText: SHARED_CLAUSE });
  await expect(answer).toHaveCount(1);
  await expect(answer).toBeVisible();
});
