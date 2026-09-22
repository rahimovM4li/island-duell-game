import { expect, test } from '@playwright/test';
import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('combat spaces render and the rear bunker entrance works through real input', async ({ page }, testInfo) => {
  test.setTimeout(150_000);
  const server = fork(fileURLToPath(new URL('./fixtures/upgrade-server.ts', import.meta.url)), [], {
    execArgv: ['--import', 'tsx'], windowsHide: true, stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
  });
  let serverLog = '', requestId = 0;
  server.stdout?.on('data', chunk => { serverLog += chunk; });
  server.stderr?.on('data', chunk => { serverLog += chunk; });
  const command = (action: string): Promise<any> => new Promise((resolve, reject) => {
    const id = ++requestId;
    const timer = setTimeout(() => { server.off('message', listener); reject(new Error(`Timeout: ${action}\n${serverLog}`)); }, 5000);
    const listener = (message: any) => {
      if (message.id !== id) return;
      clearTimeout(timer); server.off('message', listener);
      message.error ? reject(new Error(message.error)) : resolve(message.state);
    };
    server.on('message', listener); server.send({ id, action });
  });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const snapshot = () => page.evaluate(() => (window as any).__ISLAND_DUELL_DIAGNOSTICS__.snapshot());
  const join = async () => {
    await page.getByRole('radio', { name: /Training/ }).click();
    await page.locator('#practice-bots').selectOption('1');
    await page.getByRole('button', { name: /Training starten/ }).click();
    await expect(page.locator('#hud'), serverLog).toHaveClass(/active/, { timeout: 20_000 });
  };
  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Fixture startup timed out')), 10000);
      server.once('message', () => { clearTimeout(timer); resolve(); }); server.once('error', reject);
    });
    await page.goto('http://127.0.0.1:3193'); await join();
    for (const place of ['bunker', 'watchtower', 'ruins', 'wreck', 'bunker-rear', 'watchtower-rear']) {
      const setup = await command(`visit-${place}`);
      await page.reload(); await join();
      await page.locator('canvas.game').click();
      await expect.poll(async () => (await snapshot()).state.pointerLocked).toBe(true);
      await page.evaluate((yaw: number) => {
        const input = (window as any).__ISLAND_DUELL_DIAGNOSTICS__.snapshot().input;
        document.dispatchEvent(new MouseEvent('mousemove', {
          movementX: (input.yaw - yaw) / 0.0023, movementY: (input.pitch + 0.02) / 0.0023,
        }));
      }, setup.yaw);
      await expect.poll(async () => (await snapshot()).entities.viewmodel.weapon).toBe('rifle');
      await page.waitForTimeout(600);
      const before = await snapshot();
      expect(before.renderer.triangles).toBeGreaterThan(1000);
      await testInfo.attach(`${place}-renderer.json`, { body: JSON.stringify(before.renderer), contentType: 'application/json' });
      await page.screenshot({ path: testInfo.outputPath(`${place}.png`) });
      if (place === 'bunker-rear') {
        await page.keyboard.down('w'); await page.waitForTimeout(1000); await page.keyboard.up('w');
        const after = await snapshot();
        const distance = Math.hypot(after.player.position.x - before.player.position.x, after.player.position.z - before.player.position.z);
        expect(distance).toBeGreaterThan(3);
        await page.screenshot({ path: testInfo.outputPath('bunker-through-door.png') });
      }
      if (place === 'watchtower-rear') {
        await page.keyboard.down('w');
        try {
          await expect.poll(async () => (await snapshot()).player.position.y - before.player.position.y, { timeout: 8000, intervals: [100] }).toBeGreaterThan(5.2);
        } finally { await page.keyboard.up('w'); }
        await page.screenshot({ path: testInfo.outputPath('watchtower-second-stair.png') });
      }
      await page.keyboard.press('Escape');
    }
    expect(errors).toEqual([]);
  } finally {
    await testInfo.attach('server.log', { body: serverLog, contentType: 'text/plain' });
    await testInfo.attach('browser-errors.json', { body: JSON.stringify(errors), contentType: 'application/json' });
    if (server.exitCode === null && server.signalCode === null) await new Promise<void>(resolve => {
      server.once('exit', () => resolve()); server.kill();
    });
  }
});
