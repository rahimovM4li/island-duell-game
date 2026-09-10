import { expect, test } from '@playwright/test';
import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('round results, reconnect during the pause and training rematch work in the browser', async ({ page }) => {
  test.setTimeout(60_000);
  // Extend the intermission so reloading cannot race the next round.
  const server = fork(fileURLToPath(new URL('./fixtures/round-server.ts', import.meta.url)), [], {
    execArgv: ['--import', 'tsx'], windowsHide: true, stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
  });
  type State = { running: boolean; roundActive: boolean; seed: number; players: number; roomCount: number };
  let requestId = 0;
  const command = (action: string): Promise<State> => new Promise((resolve, reject) => {
    const id = ++requestId;
    const timer = setTimeout(() => { server.off('message', listener); reject(new Error(`Server command timed out: ${action}`)); }, 5000);
    const listener = (message: any) => {
      if (message.id !== id) return;
      clearTimeout(timer);
      server.off('message', listener);
      if (message.error) reject(new Error(message.error));
      else resolve(message.state);
    };
    server.on('message', listener);
    server.send({ id, action });
  });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const startTraining = async () => {
    await page.getByRole('radio', { name: /Training/ }).click();
    await page.locator('#practice-bots').selectOption('1');
    await page.getByRole('button', { name: /Training starten/ }).click();
  };
  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Test server did not start')), 10_000);
      server.once('message', () => { clearTimeout(timer); resolve(); });
      server.once('error', error => { clearTimeout(timer); reject(error); });
      server.once('exit', code => { clearTimeout(timer); reject(new Error(`Test server exited: ${code}`)); });
    });
    await page.goto('http://127.0.0.1:3192');
    await startTraining();
    await expect(page.locator('#hud')).toHaveClass(/active/);
    // Controlled server-side elimination drives the real event, rendering,
    // cinematic and scoreboard paths without relying on random bot combat.
    await expect.poll(async () => (await command('state')).roundActive).toBe(true);
    const seed = (await command('state')).seed;
    await command('finishRound');
    await expect(page.locator('#scoreboard-screen')).toBeVisible({ timeout: 12_000 });
    await expect(page.locator('#scoreboard-title')).toContainText('Runde 1 gewonnen');
    expect(errors).toEqual([]);

    await page.reload();
    await startTraining();
    await expect(page.locator('#scoreboard-screen')).toBeVisible();
    await expect(page.locator('#scoreboard-title')).toContainText('Runde 1 gewonnen');
    expect(await page.evaluate(() => (window as any).__ISLAND_DUELL_DIAGNOSTICS__.snapshot().state.roundRunning)).toBe(false);
    expect((await command('state')).roomCount).toBe(1);

    await command('finishMatch');
    await expect(page.locator('#rematch-btn')).toBeVisible();
    await page.locator('#rematch-btn').click();
    await expect(page.locator('#scoreboard-screen')).toBeHidden();
    await expect.poll(async () => {
      const state = await command('state');
      return state.running && state.seed !== seed;
    }).toBe(true);
    await expect.poll(() => page.evaluate(() => (window as any).__ISLAND_DUELL_DIAGNOSTICS__.snapshot().state.roundRunning)).toBe(true);
    expect((await command('state')).players).toBe(2);
    expect(errors).toEqual([]);
  } finally {
    // Terminate only this isolated fixture, including outstanding polling requests.
    if (server.exitCode === null && server.signalCode === null) {
      await new Promise<void>(resolve => { server.once('exit', () => resolve()); server.kill(); });
    }
  }
});
