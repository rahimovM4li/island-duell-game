import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { io, type Socket } from 'socket.io-client';
import { C2S, PROTOCOL_VERSION, S2C, type GameEvent, type LobbyStateMsg, type SnapshotMsg } from '../shared/src/protocol';

process.env.TIME_SCALE = '100';
const PORT = 3187;
const URL = `http://localhost:${PORT}`;

async function until(condition: () => boolean, label: string, timeoutMs = 15_000): Promise<void> {
  const started = Date.now();
  while (!condition()) {
    if (Date.now() - started > timeoutMs) throw new Error(`Timed out waiting for ${label}`);
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

describe('round Easter egg over real sockets', () => {
  let close: () => Promise<void>;
  const sockets: Socket[] = [];

  beforeAll(async () => {
    const { startServer } = await import('../server/src/index');
    close = (await startServer(PORT)).close;
  });

  afterAll(async () => {
    for (const socket of sockets) socket.disconnect();
    await close?.();
  });

  it('prevents damage, ends the round with two protected players, and resets next round', async () => {
    const ids = ['', ''];
    const activations = [0, 0];
    const roundStarts = [0, 0];
    const roundEnds = [0, 0];
    let snapshot: SnapshotMsg | null = null;
    let canStart = false;
    for (let i = 0; i < 2; i++) {
      const socket = io(URL, { transports: ['websocket'] });
      sockets.push(socket);
      socket.on(S2C.session, (msg: { playerId: string }) => { ids[i] = msg.playerId; });
      if (i === 0) socket.on(S2C.lobbyState, (msg: LobbyStateMsg) => { canStart = msg.canStart; });
      socket.on(S2C.roundStart, () => { roundStarts[i] += 1; });
      socket.on(S2C.roundEnd, () => { roundEnds[i] += 1; });
      socket.on(S2C.event, (events: GameEvent[]) => {
        activations[i] += events.filter((event) => event.type === 'easterEgg').length;
      });
      if (i === 0) socket.on(S2C.snapshot, (msg: SnapshotMsg) => { snapshot = msg; });
      await until(() => socket.connected, 'socket connection');
      socket.emit(C2S.join, { v: PROTOCOL_VERSION, name: `Egg${i}` });
      await until(() => ids[i] !== '', 'session');
    }
    sockets[1].emit(C2S.setReady, { ready: true });
    await until(() => canStart, 'ready lobby');
    sockets[0].emit(C2S.startMatch, { mode: 'classic' });
    await until(() => roundStarts.every((count) => count === 1), 'first round');

    for (const socket of sockets) socket.emit(C2S.activateEasterEgg);
    await until(() => activations.every((count) => count === 1), 'activation confirmations');
    await until(() => snapshot !== null && snapshot.t >= 450, 'late zone snapshot');
    const players = (snapshot as SnapshotMsg).players;
    for (const id of ids) {
      const player = players.find((entry) => entry.id === id);
      expect(player?.alive).toBe(true);
      expect(player?.hp).toBe(100);
    }

    await until(() => roundEnds.every((count) => count === 1), 'first round end');
    await until(() => roundStarts.every((count) => count === 2), 'next round');
    sockets[0].emit(C2S.activateEasterEgg);
    await until(() => activations[0] === 2, 'next-round activation');
  }, 25_000);
});
