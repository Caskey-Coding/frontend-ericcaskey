import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'list',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // No --single: that flag rewrites EVERY route to index.html, so the suite
  // was exercising the home page for all paths (the contact page never
  // rendered). Plain serve maps /contact -> contact.html (cleanUrls) and
  // 404s unknown paths, matching the S3/CloudFront production behavior.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npx serve out -l 3000 --no-clipboard',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
      },
});
