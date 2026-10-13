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
  const alert = page.locator('p.form-note--err');
  await expect(alert).toContainText(/did not go through/i);
  await expect(alert).toContainText(/email me directly/i);
});

for (const mode of ['light', 'dark'] as const) {
  for (const response of [
    { kind: 'error', status: 500, body: { error: 'internal' }, selector: 'p.form-note--err', text: /did not go through/i },
    { kind: 'success', status: 200, body: { ok: true }, selector: 'p.form-note--ok', text: /message sent/i },
  ]) {
  test(`contact ${response.kind} has rendered 4.5 contrast in ${mode} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode, reducedMotion: 'reduce' });
    await interceptContactPost(page, response.status, response.body);
    await fillAndSubmit(page);
    const alert = page.locator(response.selector);
    await expect(alert).toContainText(response.text);
    await expect(page.locator('html')).toHaveAttribute('data-theme', mode);
    const contrast = await alert.evaluate(element => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d', { willReadFrequently: true })!;
      function rgba(color: string) {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
        return [r, g, b, a / 255];
      }
      function over(foreground: number[], background: number[]) {
        return [0, 1, 2].map(i => foreground[i] * foreground[3] + background[i] * (1 - foreground[3])).concat(1);
      }
      function luminance(color: number[]) {
        const [r, g, b] = color.map(value => value / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      }
      return [element, ...element.querySelectorAll('a')].map(target => {
        const ancestors: Element[] = [];
        for (let current: Element | null = target; current; current = current.parentElement) ancestors.unshift(current);
        const background = ancestors.reduce((color, ancestor) => over(rgba(getComputedStyle(ancestor).backgroundColor), color), [255, 255, 255, 1]);
        const foreground = over(rgba(getComputedStyle(target).color), background);
        const a = luminance(foreground), b = luminance(background);
        return { text: target.textContent, ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) };
      });
    });
    expect(contrast.length).toBeGreaterThanOrEqual(1);
    expect(contrast.filter(({ ratio }) => ratio < 4.5), 'actual status text over alpha-composited tinted background').toEqual([]);
  });
  }
}

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

  await expect(page.locator('p.form-note--err')).toContainText(/did not go through/i);
});

test('contact form client validation message for a too-short message', async ({ page }) => {
  await page.goto('/contact');
  await page.getByPlaceholder('Full name').fill('Playwright Test');
  await page.getByPlaceholder('you@example.com').fill('e2e@example.com');
  await page.getByPlaceholder('Role, project, or inquiry').fill('short');
  await page.getByRole('button', { name: /send message/i }).click();

  await expect(page.locator('p.form-note--err')).toContainText(/between 10 and\s+2000 characters/i);
});
