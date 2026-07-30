import { expect, test } from '@playwright/test';

test('lobby and training remain playable when every Storage operation throws', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.addInitScript(() => {
    const blocked = () => {
      throw new DOMException('Storage is unavailable', 'SecurityError');
    };
    for (const method of ['getItem', 'setItem', 'removeItem'] as const) {
      Object.defineProperty(Storage.prototype, method, {
        configurable: true,
        writable: true,
        value: blocked,
      });
    }
  });

  await page.goto('/');

  await expect(page.locator('#menu-screen')).toBeVisible();
  await expect(page.locator('canvas.game')).toBeVisible();
  await expect(page.locator('#lobby-player-name')).toContainText(/IslandPlayer\d{3}/);
  await expect(page.locator('#join-btn')).toBeVisible();

  await page.getByRole('radio', { name: /Training/ }).click();
  await page.locator('#practice-bots').selectOption('1');
  await page.getByRole('button', { name: /Training starten/ }).click();

  await expect(page.locator('#hud')).toHaveClass(/active/, { timeout: 30_000 });
  await expect(page.locator('canvas.game')).toBeVisible();
  await expect.poll(async () => page.evaluate(() => {
    const diagnostics = (window as Window & {
      __ISLAND_DUELL_DIAGNOSTICS__?: {
        snapshot(): {
          state: { inMatch: boolean; roundRunning: boolean };
          entities: unknown;
        };
      };
    }).__ISLAND_DUELL_DIAGNOSTICS__?.snapshot();
    return !!diagnostics?.state.inMatch
      && !!diagnostics.state.roundRunning
      && !!diagnostics.entities;
  })).toBe(true);

  expect(pageErrors).toEqual([]);
});
