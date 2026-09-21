import { test, expect } from '@playwright/test';

// Gameplay requires landscape; portrait intentionally shows the rotate-device overlay.
test.use({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });

test('compact inventory fits a phone and empty slots ignore taps', async ({ page }, info) => {
  await page.goto('/');
  await page.getByRole('radio', { name: /Training/ }).click();
  await page.locator('#practice-bots').selectOption('1');
  await page.getByRole('button', { name: /Training starten/ }).click();
  await expect(page.locator('#hud')).toHaveClass(/active/);
  await expect(page.locator('body')).toHaveClass(/touch-mode/);
  await expect(page.locator('#slot2')).toHaveAttribute('aria-disabled', 'true');
  const before = await page.evaluate(() => (window as any).__ISLAND_DUELL_DIAGNOSTICS__.snapshot().entities.viewmodel.switchCount);
  await page.locator('#slot2').tap({ force: true });
  await page.locator('#slot3').tap({ force: true });
  await page.waitForTimeout(200);
  const after = await page.evaluate(() => (window as any).__ISLAND_DUELL_DIAGNOSTICS__.snapshot().entities.viewmodel);
  expect(after.switchCount).toBe(before);
  expect(after.weapon).toBe('knife');
  const boxes = await page.locator('#slots .slot').evaluateAll(elements => elements.map(el => {
    const r = el.getBoundingClientRect();
    return { x: r.x, right: r.right, width: r.width, height: r.height, scroll: el.scrollWidth, client: el.clientWidth };
  }));
  for (const box of boxes) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.right).toBeLessThanOrEqual(844);
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.scroll).toBeLessThanOrEqual(box.client);
  }
  expect(boxes[0].width).toBeLessThan(boxes[1].width);
  expect(boxes[3].width).toBeLessThan(boxes[2].width);
  await page.screenshot({ path: info.outputPath('inventory-mobile.png') });
});
