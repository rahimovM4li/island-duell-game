// End-to-end over real sockets: 3 bots join a lobby, the host starts, bots
// move and fight until the zone decides each round, the match produces
// roundEnd ×3 (+ possible sudden death) and a matchEnd — then the lobby
// unlocks for a rematch. TIME_SCALE accelerates the round clock (§9 M6).
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { io, type Socket } from 'socket.io-client';
import { PROTOCOL_VERSION } from '../shared/src/protocol';
import type {
  LobbyStateMsg, MatchEndMsg, MatchStartMsg, RoundEndMsg, RoundStartMsg,
  SnapshotMsg,
} from '../shared/src/protocol';

process.env.TIME_SCALE = '40';
const PORT = 3177;
const URL = `http://localhost:${PORT}`;

interface Bot {
  sock: Socket;
  name: string;
  id: string;
  seq: number;
  lastSnap: SnapshotMsg | null;
  roundStarts: RoundStartMsg[];
  roundEnds: RoundEndMsg[];
  matchEnd: MatchEndMsg | null;
  lobby: LobbyStateMsg | null;
  matchStart: MatchStartMsg | null;
  ticker: ReturnType<typeof setInterval> | null;
}

function makeBot(name: string): Bot {
  const sock = io(URL, { transports: ['websocket'] });
  const bot: Bot = {
    sock, name, id: '', seq: 0, lastSnap: null,
    roundStarts: [], roundEnds: [], matchEnd: null, lobby: null, matchStart: null, ticker: null,
  };
  sock.on('connect', () => { bot.id = sock.id!; });
  sock.on('lobbyState', (m: LobbyStateMsg) => { bot.lobby = m; });
  sock.on('matchStart', (m: MatchStartMsg) => { bot.matchStart = m; });
  sock.on('roundStart', (m: RoundStartMsg) => { bot.roundStarts.push(m); });
  sock.on('snapshot', (m: SnapshotMsg) => { bot.lastSnap = m; });
  sock.on('roundEnd', (m: RoundEndMsg) => { bot.roundEnds.push(m); });
  sock.on('matchEnd', (m: MatchEndMsg) => { bot.matchEnd = m; });
  return bot;
}

function until(cond: () => boolean, timeoutMs: number, what: string): Promise<void> {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const h = setInterval(() => {
      if (cond()) { clearInterval(h); resolve(); }
      else if (Date.now() - started > timeoutMs) {
        clearInterval(h);
        reject(new Error(`timeout waiting for: ${what}`));
      }
    }, 25);
  });
}

/** bots walk toward the map center and occasionally jump/punch */
function startBotInputs(bot: Bot): void {
  bot.ticker = setInterval(() => {
    const snap = bot.lastSnap;
    const me = snap?.players.find((p) => p.id === bot.id);
    if (!me || !me.alive) return;
    // steer toward (0,0): yaw so that forward (−sin, −cos) points to −pos
    const yaw = Math.atan2(me.x, me.z) + Math.PI;
    bot.sock.emit('input', {
      seq: ++bot.seq, dt: 0.033, mx: 0, mz: 1, yaw, pitch: 0,
      sprint: bot.seq % 90 < 40, jump: bot.seq % 50 === 0,
      fire: bot.seq % 25 === 0, interact: false,
    });
  }, 33);
}

describe('full LAN match over real sockets (accelerated ×40)', () => {
  let close: () => Promise<void>;
  const bots: Bot[] = [];

  beforeAll(async () => {
    const { startServer } = await import('../server/src/index');
    const started = await startServer(PORT);
    close = started.close;
  });

  afterAll(async () => {
    for (const b of bots) { if (b.ticker) clearInterval(b.ticker); b.sock.disconnect(); }
    await close?.();
  });

  it('runs join → lobby → 3 rounds → matchEnd → lobby unlock', async () => {
    // ---- join 3 bots
    for (const name of ['Alice', 'Bob', 'Cleo']) bots.push(makeBot(name));
    await until(() => bots.every((b) => b.id !== ''), 5000, 'sockets connected');
    for (const b of bots) b.sock.emit('join', { v: PROTOCOL_VERSION, name: b.name });
    await until(() => bots.every((b) => b.lobby?.players.length === 3), 5000, 'lobby with 3 players');

    const host = bots.find((b) => b.lobby!.players.find((p) => p.id === b.id)?.isHost)!;
    expect(host).toBeDefined();

    // non-host bots ready up; lobby reports canStart
    for (const b of bots) if (b !== host) b.sock.emit('setReady', { ready: true });
    await until(() => host.lobby?.canStart === true, 5000, 'canStart');

    // a 6th... (4th) client trying to join mid-match is rejected later; start now
    host.sock.emit('startMatch');
    await until(() => bots.every((b) => b.matchStart !== null), 5000, 'matchStart');

    // same seed and N for everyone (§8: host sends seed, clients generate)
    const seeds = new Set(bots.map((b) => b.matchStart!.seed));
    expect(seeds.size).toBe(1);
    expect(bots[0].matchStart!.n).toBe(3);

    await until(() => bots.every((b) => b.roundStarts.length === 1), 5000, 'roundStart 1');
    const rs = bots[0].roundStarts[0];
    expect(rs.round).toBe(1);
    expect(rs.suddenDeath).toBe(false);
    // every player has a spawn POI, all distinct (§5.3)
    expect(Object.keys(rs.spawns)).toHaveLength(3);
    expect(new Set(Object.values(rs.spawns)).size).toBe(3);
    // initial loot floor + 12+3×3 crates are announced
    expect(rs.pickups.filter((p) => p.item === 'crate')).toHaveLength(12 + 9);
    expect(rs.pickups.length).toBeGreaterThanOrEqual(21 + 20); // + 5 spawns × 4 floor items

    // lobby is locked during the match (§0 B3)
    const late = io(URL, { transports: ['websocket'] });
    const lateError = new Promise<string>((res) =>
      late.on('joinError', (e: { reason: string }) => res(e.reason)));
    await new Promise<void>((res) => late.on('connect', () => res()));
    late.emit('join', { v: PROTOCOL_VERSION, name: 'LateJoiner' });
    expect(await lateError).toMatch(/gesperrt/i);
    late.disconnect();

    // ---- bots play; snapshots stream at ~20 Hz
    for (const b of bots) startBotInputs(b);
    await until(() => bots.every((b) => b.lastSnap !== null), 5000, 'first snapshot');
    const snapProbe = bots[0].lastSnap!;
    expect(snapProbe.players).toHaveLength(3);
    expect(snapProbe.zone.radius).toBeGreaterThan(0);

    // movement is actually simulated: positions change over time
    const p0 = bots[0].lastSnap!.players.find((p) => p.id === bots[0].id)!;
    await new Promise((r) => setTimeout(r, 1500));
    const p1 = bots[0].lastSnap!.players.find((p) => p.id === bots[0].id)!;
    expect(Math.hypot(p1.x - p0.x, p1.z - p0.z)).toBeGreaterThan(1);

    // ---- zone forces every round to a decision; wait for the match to end
    await until(() => bots.every((b) => b.matchEnd !== null), 110_000, 'matchEnd');

    const rounds = bots[0].roundEnds.length;
    expect(rounds).toBeGreaterThanOrEqual(3); // 3 scheduled + possible sudden death
    const end = bots[0].matchEnd!;
    expect(end.winnerId).toBeTruthy();
    expect(end.standings).toHaveLength(3);
    expect(end.standings[0].place).toBe(1);

    // every scheduled round produced placements for all 3 players with valid points
    for (const re of bots[0].roundEnds.slice(0, 3)) {
      expect(re.placements).toHaveLength(3);
      const places = re.placements.map((p) => p.place).sort();
      expect(places[0]).toBe(1);
      for (const pl of re.placements) {
        expect([3, 2, 1, 0]).toContain(pl.points);
      }
    }
    // totals = sum of round points per player
    const sum: Record<string, number> = {};
    for (const re of bots[0].roundEnds) {
      for (const pl of re.placements) sum[pl.id] = (sum[pl.id] ?? 0) + pl.points;
    }
    expect(end.totals).toEqual(sum);
    // winner has the strictly best or tie-broken best total
    const best = Math.max(...Object.values(end.totals));
    expect(end.totals[end.winnerId]).toBe(best);

    // ---- after matchEnd the lobby unlocks; rematch readies a player again
    await until(() => bots[0].lobby?.inMatch === false, 5000, 'lobby unlocked');
    bots[1].sock.emit('rematch');
    await until(
      () => bots[0].lobby?.players.find((p) => p.id === bots[1].id)?.ready === true,
      5000, 'rematch ready',
    );
  }, 150_000);
});
