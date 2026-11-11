import { test, expect } from '@playwright/test';

// EC-WRITING-1: the /writing shelf is built at prebuild time by joining the
// curated content/writing-shelf.yaml (membership + editorNote) against
// caskeycoding.com/blog-index.json (title + date + url). These assertions pin
// the FEED-sourced titles/dates. The whole point of the feature is that the
// shelf tracks the canonical blog rather than a hardcoded copy that drifts.

// The six expected titles, as published in the feed (note entry 4: the feed
// title "Building a Personal Finance Reviewer..." replaces the previously
// hardcoded "Building an AI Finance App").
const EXPECTED_TITLES = [
  'The Marathon I Wanted My Kids to See',
  'Pricing 215 million options a second with SIMD C++',
  "Best Feature Is Saying 'I Don't Know'", // Ballast (apostrophes)
  'Building a Personal Finance Reviewer: What Survived the Rewrite',
  'Designing Safety Guardrails for Distributed Workflow Orchestration',
  'Spec-Driven Development and the Folder Architecture That Makes It Work',
];

test('/writing renders the six curated essays with feed-sourced titles', async ({
  page,
}) => {
  const response = await page.goto('/writing');
  expect(response, 'no response for /writing').not.toBeNull();
  expect(response!.status(), '/writing returned non-200').toBe(200);

  // Exactly six essay rows (each essay is one h2 heading in the shelf).
  const headings = page.locator('article section h2');
  await expect(headings, 'expected exactly six essay rows').toHaveCount(6);
  await expect(headings.first()).toHaveText('The Marathon I Wanted My Kids to See');
  await expect(page.locator('article header .coord')).toContainText('6 selected');

  const marathonLink = page.locator('article section a').first();
  // CrossSiteLink adds the active theme after hydration; the destination
  // must still be the exact canonical post.
  const marathonUrl = new URL((await marathonLink.getAttribute('href'))!);
  marathonUrl.searchParams.delete('theme');
  expect(marathonUrl.href).toBe(
    'https://caskeycoding.com/blog/the-marathon-i-wanted-my-kids-to-see',
  );
  await expect(marathonLink.locator('p')).toHaveText([
    'November 2, 2026',
    'A return to running, a New York finish, and the example I wanted to set for my kids.',
    'Caskey Coding',
  ]);

  for (const title of EXPECTED_TITLES) {
    await expect(
      page.locator('body'),
      `missing expected essay title: ${title}`,
    ).toContainText(title);
  }

  // Every row links to its caskeycoding.com/blog post.
  const postLinks = page.locator('a[href*="caskeycoding.com/blog/"]');
  expect(await postLinks.count(), 'expected at least six blog links').toBeGreaterThanOrEqual(6);
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
