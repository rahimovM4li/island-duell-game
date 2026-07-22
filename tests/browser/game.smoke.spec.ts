import { expect, test } from '@playwright/test';

test('host can enter a quick solo match and render the 3D scene', async ({ page }) => {
  const pageErrors: string[] = [];
  const assetResponses = new Map<string, number>();
  const assetWarnings: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'warning' && message.text().includes('Compact game assets unavailable')) {
      assetWarnings.push(message.text());
    }
  });
  page.on('response', (response) => {
    const name = new URL(response.url()).pathname.split('/').pop();
    if (name && ['weapons.glb', 'props.glb', 'environment.glb', 'landmarks.glb', 'character.glb', 'island-atlas.png'].includes(name)) {
      assetResponses.set(name, response.status());
    }
  });

  await page.goto('/');
  await expect(page).toHaveTitle('Island Duell');
  await page.getByLabel('Spielername').fill('BrowserTest');
  await page.getByRole('button', { name: 'Beitreten' }).click();

  await expect(page.locator('#lobby-screen')).not.toHaveClass(/hidden/, { timeout: 30_000 });
  await expect(page.locator('#lobby-players li')).toHaveCount(1);
  await page.locator('#match-mode').selectOption('quick');
  await page.locator('#practice-bots').selectOption('1');
  await page.getByRole('button', { name: /Solo/ }).click();

  await expect(page.locator('#hud')).toHaveClass(/active/, { timeout: 30_000 });
  await expect(page.locator('canvas.game')).toBeVisible();
  await expect.poll(async () => page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('canvas.game');
    const diagnostics = (window as Window & {
      __ISLAND_DUELL_DIAGNOSTICS__?: {
        snapshot(): { state: { inMatch: boolean; roundRunning: boolean }; entities: unknown };
      };
    }).__ISLAND_DUELL_DIAGNOSTICS__;
    const snapshot = diagnostics?.snapshot();
    return !!canvas && canvas.width > 0 && canvas.height > 0
      && !!snapshot?.state.inMatch && !!snapshot.state.roundRunning && !!snapshot.entities;
  })).toBe(true);

  const canvas = page.locator('canvas.game');
  await canvas.click({ position: { x: 320, y: 240 }, force: true });
  await expect.poll(async () => page.evaluate(() => (
    (window as Window & {
      __ISLAND_DUELL_DIAGNOSTICS__?: { snapshot(): { state: { pointerLocked: boolean } } };
    }).__ISLAND_DUELL_DIAGNOSTICS__?.snapshot().state.pointerLocked ?? false
  ))).toBe(true);

  await page.evaluate(() => {
    (window as Window & { __CTRL_D_DEFAULT_PREVENTED__?: boolean }).__CTRL_D_DEFAULT_PREVENTED__ = false;
    window.addEventListener('keydown', (event) => {
      if (event.code === 'KeyD' && event.ctrlKey) {
        (window as Window & { __CTRL_D_DEFAULT_PREVENTED__?: boolean }).__CTRL_D_DEFAULT_PREVENTED__ = event.defaultPrevented;
      }
    });
  });
  await page.keyboard.down('Control');
  await page.keyboard.press('d');
  await page.keyboard.up('Control');
  expect(await page.evaluate(() => (
    (window as Window & { __CTRL_D_DEFAULT_PREVENTED__?: boolean }).__CTRL_D_DEFAULT_PREVENTED__
  ))).toBe(true);

  const environment = await page.evaluate(() => (
    (window as Window & {
      __ISLAND_DUELL_DIAGNOSTICS__?: {
        snapshot(): { environment: { nightTorches: { count: number; lights: number } } | null };
      };
    }).__ISLAND_DUELL_DIAGNOSTICS__?.snapshot().environment
  ));
  expect(environment?.nightTorches.count).toBeGreaterThanOrEqual(12);
  expect(environment?.nightTorches.lights).toBe(6);

  await page.keyboard.down('w');
  await page.keyboard.down('Shift');
  const movementSamples = await page.evaluate(async () => {
    const samples: Array<{ x: number; z: number }> = [];
    const diagnostics = (window as Window & {
      __ISLAND_DUELL_DIAGNOSTICS__?: {
        snapshot(): {
          player: {
            position: { x: number; z: number };
            renderPosition?: { x: number; z: number };
          };
          network: {
            reconciliationHardSnaps: number;
            reconciliationSmoothCorrections: number;
            maxReconciliationError: number;
            maxPredictionStepsPerFrame: number;
          };
        };
      };
    }).__ISLAND_DUELL_DIAGNOSTICS__;
    let nextStallAt = 650;
    await new Promise<void>((resolve) => {
      const started = performance.now();
      const sample = (now: number) => {
        const player = diagnostics?.snapshot().player;
        if (player) samples.push(player.renderPosition ?? player.position);
        const elapsed = now - started;
        if (elapsed >= nextStallAt) {
          const stallUntil = performance.now() + 90;
          while (performance.now() < stallUntil) { /* simulate an occasional slow frame */ }
          nextStallAt += 650;
        }
        if (elapsed >= 3_000) resolve();
        else requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    return { samples, network: diagnostics?.snapshot().network };
  });
  await page.keyboard.up('Shift');
  await page.keyboard.up('w');

  const movingSamples = movementSamples.samples.slice(Math.min(12, Math.floor(movementSamples.samples.length / 4)));
  const stationaryFrames = movingSamples.slice(1).filter((sample, index) => {
    const previous = movingSamples[index];
    return Math.hypot(sample.x - previous.x, sample.z - previous.z) < 0.0001;
  }).length;
  const stationaryRatio = stationaryFrames / Math.max(1, movingSamples.length - 1);
  expect(movementSamples.samples.length).toBeGreaterThan(30);
  expect(stationaryRatio).toBeLessThan(0.25);
  expect(movementSamples.network?.maxPredictionStepsPerFrame).toBeGreaterThan(1);
  expect(movementSamples.network?.reconciliationHardSnaps).toBe(0);
  expect(movementSamples.network?.maxReconciliationError).toBeLessThan(1.5);

  expect(Object.fromEntries(assetResponses)).toEqual({
    'island-atlas.png': 200,
    'weapons.glb': 200,
    'props.glb': 200,
    'environment.glb': 200,
    'landmarks.glb': 200,
    'character.glb': 200,
  });
  expect(assetWarnings).toEqual([]);
  expect(pageErrors).toEqual([]);

  await page.evaluate(() => document.exitPointerLock());
  await expect(page.locator('#pause-hint')).toBeVisible();
  await page.locator('#pause-leave-btn').click();
  await expect(page.locator('#menu-screen')).not.toHaveClass(/hidden/);
  await expect(page.locator('#menu-error')).toContainText('verlassen');
});
