import { test, expect } from '@playwright/test';

// EC-WRITING-1: the /writing shelf is built at prebuild time by joining the
// curated content/writing-shelf.yaml (membership + editorNote) against
// caskeycoding.com/blog-index.json (title + date + url). These assertions pin
// the FEED-sourced titles/dates. The whole point of the feature is that the
// shelf tracks the canonical blog rather than a hardcoded copy that drifts.

// The five expected titles, as published in the feed (note entry 3: the feed
// title "Building a Personal Finance Reviewer..." replaces the previously
// hardcoded "Building an AI Finance App").
const EXPECTED_TITLES = [
  'Fifteen Million Was the Easy Part',
  "Best Feature Is Saying 'I Don't Know'", // Ballast (apostrophes)
  'Building a Personal Finance Reviewer: What Survived the Rewrite',
  'Designing Safety Guardrails for Distributed Workflow Orchestration',
  'Spec-Driven Development and the Folder Architecture That Makes It Work',
];

test('/writing renders the five curated essays with feed-sourced titles', async ({
  page,
}) => {
  const response = await page.goto('/writing');
  expect(response, 'no response for /writing').not.toBeNull();
  expect(response!.status(), '/writing returned non-200').toBe(200);

  // Exactly five essay rows (each essay is one h2 heading in the shelf).
  const headings = page.locator('article section h2');
  await expect(headings, 'expected exactly five essay rows').toHaveCount(5);

  for (const title of EXPECTED_TITLES) {
    await expect(
      page.locator('body'),
      `missing expected essay title: ${title}`,
    ).toContainText(title);
  }

  // Every row links to its caskeycoding.com/blog post.
  const postLinks = page.locator('a[href*="caskeycoding.com/blog/"]');
  expect(await postLinks.count(), 'expected at least five blog links').toBeGreaterThanOrEqual(5);
});

test('/writing reflects the feed, not the stale hardcoded copy', async ({
  page,
}) => {
  await page.goto('/writing');
  const body = page.locator('body');

  // spec-driven essay date corrected from the stale "June 20, 2025" to the
  // feed's canonical publish date.
  await expect(body).toContainText('April 9, 2026');
  await expect(body).not.toContainText('June 20, 2025');

  // finance essay title now comes from the feed, not the old shortened copy.
  await expect(body).not.toContainText('Building an AI Finance App');
});
