import { expect, test, type Page } from '@playwright/test';

async function seedProfile(page: Page, name: string, skin = 'lagoon'): Promise<void> {
  await page.addInitScript(({ playerName, playerSkin }) => {
    localStorage.setItem('islandName', playerName);
    localStorage.setItem('islandSkin', playerSkin);
  }, { playerName: name, playerSkin: skin });
}

interface LobbyDiagnostics {
  partyCode: string | null;
  partyMembers: number;
  renderedCharacters: number;
  renderedPedestals: number;
  memberLayout: Array<{ id: string; x: number; z: number; local: boolean }>;
  labelAnchors: Array<{ id: string; x: number; y: number; right: number; visible: boolean }>;
}

async function readLobbyDiagnostics(page: Page): Promise<LobbyDiagnostics | null> {
  return page.evaluate(() => (
    (window as Window & {
      __ISLAND_DUELL_DIAGNOSTICS__?: {
        snapshot(): { lobby: LobbyDiagnostics };
      };
    }).__ISLAND_DUELL_DIAGNOSTICS__?.snapshot().lobby ?? null
  ));
}

async function expectLobbyLogoNotClipped(page: Page): Promise<void> {
  const logoLayout = await page.locator('.lobby-logo').evaluate((logo: HTMLImageElement) => {
    const brand = logo.closest<HTMLElement>('.lobby-brand')!;
    const brandBox = brand.getBoundingClientRect();
    return {
      brandTop: brandBox.top,
      brandOverflow: getComputedStyle(brand).overflow,
      logoTransform: getComputedStyle(logo).transform,
    };
  });
  expect(logoLayout).toEqual({
    brandTop: expect.any(Number),
    brandOverflow: 'visible',
    logoTransform: 'none',
  });
  expect(logoLayout.brandTop).toBeGreaterThanOrEqual(0);
}

test('desktop lobby is visual, configurable, and contains no manual server field', async ({ page }) => {
  await seedProfile(page, 'DesktopHero');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  await expect(page.locator('#menu-screen')).toBeVisible();
  await expect(page.locator('canvas.game')).toBeVisible();
  await expect(page.locator('.lobby-logo')).toHaveAttribute('src', /island-duell-logo\.webp$/);
  expect(await page.locator('.lobby-logo').evaluate(
    (logo: HTMLImageElement) => logo.complete && logo.naturalWidth > 0,
  )).toBe(true);
  await expectLobbyLogoNotClipped(page);
  await expect(page.locator('#lobby-player-name')).toHaveText('DesktopHero');
  await expect(page.locator('#server-input')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Code-Party erstellen' })).toBeEnabled();
  await expect(page.locator('.party-dock').getByRole('button')).toHaveCount(2);
  await expect(page.locator('.party-dock')).not.toContainText('Bleibt über Matches zusammen');

  await page.getByRole('button', { name: 'Charakter anpassen' }).click();
  await expect(page.locator('#customize-dialog')).toBeVisible();
  await page.getByRole('radio', { name: 'Koralle' }).click();
  expect(await page.evaluate(() => localStorage.getItem('islandSkin'))).toBe('coral');
  await page.getByRole('button', { name: 'Fertig' }).click();

  const layout = await page.evaluate(() => {
    const header = document.querySelector('.lobby-header')!.getBoundingClientRect();
    const dock = document.querySelector('.play-dock')!.getBoundingClientRect();
    const party = document.querySelector('.party-dock')!.getBoundingClientRect();
    const overlaps = !(header.right <= dock.left || dock.right <= header.left
      || header.bottom <= dock.top || dock.bottom <= header.top);
    const controls = [...document.querySelectorAll<HTMLElement>('.lobby-header button, .play-dock button')];
    return {
      overlaps,
      partyCompact: party.width <= 280 && party.height <= 64,
      withinViewport: controls.every((element) => {
        const box = element.getBoundingClientRect();
        return box.left >= 0 && box.top >= 0 && box.right <= innerWidth && box.bottom <= innerHeight;
      }),
    };
  });
  expect(layout).toEqual({ overlaps: false, partyCompact: true, withinViewport: true });
  expect(errors).toEqual([]);
});

test('mobile lobby controls stay inside the viewport without overlapping', async ({ page }) => {
  await seedProfile(page, 'MobileHero', 'jungle');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('#menu-screen')).toBeVisible();
  await expectLobbyLogoNotClipped(page);

  const layout = await page.evaluate(() => {
    const header = document.querySelector('.lobby-header')!.getBoundingClientRect();
    const dock = document.querySelector('.play-dock')!.getBoundingClientRect();
    const party = document.querySelector('.party-dock')!.getBoundingClientRect();
    const overlap = !(header.right <= dock.left || dock.right <= header.left
      || header.bottom <= dock.top || dock.bottom <= header.top);
    const docksOverlap = !(party.right <= dock.left || dock.right <= party.left
      || party.bottom <= dock.top || dock.bottom <= party.top);
    return {
      overlap,
      docksOverlap,
      headerInside: header.left >= 0 && header.right <= innerWidth && header.top >= 0,
      dockInside: dock.left >= 0 && dock.right <= innerWidth && dock.bottom <= innerHeight,
      partyInside: party.left >= 0 && party.right <= innerWidth
        && party.top >= 0 && party.bottom <= innerHeight,
      partyCompact: party.width <= 280 && party.height <= 64,
      bodyOverflow: document.documentElement.scrollWidth > innerWidth
        || document.documentElement.scrollHeight > innerHeight,
    };
  });
  expect(layout).toEqual({
    overlap: false,
    docksOverlap: false,
    headerInside: true,
    dockInside: true,
    partyInside: true,
    partyCompact: true,
    bodyOverflow: false,
  });
});

test('two isolated browser contexts complete public Multiplayer matchmaking together', async ({ browser }) => {
  const firstContext = await browser.newContext({ viewport: { width: 1100, height: 720 } });
  const secondContext = await browser.newContext({ viewport: { width: 1100, height: 720 } });
  const first = await firstContext.newPage();
  const second = await secondContext.newPage();
  await seedProfile(first, 'ContextAlpha', 'coral');
  await seedProfile(second, 'ContextBravo', 'orchid');

  await Promise.all([first.goto('/'), second.goto('/')]);
  await Promise.all([
    first.getByRole('radio', { name: /Multiplayer/ }).click(),
    second.getByRole('radio', { name: /Multiplayer/ }).click(),
  ]);
  await Promise.all([
    first.getByRole('button', { name: 'Multiplayer suchen' }).click(),
    second.getByRole('button', { name: 'Multiplayer suchen' }).click(),
  ]);
  await expect(first.locator('#lobby-screen')).toBeVisible({ timeout: 30_000 });
  await expect(second.locator('#lobby-screen')).toBeVisible({ timeout: 30_000 });
  await expect(first.locator('#lobby-players li')).toHaveCount(2);
  await expect(second.locator('#lobby-players li')).toHaveCount(2);
  await expect(first.locator('#waiting-title')).toContainText(/startet gleich|Mitspieler/);

  await expect(first.locator('#hud')).toHaveClass(/active/, { timeout: 30_000 });
  await expect(second.locator('#hud')).toHaveClass(/active/, { timeout: 30_000 });
  const rooms = await Promise.all([
    first.evaluate(() => localStorage.getItem('islandResumeToken')),
    second.evaluate(() => localStorage.getItem('islandResumeToken')),
  ]);
  expect(rooms.every(Boolean)).toBe(true);

  await firstContext.close();
  await secondContext.close();
});

test('two clients create and join one code party with two rendered lobby characters', async ({ browser }) => {
  const hostContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const guestContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const host = await hostContext.newPage();
  const guest = await guestContext.newPage();
  await seedProfile(host, 'PartyHost', 'coral');
  await seedProfile(guest, 'PartyGuest', 'jungle');
  await Promise.all([host.goto('/'), guest.goto('/')]);

  await host.getByRole('button', { name: 'Party erstellen', exact: true }).click();
  await expect(host.locator('#party-active')).toBeVisible({ timeout: 30_000 });
  const code = (await host.locator('#party-code').textContent())!.trim();
  expect(code).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);

  await guest.getByRole('button', { name: 'Party beitreten', exact: true }).click();
  await guest.locator('#party-code-input').fill(code.toLowerCase());
  await guest.getByRole('button', { name: 'Beitreten', exact: true }).click();

  await expect(host.locator('#party-fill-row')).toBeVisible();
  await expect(host.getByRole('button', { name: 'Privates Schnellspiel starten' })).toBeEnabled();
  await expect(guest.getByRole('button', { name: 'Warte auf den Host' })).toBeDisabled();
  await expect.poll(async () => {
    const lobby = await readLobbyDiagnostics(host);
    return lobby && {
      partyCode: lobby.partyCode,
      partyMembers: lobby.partyMembers,
      renderedCharacters: lobby.renderedCharacters,
      renderedPedestals: lobby.renderedPedestals,
    };
  }).toEqual({
    partyCode: code,
    partyMembers: 2,
    renderedCharacters: 2,
    renderedPedestals: 2,
  });
  await expect.poll(async () => (await readLobbyDiagnostics(guest))?.renderedPedestals).toBe(2);
  const [hostLobby, guestLobby] = await Promise.all([
    readLobbyDiagnostics(host),
    readLobbyDiagnostics(guest),
  ]);
  for (const lobby of [hostLobby!, guestLobby!]) {
    const local = lobby.memberLayout[0];
    const remote = lobby.memberLayout[1];
    const localAnchor = lobby.labelAnchors.find((anchor) => anchor.id === local.id)!;
    expect(local.local).toBe(true);
    expect(remote.local).toBe(false);
    expect(Math.abs(localAnchor.x - 640)).toBeLessThan(12);
    expect(local.x * 7.4 + local.z * 9.8)
      .toBeGreaterThan(remote.x * 7.4 + remote.z * 9.8);
  }
  await expect(host.locator('.party-dock')).not.toContainText(/PartyHost|PartyGuest/);
  await expect(guest.locator('.party-dock')).not.toContainText(/PartyHost|PartyGuest/);
  await expect(host.locator('.party-dock').getByRole('button')).toHaveCount(2);
  await expect(host.locator('#party-code')).toHaveText(code);
  const leaveButtonContrast = await host.locator('#party-leave-btn').evaluate((button) => {
    const parseRgb = (value: string): number[] =>
      value.match(/\d+(?:\.\d+)?/g)!.slice(0, 3).map(Number);
    const luminance = (rgb: number[]): number => {
      const channels = rgb.map((value) => {
        const normalized = value / 255;
        return normalized <= 0.04045
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };
    const style = getComputedStyle(button);
    const foreground = luminance(parseRgb(style.color));
    const background = luminance(parseRgb(style.backgroundColor));
    return (Math.max(foreground, background) + 0.05)
      / (Math.min(foreground, background) + 0.05);
  });
  expect(leaveButtonContrast).toBeGreaterThanOrEqual(4.5);
  const kickButton = host.getByRole('button', { name: 'PartyGuest aus der Party entfernen' });
  await expect(kickButton).toBeVisible();
  await expect(guest.locator('.lobby-kick-button')).toHaveCount(0);

  const layout = await host.evaluate(() => {
    const party = document.querySelector('.party-dock')!.getBoundingClientRect();
    const play = document.querySelector('.play-dock')!.getBoundingClientRect();
    return {
      overlap: !(party.right <= play.left || play.right <= party.left
        || party.bottom <= play.top || play.bottom <= party.top),
      partyCompact: party.width <= 280 && party.height <= 64,
      inside: [party, play].every((rect) =>
        rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight),
    };
  });
  expect(layout).toEqual({ overlap: false, partyCompact: true, inside: true });

  await kickButton.click();
  await expect.poll(async () => {
    const lobby = await readLobbyDiagnostics(host);
    return lobby && {
      partyMembers: lobby.partyMembers,
      renderedCharacters: lobby.renderedCharacters,
      renderedPedestals: lobby.renderedPedestals,
    };
  }).toEqual({ partyMembers: 1, renderedCharacters: 1, renderedPedestals: 1 });
  await expect(host.locator('.lobby-kick-button')).toHaveCount(0);
  await expect(guest.locator('#party-empty')).toBeVisible();

  await hostContext.close();
  await guestContext.close();
});
