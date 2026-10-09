import { test, expect } from '@playwright/test';

test('browser fallback favicon serves a real multi-size ICO', async ({ request }) => {
  const response = await request.get('/favicon.ico');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toMatch(/^image\/(?:x-icon|vnd\.microsoft\.icon)(?:;|$)/);

  const icon = await response.body();
  expect([...icon.subarray(0, 4)]).toEqual([0, 0, 1, 0]);
  const count = icon.readUInt16LE(4);
  const sizes = Array.from({ length: count }, (_, index) => {
    const offset = 6 + index * 16;
    return [icon[offset] || 256, icon[offset + 1] || 256];
  });
  expect(sizes).toEqual(expect.arrayContaining([[16, 16], [32, 32], [48, 48]]));
});

for (const route of ['/', '/about']) {
  test(`favicon is advertised in ${route} metadata`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('head link[rel="icon"][href="/favicon.ico"]')).toHaveAttribute(
      'type',
      'image/x-icon',
    );
  });
}

test('missing assets still return a real 404', async ({ request }) => {
  const response = await request.get('/__missing-favicon-regression__.ico');
  expect(response.status()).toBe(404);
});
