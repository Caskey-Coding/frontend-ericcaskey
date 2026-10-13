import { test, expect, type Page } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

const essays = [
  'https://caskeycoding.com/blog/ballast-an-llm-that-says-i-dont-know',
  'https://caskeycoding.com/blog/designing-safety-guardrails-for-distributed-workflow-orchestration',
];
const themeColors = { light: '#f5f3eb', dark: '#13130f' };

test('identity, avatar, curated essays and matching first-person FAQ exist without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  const hero = page.locator('header.identity-hero[data-identity="spec"]');
  await expect(hero).toHaveCount(1);
  await expect(hero.locator('h1')).toHaveText('Eric Caskey');
  await expect(hero.locator('p').filter({ hasText: '$ whoami' })).toHaveText('$ whoami');
  await expect(hero.locator('dl.identity-fields dt')).toHaveText(['role:', 'focus:', 'claim:']);
  await expect(hero.locator('dl.identity-fields dd')).toHaveCount(3);
  await expect(hero.getByRole('link', { name: 'Read the case study' })).toHaveAttribute('href', 'https://caskeycoding.com/case-studies/workflow-orchestration');
  const avatar = hero.locator('.identity-avatar img');
  await expect(avatar).toHaveAttribute('width', '80');
  await expect(avatar).toHaveAttribute('height', '80');
  expect(await avatar.evaluate((image: HTMLImageElement) => ({
    loaded: image.complete && image.naturalWidth > 0,
    smallSource: new URL(image.currentSrc).pathname.startsWith('/eric-caskey-avatar'),
    width: image.getBoundingClientRect().width,
    height: image.getBoundingClientRect().height,
    crop: getComputedStyle(image).objectFit,
  }))).toEqual({ loaded: true, smallSource: true, width: 80, height: 80, crop: 'cover' });
  const cards = page.locator('section#selected-writing article');
  expect(await cards.count()).toBeGreaterThanOrEqual(2);
  for (const url of essays) await expect(cards.locator(`a[href="${url}"]`)).toBeVisible();
  const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(node => JSON.parse(node.textContent ?? '{}')));
  expect(schemas.find(value => value['@type'] === 'Person').image).toBe('https://ericcaskey.com/eric-caskey-1200.jpg');
  const questions = schemas.find(value => value['@type'] === 'FAQPage').mainEntity;
  const rendered = await page.locator('dl.identity-faq > div').evaluateAll(rows => rows.map(row => ({
    name: row.querySelector('dt')?.textContent,
    answer: row.querySelector('dd')?.textContent,
  })));
  expect(rendered).toEqual(questions.map((question: { name: string; acceptedAnswer: { text: string } }) => ({ name: question.name, answer: question.acceptedAnswer.text })));
  expect(rendered.length).toBeGreaterThan(0);
  for (const { answer } of rendered) expect(answer).toMatch(/\bI(?:\b|')/);
  await expect(page.locator('dl.identity-faq')).toContainText('reply within a week');
  await expect(page.locator('main a[href="/contact"]').first()).toBeVisible();
  await context.close();
});

test('homepage metrics belong to one employer and home/work claims and project statuses agree', async ({ page }) => {
  await page.goto('/');
  const body = await page.locator('body').innerText();
  const employerText: Record<string, string> = {};
  for (const [employer, metrics] of [
    ['Amazon', ['500,000 cumulative safety checks', '3 million monitors', '2,750+ application stages']],
    ['Prudential Financial', ['18,000', '200,000+ administrative actions', '60,000 corporate users']],
  ] as const) {
    const entry = page.locator(`article[data-employer="${employer}"]`);
    employerText[employer] = await entry.innerText();
    for (const metric of metrics) {
      expect(body.split(metric).length - 1, `${metric} visible only once`).toBe(1);
      await expect(entry.locator('.work-metrics')).toContainText(metric);
    }
    await expect(entry.locator('.project-status')).toHaveCount(0);
  }
  const homeProjects: Record<string, { status: string; meaning: string | null }> = {};
  for (const [project, status, meaning] of [
    ['Ballast', 'shipped', 'Public versioned release'],
    ['SpecSelf', 'active', 'Current development with an evolving spec'],
  ]) {
    const chip = page.locator(`[data-project="${project}"] span.project-status`);
    await expect(chip).toHaveText(`status: ${status}`);
    await expect(chip).toHaveAttribute('title', meaning);
    homeProjects[project] = { status: await chip.innerText(), meaning: await chip.getAttribute('title') };
  }
  await page.goto('/work');
  for (const [employer, text] of Object.entries(employerText)) {
    expect(await page.locator(`article[data-employer="${employer}"]`).innerText()).toBe(text);
  }
  await expect(page.locator('[data-employer] .project-status')).toHaveCount(0);
  for (const [project, expected] of Object.entries(homeProjects)) {
    const chip = page.locator(`[data-project="${project}"] span.project-status`);
    await expect(chip).toHaveText(expected.status);
    expect(await chip.getAttribute('title')).toBe(expected.meaning);
  }
});

async function assertTheme(page: Page, mode: 'light' | 'dark') {
  await expect(page.locator('html')).toHaveAttribute('data-theme', mode);
  const values = await page.locator('meta[name="theme-color"]').evaluateAll(tags => tags.map(tag => tag.getAttribute('content')));
  expect(values.length).toBeGreaterThan(0);
  expect(values.every(value => value === themeColors[mode])).toBe(true);
}

test('saved and inbound themes override OS, toggle persists, handoff and unrelated URL parts survive', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, colorScheme: 'dark', reducedMotion: 'reduce' });
  await context.addInitScript(() => localStorage.setItem('eric-caskey-theme', 'light'));
  const page = await context.newPage();
  await page.goto('/');
  await assertTheme(page, 'light');
  await page.goto('/?keep=yes&theme=dark#main');
  await assertTheme(page, 'dark');
  await expect(page).toHaveURL(/\/\?keep=yes#main$/);
  expect(await page.evaluate(() => localStorage.getItem('eric-caskey-theme'))).toBe('dark');
  const outbound = page.locator('.identity-cta a').first();
  await outbound.focus();
  await expect(outbound).toHaveAttribute('href', /\?theme=dark$/);
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await assertTheme(page, 'light');
  expect(await page.evaluate(() => localStorage.getItem('eric-caskey-theme'))).toBe('light');
  await outbound.focus();
  await expect(outbound).toHaveAttribute('href', /\?theme=light$/);
  await context.close();
});

for (const mode of ['light', 'dark'] as const) {
  test(`OS ${mode} initializes rendered palette and browser chrome with and without JavaScript`, async ({ browser, baseURL }) => {
    for (const javaScriptEnabled of [true, false]) {
      const context = await browser.newContext({ baseURL, colorScheme: mode, javaScriptEnabled, reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto('/');
      if (javaScriptEnabled) await assertTheme(page, mode);
      const appearance = await page.evaluate(() => ({
        background: getComputedStyle(document.body).backgroundColor,
        chrome: [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')]
          .filter(meta => !meta.media || matchMedia(meta.media).matches).map(meta => meta.content),
      }));
      expect(appearance.background).toBe(mode === 'dark' ? 'rgb(19, 19, 15)' : 'rgb(245, 243, 235)');
      expect(appearance.chrome).toEqual([themeColors[mode]]);
      await context.close();
    }
  });

  test(`${mode} important text meets rendered 4.5 contrast and content reflows at 320px and desktop`, async ({ page }) => {
    await page.goto(`/?theme=${mode}`);
    const contrasts = await page.evaluate(() => {
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
      return [...document.querySelectorAll<HTMLElement>('main p, main dt, main dd, main .text-muted, main .project-status, main a, nav a, footer a')]
        .filter(element => element.innerText.trim() && element.getBoundingClientRect().width > 0 && !element.closest('.sr-only'))
        .map(element => {
          const ancestors: Element[] = [];
          for (let current: Element | null = element; current; current = current.parentElement) ancestors.unshift(current);
          const background = ancestors.reduce((color, ancestor) => over(rgba(getComputedStyle(ancestor).backgroundColor), color), [255, 255, 255, 1]);
          const foreground = over(rgba(getComputedStyle(element).color), background);
          const a = luminance(foreground), b = luminance(background);
          return { text: element.innerText.slice(0, 90), ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) };
        });
    });
    expect(contrasts.length).toBeGreaterThan(20);
    expect(contrasts.filter(({ ratio }) => ratio < 4.5), 'computed text/background, alpha composited through ancestors').toEqual([]);
    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ['/', '/work']) {
        await page.goto(`${route}?theme=${mode}`);
        expect(await page.evaluate(() => document.documentElement.scrollWidth), `${route} at ${width}px`).toBeLessThanOrEqual(width);
      }
    }
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(`/?theme=${mode}`);
    await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth), 'text spacing at 320px').toBeLessThanOrEqual(320);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  });

  test(`${mode} CSS zoom 200% and 640px equivalent reflow preserve identity and keyboard focus`, async ({ page }, testInfo) => {
    for (const scenario of [
      { name: 'css-zoom-200', width: 1280, height: 1600, zoom: 2 },
      { name: 'reflow-640', width: 640, height: 1000, zoom: 1 },
    ]) {
      await page.setViewportSize({ width: scenario.width, height: scenario.height });
      await page.goto(`/?theme=${mode}`);
      await page.evaluate(zoom => { document.documentElement.style.zoom = String(zoom); }, scenario.zoom);
      // CSS zoom exercises enlargement; the 640px viewport independently
      // exercises the layout width of a 1280px window at 200% browser zoom.
      // Neither is evidence that browser toolbar zoom was changed.
      const geometry = await page.evaluate(() => {
        const targets = [...document.querySelectorAll<HTMLElement>(
          '.identity-hero h1, .identity-claim, .identity-cta a, .identity-avatar img, nav[aria-label="Primary"] a, .theme-toggle',
        )];
        return {
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          targets: targets.map(element => {
            const rect = element.getBoundingClientRect();
            const clippedBy: string[] = [];
            for (let ancestor = element.parentElement; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
              const style = getComputedStyle(ancestor);
              const bounds = ancestor.getBoundingClientRect();
              if (/(hidden|clip)/.test(style.overflowX) && (rect.left < bounds.left - 1 || rect.right > bounds.right + 1)) clippedBy.push(ancestor.className);
              if (/(hidden|clip)/.test(style.overflowY) && (rect.top < bounds.top - 1 || rect.bottom > bounds.bottom + 1)) clippedBy.push(ancestor.className);
            }
            return {
              target: element.innerText || element.getAttribute('alt') || element.getAttribute('aria-label'),
              fits: rect.width > 0 && rect.height > 0 && rect.left >= -1 && rect.right <= innerWidth + 1,
              textOverflows: element.scrollWidth > element.clientWidth + 1,
              clippedBy,
            };
          }),
        };
      });
      expect(geometry.overflow, `${scenario.name}: document overflow`).toBe(false);
      expect(geometry.targets.length).toBeGreaterThanOrEqual(10);
      expect(geometry.targets.filter(target => !target.fits || target.textOverflows || target.clippedBy.length), `${scenario.name}: identity/nav clipping`).toEqual([]);
      expect((await page.locator('.identity-avatar img').boundingBox())!.width).toBe(80 * scenario.zoom);

      const primary = page.locator('.identity-cta a').first();
      for (let step = 0; step < 20 && !await primary.evaluate(element => element === document.activeElement); step++) {
        await page.keyboard.press('Tab');
      }
      await expect(primary).toBeFocused();
      const focus = await primary.evaluate(element => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const inset = Math.min(4, rect.width / 4, rect.height / 4);
        const points = [
          [rect.left + inset, rect.top + inset], [rect.right - inset, rect.top + inset],
          [rect.left + inset, rect.bottom - inset], [rect.right - inset, rect.bottom - inset],
          [rect.left + rect.width / 2, rect.top + rect.height / 2],
        ];
        return {
          visibleFocus: element.matches(':focus-visible') && style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 2 && style.outlineColor !== 'rgba(0, 0, 0, 0)',
          fullyInViewport: rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight,
          unobscured: points.every(([x, y]) => { const hit = document.elementFromPoint(x, y); return hit === element || !!hit && element.contains(hit); }),
        };
      });
      expect(focus, `${scenario.name}: keyboard CTA focus`).toEqual({ visibleFocus: true, fullyInViewport: true, unobscured: true });
      await page.screenshot({ path: testInfo.outputPath(`${mode}-${scenario.name}-keyboard-focus.png`) });
    }
  });
}
