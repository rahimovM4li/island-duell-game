import { afterEach, describe, expect, it } from 'vitest';
import { io as connect, type Socket } from 'socket.io-client';
import { PROTOCOL_VERSION, type MatchStartMsg, type PartyErrorMsg, type PartyStateMsg, type SessionMsg } from '@shared/protocol';
import type { PlayerSkinId } from '@shared/multiplayer';
import { startServer, type StartedServer } from '../server/src/index';

interface TestClient {
  socket: Socket;
  name: string;
  skin: PlayerSkinId;
  session: SessionMsg | null;
  party: PartyStateMsg | null;
  partyStates: PartyStateMsg[];
  partyErrors: PartyErrorMsg[];
  matches: MatchStartMsg[];
  lobbies: Array<{
    roomId: string;
    status: string;
    players: unknown[];
    countdownEndsAt: number | null;
  }>;
}

let server: StartedServer | null = null;
let portSequence = 3230;
const sockets: Socket[] = [];

const until = async (predicate: () => boolean, label: string, timeout = 6_000): Promise<void> => {
  const started = Date.now();
  while (!predicate()) {
    if (Date.now() - started > timeout) throw new Error(`Timeout: ${label}`);
    await new Promise((resolve) => setTimeout(resolve, 15));
  }
};

async function client(name: string, skin: PlayerSkinId = 'lagoon'): Promise<TestClient> {
  const socket = connect(`http://127.0.0.1:${server!.port}`, {
    transports: ['websocket'],
    reconnection: false,
    forceNew: true,
  });
  sockets.push(socket);
  const result: TestClient = {
    socket,
    name,
    skin,
    session: null,
    party: null,
    partyStates: [],
    partyErrors: [],
    matches: [],
    lobbies: [],
  };
  socket.on('session', (message: SessionMsg) => { result.session = message; });
  socket.on('partyState', (message: PartyStateMsg | null) => {
    result.party = message;
    if (message) result.partyStates.push(message);
  });
  socket.on('partyError', (message: PartyErrorMsg) => { result.partyErrors.push(message); });
  socket.on('matchStart', (message: MatchStartMsg) => { result.matches.push(message); });
  socket.on('lobbyState', (message) => { result.lobbies.push(message); });
  await new Promise<void>((resolve, reject) => {
    socket.once('connect', resolve);
    socket.once('connect_error', reject);
  });
  return result;
}

function createParty(player: TestClient): void {
  player.socket.emit('createParty', {
    v: PROTOCOL_VERSION,
    name: player.name,
    skin: player.skin,
  });
}

function joinParty(player: TestClient, code: string, resumeToken?: string): void {
  player.socket.emit('joinPartyByCode', {
    v: PROTOCOL_VERSION,
    name: player.name,
    skin: player.skin,
    code,
    ...(resumeToken ? { resumeToken } : {}),
  });
}

function quickPlay(player: TestClient): void {
  player.socket.emit('quickPlay', {
    v: PROTOCOL_VERSION,
    name: player.name,
    skin: player.skin,
  });
}

afterEach(async () => {
  for (const socket of sockets.splice(0)) socket.disconnect();
  await server?.close();
  server = null;
});

describe('persistent code parties', () => {
  it('creates readable case-insensitive codes, enforces capacity/host rights, reconnects, migrates host and cleans up', async () => {
    const port = ++portSequence;
    server = await startServer(port, { countdownMs: 250, partyReconnectGraceMs: 500 });
    const host = await client('Host', 'lagoon');
    createParty(host);
    await until(() => !!host.party, 'party created');
    const code = host.party!.code;
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
    expect(host.party!.hostId).toBe(host.session!.playerId);

    const invalid = await client('Invalid', 'coral');
    joinParty(invalid, 'BAD999');
    await until(() => invalid.partyErrors.length > 0, 'invalid code rejected');
    expect(invalid.partyErrors.at(-1)?.reason).toMatch(/nicht gefunden/i);

    const guests = await Promise.all([
      client('Guest1', 'coral'),
      client('Guest2', 'jungle'),
      client('Guest3', 'sun'),
      client('Guest4', 'orchid'),
    ]);
    for (const guest of guests.slice(0, 3)) joinParty(guest, code.toLowerCase());
    await until(() => host.party?.members.length === 4, 'party reaches four members');
    host.socket.emit('updatePartySettings', { selection: 'quick', fillBots: true });
    await until(() => host.party?.fillBots === true, 'bot fill allowed for four members');
    joinParty(guests[3], code.toLowerCase());
    await until(() => host.party?.members.length === 5, 'party reaches five members');
    expect(new Set(host.party!.members.map((member) => member.id)).size).toBe(5);
    expect(host.party!.fillBots).toBe(false);

    guests[0].socket.emit('updatePartySettings', { selection: 'multiplayer', fillBots: false });
    await until(() => guests[0].partyErrors.some((error) => error.operation === 'settings'), 'guest settings rejected');
    expect(guests[0].partyErrors.at(-1)?.reason).toMatch(/nur der party-host/i);
    guests[0].socket.emit('startPartyQuickMatch');
    await until(() => guests[0].partyErrors.some((error) => error.operation === 'start'), 'guest start rejected');
    expect(guests[0].matches).toHaveLength(0);

    const overflow = await client('Overflow', 'lagoon');
    joinParty(overflow, code);
    await until(() => overflow.partyErrors.length > 0, 'full party rejected');
    expect(overflow.partyErrors.at(-1)?.reason).toMatch(/voll/i);

    const stableId = host.session!.playerId;
    const stableToken = host.session!.resumeToken;
    host.socket.disconnect();
    await until(
      () => guests.some((guest) => guest.party?.hostId !== stableId),
      'host migrated on disconnect',
    );
    const migratedHost = guests.find((guest) => guest.party?.hostId !== stableId)!.party!.hostId;
    expect(migratedHost).not.toBe(stableId);

    const replacement = await client('Host', 'lagoon');
    joinParty(replacement, code.toLowerCase(), stableToken);
    await until(() => replacement.session?.resumed === true, 'party reconnect');
    expect(replacement.session?.playerId).toBe(stableId);
    expect(replacement.party?.code).toBe(code);
    expect(replacement.party?.hostId).toBe(migratedHost);

    joinParty(overflow, 'GUESS2');
    await until(
      () => overflow.partyErrors.some((error) => /zu viele code-versuche/i.test(error.reason)),
      'join guessing rate limited',
    );

    for (const member of [...guests, replacement]) member.socket.emit('leaveParty');
    await until(() => server!.rooms.partyCount === 0, 'empty party cleanup');
    expect(server.rooms.partyCount).toBe(0);

    createParty(overflow);
    await until(() => overflow.party !== null, 'orphan party created');
    overflow.socket.disconnect();
    await until(() => server!.rooms.partyCount === 0, 'orphan party removed after grace', 2_000);
  });

  it('runs isolated private quick matches without bots and with normal non-training bot fill', async () => {
    const port = ++portSequence;
    server = await startServer(port, { countdownMs: 220, timeScale: 80, partyReconnectGraceMs: 500 });
    const host = await client('PrivateHost', 'lagoon');
    const guest = await client('PrivateGuest', 'coral');
    createParty(host);
    await until(() => !!host.party, 'private party created');
    joinParty(guest, host.party!.code);
    await until(() => host.party?.members.length === 2, 'private guest joined');

    host.socket.emit('updatePartySettings', { selection: 'quick', fillBots: false });
    host.socket.emit('startPartyQuickMatch');
    await until(() => host.matches.length === 1 && guest.matches.length === 1, 'private match without bots');
    expect(host.matches[0].players).toHaveLength(2);
    expect(host.matches[0].practice).not.toBe(true);

    const outsider = await client('PublicOutsider', 'jungle');
    quickPlay(outsider);
    await until(() => !!outsider.session?.roomId, 'outsider assigned');
    expect(outsider.session!.roomId).not.toBe(host.session!.roomId);

    host.socket.emit('leaveGame');
    await until(() => host.party?.queueStatus === 'idle' && !host.party.roomId, 'party survives first match');
    expect(server.rooms.partyCount).toBe(1);

    host.socket.emit('updatePartySettings', { selection: 'quick', fillBots: true });
    await until(() => host.party?.fillBots === true, 'bot fill enabled');
    host.socket.emit('startPartyQuickMatch');
    await until(() => host.matches.length === 2 && guest.matches.length === 2, 'private bot-filled match');
    const filled = host.matches[1];
    expect(filled.players).toHaveLength(5);
    expect(filled.players.filter((player) => player.id.startsWith('party-bot-'))).toHaveLength(3);
    expect(filled.practice).not.toBe(true);

    host.socket.emit('leaveGame');
    guest.socket.emit('leaveGame');
    await until(() => host.party?.queueStatus === 'idle', 'party returns after bot-filled match');
  });

  it('assigns a party atomically with singles, admits players during countdown, never adds bots, and cancels below two', async () => {
    const port = ++portSequence;
    server = await startServer(port, { countdownMs: 360, timeScale: 80, partyReconnectGraceMs: 500 });
    const single = await client('Single', 'lagoon');
    quickPlay(single);
    await until(() => !!single.session?.roomId, 'single queued');

    const host = await client('QueueHost', 'coral');
    const a = await client('QueueA', 'jungle');
    const b = await client('QueueB', 'sun');
    createParty(host);
    await until(() => !!host.party, 'queue party created');
    joinParty(a, host.party!.code);
    joinParty(b, host.party!.code);
    await until(() => host.party?.members.length === 3, 'queue party assembled');
    host.socket.emit('updatePartySettings', { selection: 'multiplayer', fillBots: true });
    await until(() => host.party?.selection === 'multiplayer', 'multiplayer selected');
    expect(host.party?.fillBots).toBe(false);
    host.socket.emit('startPartyQueue');
    await until(
      () => [host, a, b].every((entry) => entry.session?.roomId === single.session?.roomId),
      'party assigned atomically',
    );
    await until(() => host.party?.queueStatus === 'countdown', 'party countdown');

    const late = await client('LateJoin', 'orchid');
    quickPlay(late);
    await until(() => late.session?.roomId === single.session?.roomId, 'late player joins countdown');
    await until(() => host.matches.length === 1 && late.matches.length === 1, 'public match starts');
    expect(host.matches[0].players).toHaveLength(5);
    expect(host.matches[0].players.some((player) => player.id.startsWith('bot-'))).toBe(false);
    expect(host.matches[0].practice).not.toBe(true);

    const waitingA = await client('WaitingA', 'lagoon');
    const waitingB = await client('WaitingB', 'coral');
    quickPlay(waitingA);
    quickPlay(waitingB);
    await until(
      () => waitingA.lobbies.at(-1)?.status === 'countdown',
      'second room countdown starts',
    );
    waitingB.socket.disconnect();
    await until(
      () => waitingA.lobbies.at(-1)?.status === 'waiting'
        && waitingA.lobbies.at(-1)?.players.length === 1,
      'countdown cancels below two',
    );
    expect(waitingA.matches).toHaveLength(0);
  });

  it('uses a real 15-second authoritative public countdown by default', async () => {
    const port = ++portSequence;
    server = await startServer(port, { partyReconnectGraceMs: 500 });
    const a = await client('CountdownA', 'lagoon');
    const b = await client('CountdownB', 'coral');
    quickPlay(a);
    quickPlay(b);
    await until(() => a.lobbies.at(-1)?.status === 'countdown', 'default countdown');
    const remaining = (a.lobbies.at(-1)!.countdownEndsAt ?? 0) - Date.now();
    expect(remaining).toBeGreaterThan(14_000);
    expect(remaining).toBeLessThanOrEqual(15_050);
    b.socket.disconnect();
    await until(() => a.lobbies.at(-1)?.status === 'waiting', 'default countdown cancellation');
  });
});
