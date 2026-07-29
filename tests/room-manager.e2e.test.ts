import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { io, type Socket } from 'socket.io-client';
import {
  PROTOCOL_VERSION,
  type LobbyStateMsg,
  type GameEvent,
  type MatchStartMsg,
  type SessionMsg,
  type SnapshotMsg,
} from '@shared/protocol';
import type { PlayerSkinId } from '@shared/multiplayer';

const PORT = 3187;
const URL = `http://127.0.0.1:${PORT}`;

interface TestClient {
  socket: Socket;
  session: SessionMsg | null;
  lobby: LobbyStateMsg | null;
  match: MatchStartMsg | null;
  snapshots: SnapshotMsg[];
  events: GameEvent[];
  errors: string[];
}

function makeClient(): TestClient {
  const socket = io(URL, { reconnection: false });
  const client: TestClient = {
    socket,
    session: null,
    lobby: null,
    match: null,
    snapshots: [],
    events: [],
    errors: [],
  };
  socket.on('session', (message: SessionMsg) => { client.session = message; });
  socket.on('lobbyState', (message: LobbyStateMsg) => { client.lobby = message; });
  socket.on('matchStart', (message: MatchStartMsg) => { client.match = message; });
  socket.on('snapshot', (message: SnapshotMsg) => { client.snapshots.push(message); });
  socket.on('event', (messages: GameEvent | GameEvent[]) => {
    client.events.push(...(Array.isArray(messages) ? messages : [messages]));
  });
  socket.on('joinError', (message: { reason: string }) => client.errors.push(message.reason));
  return client;
}

function quick(client: TestClient, name: string, skin: PlayerSkinId = 'lagoon', resumeToken?: string): void {
  client.socket.emit('quickPlay', {
    v: PROTOCOL_VERSION,
    name,
    skin,
    ...(resumeToken ? { resumeToken } : {}),
  });
}

function until(check: () => boolean, label: string, timeout = 6_000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const handle = setInterval(() => {
      if (check()) {
        clearInterval(handle);
        resolve();
      } else if (Date.now() - start > timeout) {
        clearInterval(handle);
        reject(new Error(`timeout: ${label}`));
      }
    }, 15);
  });
}

describe('RoomManager public matchmaking', () => {
  let close: () => Promise<void>;
  let roomCount: () => number;
  const clients: TestClient[] = [];

  beforeAll(async () => {
    const { startServer } = await import('../server/src/index');
    // Keep the accelerated countdown long enough that a parallel Vitest run
    // can enqueue a full six-client burst before the first room starts.
    const server = await startServer(PORT, { countdownMs: 1_500 });
    close = server.close;
    roomCount = () => server.rooms.roomCount;
  });

  afterAll(async () => {
    clients.forEach((client) => client.socket.disconnect());
    await close?.();
  });

  it('answers health and accepts configured browser origins only', async () => {
    const response = await fetch(`${URL}/health`);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true });
  });

  it('assigns two clients to one open room and deduplicates repeated Quick Play', async () => {
    const a = makeClient();
    const b = makeClient();
    clients.push(a, b);
    await until(() => a.socket.connected && b.socket.connected, 'initial socket connect');
    quick(a, 'Ayla', 'coral');
    quick(a, 'Ayla', 'coral');
    quick(b, 'Borin', 'jungle');
    await until(() => !!a.session && !!b.session && a.lobby?.players.length === 2, 'shared room');
    expect(a.session?.roomId).toBe(b.session?.roomId);
    expect(a.lobby?.players.filter((player) => player.name === 'Ayla')).toHaveLength(1);
    expect(a.lobby?.players.find((player) => player.name === 'Ayla')?.skin).toBe('coral');
  });

  it('starts automatically, isolates a second room, and rejects late assignment to the started room', async () => {
    const [a, b] = clients.slice(0, 2);
    await until(() => !!a.match && !!b.match, 'first room match start');
    const firstRoom = a.session!.roomId;
    const c = makeClient();
    const d = makeClient();
    clients.push(c, d);
    await until(() => c.socket.connected && d.socket.connected, 'second socket pair');
    quick(c, 'Cleo', 'sun');
    quick(d, 'Dario', 'orchid');
    await until(() => !!c.session && !!d.session && !!c.match && !!d.match, 'second room match start');
    expect(c.session!.roomId).toBe(d.session!.roomId);
    expect(c.session!.roomId).not.toBe(firstRoom);
    await until(() => a.snapshots.length > 0 && c.snapshots.length > 0, 'room snapshots');
    const firstRoster = new Set(a.match!.players.map((player) => player.id));
    const secondRoster = new Set(c.match!.players.map((player) => player.id));
    expect(a.snapshots.at(-1)!.players.every((player) => firstRoster.has(player.id))).toBe(true);
    expect(c.snapshots.at(-1)!.players.every((player) => secondRoster.has(player.id))).toBe(true);
    expect([...firstRoster].some((id) => secondRoster.has(id))).toBe(false);

    a.socket.emit('input', {
      seq: 1,
      dt: 0.033,
      mx: 0,
      mz: 0,
      yaw: 0,
      pitch: 0,
      sprint: false,
      sneak: false,
      aim: false,
      jump: false,
      fire: true,
      interact: false,
    });
    await until(
      () => a.events.some((event) => event.type === 'melee' && event.by === a.session!.playerId),
      'room-scoped combat event',
    );
    expect(c.events.some((event) =>
      'by' in event && event.by === a.session!.playerId)).toBe(false);
  });

  it('creates another room instead of overfilling an open five-player room', async () => {
    const group = Array.from({ length: 6 }, () => makeClient());
    clients.push(...group);
    await until(() => group.every((client) => client.socket.connected), 'full-room clients connected');
    group.forEach((client, index) => quick(client, `Full${index + 1}`));
    await until(() => group.every((client) => !!client.session), 'full-room assignment');
    const firstRoom = group[0].session!.roomId;
    expect(group.slice(0, 5).every((client) => client.session!.roomId === firstRoom)).toBe(true);
    expect(group[5].session!.roomId).not.toBe(firstRoom);
    group.forEach((client) => client.socket.disconnect());
  });

  it('returns a reconnecting player to the same room and identity', async () => {
    const a = clients[0];
    const stableId = a.session!.playerId;
    const stableRoom = a.session!.roomId;
    const token = a.session!.resumeToken;
    a.socket.disconnect();
    await until(() => a.socket.disconnected, 'disconnect');
    const replacement = makeClient();
    clients.push(replacement);
    await until(() => replacement.socket.connected, 'replacement connected');
    quick(replacement, 'Ayla', 'coral', token);
    await until(() => replacement.session?.resumed === true, 'resumed session');
    expect(replacement.session).toMatchObject({ playerId: stableId, roomId: stableRoom, resumed: true });
    expect(replacement.match?.players.some((player) => player.id === stableId)).toBe(true);
  });

  it('rejects invalid profiles and suffixes duplicate names in one room', async () => {
    const invalidName = makeClient();
    const invalidSkin = makeClient();
    clients.push(invalidName, invalidSkin);
    await until(() => invalidName.socket.connected && invalidSkin.socket.connected, 'invalid clients connected');
    invalidName.socket.emit('quickPlay', { v: PROTOCOL_VERSION, name: '!', skin: 'lagoon' });
    invalidSkin.socket.emit('quickPlay', { v: PROTOCOL_VERSION, name: 'ValidName', skin: 'gold-paid' });
    await until(() => invalidName.errors.length > 0 && invalidSkin.errors.length > 0, 'profile errors');
    expect(invalidName.session).toBeNull();
    expect(invalidSkin.session).toBeNull();

    const e = makeClient();
    const f = makeClient();
    clients.push(e, f);
    await until(() => e.socket.connected && f.socket.connected, 'duplicate clients');
    quick(e, 'Echo');
    quick(f, 'Echo');
    await until(() => e.lobby?.players.length === 2, 'duplicate names assigned');
    expect(new Set(e.lobby!.players.map((player) => player.name)).size).toBe(2);
    expect(e.lobby!.players.some((player) => player.name === 'Echo-2')).toBe(true);
  });

  it('cancels a countdown below the minimum and removes empty rooms', async () => {
    const e = clients.at(-2)!;
    const f = clients.at(-1)!;
    await until(() => e.lobby?.status === 'countdown', 'countdown active');
    f.socket.disconnect();
    await until(() => e.lobby?.status === 'waiting', 'countdown cancelled');
    expect(e.lobby?.countdownEndsAt).toBeNull();
    const before = roomCount();
    e.socket.disconnect();
    await until(() => roomCount() < before, 'empty room cleanup');
  });
});
