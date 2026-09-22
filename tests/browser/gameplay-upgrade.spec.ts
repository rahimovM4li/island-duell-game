import { expect, test } from '@playwright/test';
import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('upgraded firearms fire, aim, reload and switch through real game input', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const server = fork(fileURLToPath(new URL('./fixtures/upgrade-server.ts', import.meta.url)), [], {
    execArgv: ['--import', 'tsx'], windowsHide: true, stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
  });
  let requestId = 0;
  const command = (action: string): Promise<any> => new Promise((resolve, reject) => {
    const id = ++requestId;
    const timer = setTimeout(() => { server.off('message', listener); reject(new Error(`Timeout: ${action}`)); }, 5000);
    const listener = (message: any) => {
      if (message.id !== id) return;
      clearTimeout(timer); server.off('message', listener);
      message.error ? reject(new Error(message.error)) : resolve(message.state);
    };
    server.on('message', listener); server.send({ id, action });
  });
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const view = () => page.evaluate(() => (window as any).__ISLAND_DUELL_DIAGNOSTICS__.snapshot().entities?.viewmodel);
  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Fixture startup timed out')), 10000);
      server.once('message', () => { clearTimeout(timer); resolve(); });
      server.once('error', reject);
    });
    await page.goto('http://127.0.0.1:3193');
    await page.getByRole('radio', { name: /Training/ }).click();
    await page.locator('#practice-bots').selectOption('1');
    await page.getByRole('button', { name: /Training starten/ }).click();
    await expect(page.locator('#hud')).toHaveClass(/active/, { timeout: 20_000 });
    await expect.poll(async () => (await command('state')).ready).toBe(true);
    const setup = await command('prepare');
    // Reconnect also verifies the loaded hand assets survive an inventory restore.
    await page.reload();
    await page.getByRole('radio', { name: /Training/ }).click();
    await page.getByRole('button', { name: /Training starten/ }).click();
    await expect(page.locator('#hud')).toHaveClass(/active/, { timeout: 20_000 });
    await expect.poll(async () => (await view())?.weapon).toBe('rifle');
    await page.locator('canvas.game').click();
    await expect.poll(() => page.evaluate(() => (window as any).__ISLAND_DUELL_DIAGNOSTICS__.snapshot().state.pointerLocked)).toBe(true);
    // Feed mouse movement through the normal input listener to face the island.
    await page.evaluate((yaw: number) => {
      const input = (window as any).__ISLAND_DUELL_DIAGNOSTICS__.snapshot().input;
      document.dispatchEvent(new MouseEvent('mousemove', { movementX: (input.yaw - yaw) / 0.0023, movementY: (input.pitch + 0.04) / 0.0023 }));
    }, setup.yaw);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: testInfo.outputPath('wreck-rifle.png') });
    expect((await view()).hands.map((hand: any) => hand.anatomical)).toEqual([true, true]);
    const before = (await command('state')).mag;
    await page.mouse.down();
    await page.waitForTimeout(180);
    await page.mouse.up();
    await expect.poll(async () => (await command('state')).mag).toBeLessThan(before);
    await page.mouse.down({ button: 'right' });
    await page.waitForTimeout(300);
    await page.screenshot({ path: testInfo.outputPath('rifle-aim.png') });
    await page.mouse.up({ button: 'right' });
    await page.keyboard.press('r');
    await expect.poll(async () => (await view()).magazineOffset).toBeLessThan(-0.2);
    await page.screenshot({ path: testInfo.outputPath('rifle-reload.png') });
    await expect.poll(async () => (await command('state')).reloading, { timeout: 8000 }).toBe(false);
    expect((await command('state')).mag).toBe(20);
    await page.keyboard.press('3');
    await expect.poll(async () => (await view()).weapon).toBe('pistol');
    await page.waitForTimeout(350);
    await page.screenshot({ path: testInfo.outputPath('pistol.png') });
    expect((await view()).hands).toHaveLength(2);
    expect((await view()).hands.every((hand: any) => hand.anatomical)).toBe(true);
    const slots = await page.locator('#slots .slot').evaluateAll(elements => elements.map(el => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }));
    for (const index of [0, 3]) {
      expect(slots[index].width).toBeLessThan(slots[1].width * 0.65);
      expect(slots[index].height).toBeLessThan(slots[1].height);
    }
    await page.locator('#slots').screenshot({ path: testInfo.outputPath('inventory-desktop.png') });
    await page.keyboard.press('1');
    await expect.poll(async () => (await view()).weapon).toBe('knife');
    await expect.poll(async () => (await view()).knifeAnimating).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('butterfly-draw.png') });
    await expect.poll(async () => (await view()).knifeAnimating).toBe(false);
    await page.screenshot({ path: testInfo.outputPath('butterfly-ready.png') });
    expect((await view()).hands).toHaveLength(1);
    expect((await view()).hands[0].anatomical).toBe(true);
    await page.keyboard.press('q');
    expect((await command('state')).active).toBe(1);
    await page.keyboard.press('f');
    await expect.poll(async () => (await view()).knifeInspecting).toBe(true);
    await page.waitForTimeout(600);
    await page.screenshot({ path: testInfo.outputPath('butterfly-inspect.png') });
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('f');
      await expect.poll(async () => (await view()).knifeBladeAngle).toBeLessThan(0.5);
      await page.waitForTimeout(400);
    }
    await page.mouse.down();
    await expect.poll(async () => (await view()).stabbing).toBe(true);
    await page.mouse.up();
    expect((await view()).knifeAnimating).toBe(false);
    await page.screenshot({ path: testInfo.outputPath('butterfly-stab.png') });
    await page.keyboard.press('4');
    await expect.poll(async () => (await view()).weapon).toBe('grenade');
    await page.waitForTimeout(350);
    await page.screenshot({ path: testInfo.outputPath('grenade-grip.png') });
    await page.keyboard.press('4');
    await expect.poll(async () => (await view()).weapon).toBe('smoke');
    await page.keyboard.press('4');
    await expect.poll(async () => (await view()).weapon).toBe('flash');
    // Slot changes deliberately preserve the stab cooldown; wait for the server.
    await expect.poll(async () => (await command('state')).readyToFire).toBe(true);
    await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    await expect.poll(async () => (await command('state')).throwables.flash).toBe(0);
    await page.keyboard.press('2');
    await expect.poll(async () => (await view()).weapon).toBe('rifle');
    await page.keyboard.press('1');
    await expect.poll(async () => (await view()).knifeAnimating).toBe(true);
    await command('empty-slots');
    for (const id of ['slot2', 'slot3', 'slot4']) await expect(page.locator(`#${id}`)).toHaveAttribute('aria-disabled', 'true');
    const switches = (await view()).switchCount;
    for (const key of ['2', '3', '4']) await page.keyboard.press(key);
    await page.waitForTimeout(200);
    expect((await command('state')).active).toBe(1);
    expect((await view()).switchCount).toBe(switches);
    expect(errors).toEqual([]);
  } finally {
    if (server.exitCode === null && server.signalCode === null) {
      await new Promise<void>(resolve => { server.once('exit', () => resolve()); server.kill(); });
    }
  }
});
