import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

const LAYOUT_DESCRIPTION =
  'Eric Caskey builds open-source guardrails, evaluation gates, and spec-driven agent workflows for AI-assisted software delivery.';
const PERSON_SENTENCE =
  'He has spent fifteen years across five roles making production infrastructure safe enough to automate: at Amazon since June 2022, and at Prudential Financial for nine years before that.';
test('home page carries one entity description across meta and Person JSON-LD, with no FAQPage', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', LAYOUT_DESCRIPTION);
  expect(await page.locator('body').innerText()).not.toContain('at Amazon scale');
  const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(node => JSON.parse(node.textContent ?? '{}')));
  const person = schemas.find(value => value['@type'] === 'Person');
  expect(person).toBeTruthy();
  expect(person.description.endsWith(PERSON_SENTENCE)).toBe(true);
  expect(schemas.filter(value => value['@type'] === 'FAQPage')).toEqual([]);
});
