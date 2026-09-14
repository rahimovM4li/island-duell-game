import { test, expect } from '@playwright/test';
import { buildSync } from 'esbuild';

test('anatomical grip review in controlled lighting', async ({ page }, info) => {
  const bundle = buildSync({
    entryPoints: ['tests/browser/fixtures/model-review.ts'], bundle: true, write: false,
    format: 'esm', platform: 'browser', alias: { '@shared': './shared/src' },
  }).outputFiles[0].text;
  await page.route('**/__model-review', route => route.fulfill({
    contentType: 'text/html', body: `<html><head><base href="/"></head><body><script type="module">${bundle}</script></body></html>`,
  }));
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({ width: 1100, height: 800 });
  await page.goto('/__model-review');
  await expect.poll(() => page.evaluate(() => !!(window as any).modelReview)).toBe(true);
  for (const [pose, time] of [['ready', 0], ['draw', 0.35], ['inspect', 0.65], ['primary', 0.15], ['secondary', 0.25]] as const) {
    await page.evaluate(([kind, t]) => (window as any).modelReview.pose(kind, t), [pose, time]);
    await page.screenshot({ path: info.outputPath(`${pose}.png`) });
  }
  await page.evaluate(() => { (window as any).modelReview.pose('ready', 0); (window as any).modelReview.angle(0.7); });
  await page.screenshot({ path: info.outputPath('side.png') });
  expect(errors).toEqual([]);
});
