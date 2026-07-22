import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { io, type Socket } from 'socket.io-client';
import { PROTOCOL_VERSION, type LobbyStateMsg } from '../shared/src/protocol';

const PORT = 3182;
const URL = `http://localhost:${PORT}`;

interface LobbyClient {
  socket: Socket;
  id: string;
  lobby: LobbyStateMsg | null;
  kickedReason: string | null;
}

function client(name: string): LobbyClient {
  const socket = io(URL, { transports: ['websocket'], reconnection: false });
  const state: LobbyClient = { socket, id: '', lobby: null, kickedReason: null };
  socket.on('connect', () => socket.emit('join', { v: PROTOCOL_VERSION, name }));
  socket.on('session', (msg: { playerId: string }) => { state.id = msg.playerId; });
  socket.on('lobbyState', (msg: LobbyStateMsg) => { state.lobby = msg; });
  socket.on('kicked', (msg: { reason: string }) => { state.kickedReason = msg.reason; });
  return state;
}

function until(check: () => boolean, description: string, timeoutMs = 4_000): Promise<void> {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      if (check()) { clearInterval(timer); resolve(); }
      else if (Date.now() - started > timeoutMs) {
        clearInterval(timer);
        reject(new Error(`timeout waiting for ${description}`));
      }
    }, 20);
  });
}

describe('lobby leave and host kick', () => {
  let close: () => Promise<void>;
  const clients: LobbyClient[] = [];

  beforeAll(async () => {
    const { startServer } = await import('../server/src/index');
    ({ close } = await startServer(PORT));
  });

  afterAll(async () => {
    clients.forEach((entry) => entry.socket.disconnect());
    await close?.();
  });

  it('rejects non-host kicks, lets the host kick, and migrates host after leaving', async () => {
    clients.push(client('Host'), client('Guest'), client('KickTarget'));
    await until(() => clients.every((entry) => entry.id && entry.lobby?.players.length === 3), 'three-player lobby');
    const host = clients.find((entry) => entry.lobby?.players.find((player) => player.id === entry.id)?.isHost)!;
    const guests = clients.filter((entry) => entry !== host);

    guests[0].socket.emit('kickPlayer', { playerId: guests[1].id });
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(host.lobby?.players).toHaveLength(3);
    expect(guests[1].socket.connected).toBe(true);

    host.socket.emit('kickPlayer', { playerId: guests[1].id });
    await until(() => guests[1].kickedReason !== null, 'kick reason');
    await until(() => host.lobby?.players.length === 2, 'kicked player removed');
    expect(guests[1].kickedReason).toMatch(/Host/i);

    host.socket.emit('leaveGame');
    await until(() => guests[0].lobby?.players.length === 1, 'host removed immediately');
    expect(guests[0].lobby?.players[0]).toMatchObject({ id: guests[0].id, isHost: true });
  });
});
