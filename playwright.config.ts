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
      testIgnore: /mobile-overflow\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile project scoped (testMatch) to the overflow spec only: CI
    // minutes are metered (see AGENTS.md), and the rest of the suite is
    // viewport-independent content/behavior checks — running it twice
    // would roughly double e2e time for no extra signal.
    // Explicit 375px chromium viewport rather than devices['iPhone SE'],
    // which defaults to WebKit — CI only installs chromium
    // (pr-validation.yml: `playwright install --with-deps chromium`).
    {
      name: 'mobile-chromium',
      testMatch: /mobile-overflow\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 667 },
      },
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
