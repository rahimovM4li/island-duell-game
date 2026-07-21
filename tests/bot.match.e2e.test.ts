// §F4 end-to-end over a real socket: a single human starts a solo practice
// match against tactical bots; the bots loot/fight/rotate on the host, every
// round reaches a decision and the match produces a full standings table.
// TIME_SCALE accelerates the round clock exactly like the human E2E test.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { io, type Socket } from 'socket.io-client';
import { PROTOCOL_VERSION } from '../shared/src/protocol';
import type {
  LobbyStateMsg, MatchEndMsg, MatchStartMsg, RoundEndMsg, RoundStartMsg,
  SnapshotMsg,
} from '../shared/src/protocol';

process.env.TIME_SCALE = '40';
const PORT = 3178;
const URL = `http://localhost:${PORT}`;

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

describe('solo practice vs bots over a real socket (accelerated ×40)', () => {
  let close: () => Promise<void>;
  let sock: Socket;
  let ticker: ReturnType<typeof setInterval> | null = null;

  beforeAll(async () => {
    const { startServer } = await import('../server/src/index');
    const started = await startServer(PORT);
    close = started.close;
  });

  afterAll(async () => {
    if (ticker) clearInterval(ticker);
    sock?.disconnect();
    await close?.();
  });

  it('startPractice → bots play a full 3-round match → matchEnd with standings', async () => {
    sock = io(URL, { transports: ['websocket'] });
    let myId = '';
    let lobby: LobbyStateMsg | null = null;
    let matchStart: MatchStartMsg | null = null;
    let lastSnap: SnapshotMsg | null = null;
    const roundStarts: RoundStartMsg[] = [];
    const roundEnds: RoundEndMsg[] = [];
    let matchEnd: MatchEndMsg | null = null;
    sock.on('session', (m: { playerId: string }) => { myId = m.playerId; });
    sock.on('lobbyState', (m: LobbyStateMsg) => { lobby = m; });
    sock.on('matchStart', (m: MatchStartMsg) => { matchStart = m; });
    sock.on('roundStart', (m: RoundStartMsg) => { roundStarts.push(m); });
    sock.on('snapshot', (m: SnapshotMsg) => { lastSnap = m; });
    sock.on('roundEnd', (m: RoundEndMsg) => { roundEnds.push(m); });
    sock.on('matchEnd', (m: MatchEndMsg) => { matchEnd = m; });

    await until(() => sock.connected, 5000, 'socket connected');
    sock.emit('join', { v: PROTOCOL_VERSION, name: 'Solo' });
    await until(() => myId !== '' && lobby !== null, 5000, 'joined lobby');

    // a lone human cannot start a normal match…
    expect(lobby!.canStart).toBe(false);
    // …but can start practice with 3 bots
    sock.emit('startPractice', { bots: 3, difficulty: 'normal' });
    await until(() => matchStart !== null, 5000, 'practice matchStart');
    expect(matchStart!.practice).toBe(true);
    expect(matchStart!.n).toBe(4);
    expect(matchStart!.players).toHaveLength(4);
    const botNames = matchStart!.players.filter((p) => p.id.startsWith('bot-')).map((p) => p.name);
    expect(botNames).toHaveLength(3);
    for (const name of botNames) expect(name).toMatch(/^Bot /);

    await until(() => roundStarts.length === 1, 5000, 'roundStart');
    // all 4 participants have distinct spawn POIs
    expect(Object.keys(roundStarts[0].spawns)).toHaveLength(4);
    expect(new Set(Object.values(roundStarts[0].spawns)).size).toBe(4);

    // human idles in place (sends inputs so reconciliation stays alive)
    let seq = 0;
    ticker = setInterval(() => {
      sock.emit('input', {
        seq: ++seq, dt: 0.033, mx: 0, mz: 0, yaw: 0, pitch: 0,
        sprint: false, sneak: false, aim: false, jump: false,
        fire: false, interact: false,
      });
    }, 33);

    await until(() => lastSnap !== null, 5000, 'first snapshot');
    expect(lastSnap!.players).toHaveLength(4);

    // bots actually move: track a bot across ~2 s of real time
    const botId = matchStart!.players.find((p) => p.id.startsWith('bot-'))!.id;
    const before = lastSnap!.players.find((p) => p.id === botId)!;
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const after = lastSnap!.players.find((p) => p.id === botId)!;
    expect(Math.hypot(after.x - before.x, after.z - before.z)).toBeGreaterThan(0.5);

    // the match plays out to the end without human help
    await until(() => matchEnd !== null, 110_000, 'practice matchEnd');
    expect(matchEnd!.practice).toBe(true);
    expect(matchEnd!.standings).toHaveLength(4);
    expect(matchEnd!.winnerId).toBeTruthy();
    expect(roundEnds.length).toBeGreaterThanOrEqual(3);
    for (const re of roundEnds.slice(0, 3)) {
      expect(re.practice).toBe(true);
      expect(re.placements).toHaveLength(4);
      const places = re.placements.map((p) => p.place).sort((a, b) => a - b);
      expect(places[0]).toBe(1);
    }
    // totals aggregate exactly like a human match
    const sum: Record<string, number> = {};
    for (const re of roundEnds) {
      for (const pl of re.placements) sum[pl.id] = (sum[pl.id] ?? 0) + pl.points;
    }
    expect(matchEnd!.totals).toEqual(sum);

    // afterwards the lobby unlocks again
    await until(() => lobby?.inMatch === false, 5000, 'lobby unlocked');
  }, 150_000);
});
