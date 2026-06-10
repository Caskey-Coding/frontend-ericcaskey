import { test, expect, type Page } from '@playwright/test';

// Contact form submission paths (B-070). The form POSTs to
// `${NEXT_PUBLIC_CONTACT_API_URL}/contact`; in PR builds the env var is
// absent so the URL is relative `/contact`, in production builds it is the
// execute-api endpoint. `**/contact` matches both. The contact PAGE is also
// served at GET /contact, so the route handler must only intercept POST.

async function interceptContactPost(page: Page, status: number, body: object) {
  await page.route('**/contact', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
}

async function fillAndSubmit(page: Page) {
  await page.goto('/contact');
  await page.getByPlaceholder('Full name').fill('Playwright Test');
  await page.getByPlaceholder('you@example.com').fill('e2e@example.com');
  await page
    .getByPlaceholder('Role, project, or inquiry')
    .fill('E2E test message, intercepted before any network leaves the browser.');
  await page.getByRole('button', { name: /send message/i }).click();
}

test('contact form success path renders the sent confirmation', async ({ page }) => {
  const posts: string[] = [];
  await page.route('**/contact', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }
    posts.push(route.request().postData() ?? '');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });

  await fillAndSubmit(page);

  await expect(page.getByText(/message sent/i)).toBeVisible();
  expect(posts).toHaveLength(1);
  const payload = JSON.parse(posts[0]);
  expect(payload).toMatchObject({
    name: 'Playwright Test',
    email: 'e2e@example.com',
  });
  // Form resets on success.
  await expect(page.getByPlaceholder('Full name')).toHaveValue('');
});

test('contact form failure path renders the error message with fallback', async ({ page }) => {
  await interceptContactPost(page, 500, { error: 'internal' });

  await fillAndSubmit(page);

  // p[role=alert] avoids Next's route announcer, which is also role=alert.
  const alert = page.locator('p[role="alert"]');
  await expect(alert).toContainText(/did not go through/i);
  await expect(alert).toContainText(/email me directly/i);
});

test('contact form network failure (no API at all) renders the error message', async ({ page }) => {
  // Simulates the B-070 production bug shape: the POST never reaches a
  // working backend. The user must see the error fallback, not silence.
  await page.route('**/contact', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }
    await route.abort('connectionrefused');
  });

  await fillAndSubmit(page);

  await expect(page.locator('p[role="alert"]')).toContainText(/did not go through/i);
});

test('contact form client validation message for a too-short message', async ({ page }) => {
  await page.goto('/contact');
  await page.getByPlaceholder('Full name').fill('Playwright Test');
  await page.getByPlaceholder('you@example.com').fill('e2e@example.com');
  await page.getByPlaceholder('Role, project, or inquiry').fill('short');
  await page.getByRole('button', { name: /send message/i }).click();

  await expect(page.locator('p[role="alert"]')).toContainText(/between 10 and\s+2000 characters/i);
});
