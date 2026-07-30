import { expect, test } from '@playwright/test';

test('player can enter training from the new 3D lobby and render the match', async ({ page }) => {
  const pageErrors: string[] = [];
  const assetResponses = new Map<string, number>();
  const assetWarnings: string[] = [];
  await page.addInitScript(() => {
    const calls: string[] = [];
    (window as Window & { __IMMERSIVE_LOCK_CALLS__?: string[] }).__IMMERSIVE_LOCK_CALLS__ = calls;
    Object.defineProperty(Element.prototype, 'requestFullscreen', {
      configurable: true,
      value: async () => { calls.push('fullscreen'); },
    });
    Object.defineProperty(navigator, 'keyboard', {
      configurable: true,
      value: {
        lock: async (keyCodes: string[] = []) => {
          calls.push('keyboard');
          (window as Window & { __KEYBOARD_LOCK_CODES__?: string[] }).__KEYBOARD_LOCK_CODES__ = keyCodes;
        },
        unlock: () => {},
      },
    });
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'warning' && message.text().includes('Compact game assets unavailable')) {
      assetWarnings.push(message.text());
    }
  });
  page.on('response', (response) => {
    const name = new URL(response.url()).pathname.split('/').pop();
    if (name && [
      'weapons.glb', 'props.glb', 'environment.glb', 'landmarks.glb',
      'character.glb', 'middle-island.glb', 'island-atlas.png',
    ].includes(name)) {
      assetResponses.set(name, response.status());
    }
  });

  await page.goto('/');
  await expect(page).toHaveTitle('Island Duell');
  await expect(page.locator('#lobby-player-name')).toContainText(/IslandPlayer\d{3}/);
  await page.getByRole('radio', { name: /Training/ }).click();
  await page.locator('#practice-bots').selectOption('1');
  await page.getByRole('button', { name: /Training starten/ }).click();

  await expect(page.locator('#hud')).toHaveClass(/active/, { timeout: 30_000 });
  await expect(page.locator('canvas.game')).toBeVisible();
  await expect(page.locator('#network-quality')).toBeVisible();
  await expect.poll(async () => page.locator('#network-quality').textContent())
    .toMatch(/(?:\d+ ms|Netz)/);
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
  const renderedCanvas = await page.locator('canvas.game').screenshot();
  expect(renderedCanvas.byteLength).toBeGreaterThan(15_000);

  const fistViewmodel = await page.evaluate(() => (
    (window as Window & {
      __ISLAND_DUELL_DIAGNOSTICS__?: {
        snapshot(): {
          entities: {
            viewmodel: {
              weapon: string | null;
              visible: boolean;
              switchCount: number;
              lastSwitchSameWeapon: boolean;
              hands: Array<{
                ndcMin: { x: number; y: number; z: number };
                ndcMax: { x: number; y: number; z: number };
              }>;
            };
          } | null;
        };
      };
    }).__ISLAND_DUELL_DIAGNOSTICS__?.snapshot().entities?.viewmodel
  ));
  expect(fistViewmodel?.weapon).toBe('fists');
  expect(fistViewmodel?.visible).toBe(true);
  expect(fistViewmodel?.hands).toHaveLength(1);
  const handsWithVisibleArea = fistViewmodel?.hands.filter((hand) => {
    const visibleWidth = Math.min(1, hand.ndcMax.x) - Math.max(-1, hand.ndcMin.x);
    const visibleHeight = Math.min(1, hand.ndcMax.y) - Math.max(-1, hand.ndcMin.y);
    return visibleWidth > 0.2 && visibleHeight > 0.2
      && hand.ndcMax.z >= -1 && hand.ndcMin.z <= 1;
  });
  expect(handsWithVisibleArea).toHaveLength(1);

  const canvas = page.locator('canvas.game');
  await canvas.click({ position: { x: 320, y: 240 }, force: true });
  await expect.poll(async () => page.evaluate(() => (
    (window as Window & {
      __ISLAND_DUELL_DIAGNOSTICS__?: { snapshot(): { state: { pointerLocked: boolean } } };
    }).__ISLAND_DUELL_DIAGNOSTICS__?.snapshot().state.pointerLocked ?? false
  ))).toBe(true);
  await expect.poll(async () => page.evaluate(() => (
    (window as Window & { __KEYBOARD_LOCK_CODES__?: string[] }).__KEYBOARD_LOCK_CODES__ ?? []
  ))).toContain('KeyW');
  await expect.poll(async () => page.evaluate(() => {
    const calls = (window as Window & {
      __IMMERSIVE_LOCK_CALLS__?: string[];
    }).__IMMERSIVE_LOCK_CALLS__ ?? [];
    const keyboardIndex = calls.indexOf('keyboard');
    return keyboardIndex > 0 && calls.slice(0, keyboardIndex).includes('fullscreen');
  })).toBe(true);

  await page.keyboard.down('Tab');
  await expect(page.locator('#round-roster')).toHaveClass(/visible/);
  await expect(page.locator('#round-roster-list li')).toHaveCount(2);
  await expect(page.locator('#round-roster-list')).toContainText(/IslandPlayer\d{3}/);
  await expect(page.locator('#round-roster-list')).not.toContainText('Unbekannt');
  await expect(page.locator('#round-roster-list li[data-status="alive"]')).toHaveCount(2);
  await page.keyboard.up('Tab');
  await expect(page.locator('#round-roster')).not.toHaveClass(/visible/);

  const dropRequestsBefore = await page.evaluate(() => (
    (window as Window & {
      __ISLAND_DUELL_DIAGNOSTICS__?: {
        snapshot(): { input: { dropRequestsSent: number } };
      };
    }).__ISLAND_DUELL_DIAGNOSTICS__?.snapshot().input.dropRequestsSent ?? 0
  ));
  await page.keyboard.down('q');
  await expect.poll(async () => page.evaluate(() => (
    (window as Window & {
      __ISLAND_DUELL_DIAGNOSTICS__?: {
        snapshot(): { input: { dropRequestsSent: number } };
      };
    }).__ISLAND_DUELL_DIAGNOSTICS__?.snapshot().input.dropRequestsSent ?? 0
  ))).toBe(dropRequestsBefore + 1);
  await page.waitForTimeout(120);
  expect(await page.evaluate(() => (
    (window as Window & {
      __ISLAND_DUELL_DIAGNOSTICS__?: {
        snapshot(): { input: { dropRequestsSent: number } };
      };
    }).__ISLAND_DUELL_DIAGNOSTICS__?.snapshot().input.dropRequestsSent ?? 0
  ))).toBe(dropRequestsBefore + 1);
  await page.keyboard.up('q');

  const switchCountBefore = await page.evaluate(() => (
    (window as Window & {
      __ISLAND_DUELL_DIAGNOSTICS__?: {
        snapshot(): { entities: { viewmodel: { switchCount: number } } | null };
      };
    }).__ISLAND_DUELL_DIAGNOSTICS__?.snapshot().entities?.viewmodel.switchCount ?? 0
  ));
  await page.keyboard.press('Digit2');
  await expect.poll(async () => page.evaluate(() => (
    (window as Window & {
      __ISLAND_DUELL_DIAGNOSTICS__?: {
        snapshot(): {
          entities: {
            viewmodel: {
              weapon: string | null;
              switchCount: number;
              lastSwitchSameWeapon: boolean;
            };
          } | null;
        };
      };
    }).__ISLAND_DUELL_DIAGNOSTICS__?.snapshot().entities?.viewmodel
  ))).toMatchObject({
    weapon: 'fists',
    switchCount: switchCountBefore + 1,
    lastSwitchSameWeapon: true,
  });

  const wheelHandledByGame = await page.evaluate(() => {
    const event = new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true });
    document.dispatchEvent(event);
    return event.defaultPrevented;
  });
  expect(wheelHandledByGame).toBe(true);

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
        snapshot(): {
          environment: {
            nightTorches: { count: number; lights: number };
            middleIsland: { authored: boolean; fallback: boolean };
          } | null;
        };
      };
    }).__ISLAND_DUELL_DIAGNOSTICS__?.snapshot().environment
  ));
  expect(environment?.nightTorches.count).toBeGreaterThanOrEqual(12);
  expect(environment?.nightTorches.lights).toBe(6);
  expect(environment?.middleIsland).toEqual({ authored: true, fallback: false });

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
            interpolationDelayMs: number;
            maxRemoteExtrapolationMs: number;
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
  expect(movementSamples.network?.interpolationDelayMs).toBeGreaterThanOrEqual(75);
  expect(movementSamples.network?.interpolationDelayMs).toBeLessThanOrEqual(185);
  expect(movementSamples.network?.maxRemoteExtrapolationMs).toBeLessThanOrEqual(85);

  expect(Object.fromEntries(assetResponses)).toEqual({
    'island-atlas.png': 200,
    'weapons.glb': 200,
    'props.glb': 200,
    'environment.glb': 200,
    'landmarks.glb': 200,
    'character.glb': 200,
    'middle-island.glb': 200,
  });
  expect(assetWarnings).toEqual([]);
  expect(pageErrors).toEqual([]);

  await page.evaluate(() => document.exitPointerLock());
  await expect(page.locator('#pause-hint')).toBeVisible();
  await page.locator('#pause-leave-btn').click();
  await expect(page.locator('#menu-screen')).not.toHaveClass(/hidden/);
  await expect(page.locator('#menu-error')).toContainText('verlassen');
});
