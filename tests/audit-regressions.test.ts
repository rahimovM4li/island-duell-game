import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import { GameRoom } from '../server/src/game';
import { neutralServerInput } from '../server/src/input';
import { GamePhysics } from '@shared/physics';
import { generateWorld } from '@shared/worldgen';
import { sampleHeight } from '@shared/terrain';
import { MAX_BANDAGES } from '@shared/constants';

// Exercise authoritative transitions directly; only transport is replaced.
// Private access keeps this harness out of the production API.
const rooms: GameRoom[] = [];
function harness() {
  const messages: { event: string; data: any }[] = [];
  const emit = (event: string, data: unknown) => messages.push({ event, data: structuredClone(data) });
  const room = new GameRoom({ to: () => ({ emit }) } as never, RAPIER) as any;
  rooms.push(room);
  room.phys = { raycast: () => null, dispose: () => {} };
  room.gen = generateWorld(812, 2);
  const player = room.freshMatchPlayer('a', 'Alice', false);
  const handlers = new Map<string, (...args: any[]) => void>();
  const socket = { id: 'socket-a', data: { playerId: 'a' }, emit, on: (name: string, fn: any) => handlers.set(name, fn) };
  room.players.set('a', player);
  room.conns.set('a', { id: 'a', name: 'Alice', skin: 'lagoon', connected: true, ready: true, socket });
  room.hostId = 'a';
  return { room, player, messages, socket, handlers };
}

beforeAll(async () => { await RAPIER.init(); });
afterEach(() => { rooms.splice(0).forEach(room => room.dispose()); vi.restoreAllMocks(); });

describe('combat and inventory regressions', () => {
  it('ignores empty slot requests without cancelling a reload or releasing a held frag', () => {
    const { room, player } = harness();
    room.phys.setPlayerStance = () => {};
    room.phys.moveCharacter = () => ({ pos: player.move.pos, grounded: true });
    player.connected = true;
    player.inv.primary = { type: 'rifle', mag: 0 };
    player.inv.secondary = null;
    player.inv.active = 2;
    player.inv.throwables = { frag: 0, smoke: 0, flash: 0 };
    player.inv.ammo.rifle = 20;
    room.tryReload(player);
    const deadline = player.reloadUntil;
    expect(deadline).toBeGreaterThan(0);
    for (const slot of [3, 4]) {
      player.inputBuffer.queue = [{ ...neutralServerInput(slot), slot }];
      room.processPlayerInputs(player, [], 0);
      expect(player.inv.active).toBe(2);
      expect(player.reloadUntil).toBe(deadline);
    }
    player.inv.primary = null;
    player.inv.active = 4;
    player.cookingSince = 0;
    player.prevFire = true;
    const release = vi.spyOn(room, 'releaseCookedFrag');
    player.inputBuffer.queue = [{ ...neutralServerInput(5), slot: 2, fire: true }];
    room.processPlayerInputs(player, [], 0);
    expect(player.inv.active).toBe(4);
    expect(release).not.toHaveBeenCalled();
  });
  it('starts with a permanent knife that stabs once per cooldown and respects cover/range', () => {
    const { room, player } = harness();
    expect(player.inv.active).toBe(1);
    expect(room.activeWeapon(player)).toMatchObject({ type: 'knife', slotState: null });
    player.move.pos = { x: 0, y: 0, z: 0 };
    player.yaw = 0;
    player.pitch = Math.atan2(-0.7, 1.2);
    const target = room.freshMatchPlayer('b', 'Bob', false);
    target.move.pos = { x: 0, y: 0, z: -1.2 };
    room.players.set(target.id, target);
    room.t = 10;
    room.tryFire(player, []);
    expect(target.hp).toBe(65);
    room.tryFire(player, []);
    expect(target.hp).toBe(65);
    room.t = 11;
    room.phys.raycast = () => ({ dist: 0.4 });
    room.tryFire(player, []);
    expect(target.hp).toBe(65);
    room.t = 12;
    room.phys.raycast = () => null;
    target.move.pos.z = -5;
    room.tryFire(player, []);
    expect(target.hp).toBe(65);
    expect(room.dropSelectedWeapon(player)).toBe(false);
  });
  it('finishes an empty-magazine reload while fire remains held', () => {
    const { room, player } = harness();
    player.inv.active = 2;
    player.inv.primary = { type: 'rifle', mag: 0 };
    player.inv.ammo.rifle = 60;
    for (let tick = 0; tick < 150; tick++) {
      room.t = tick / 30;
      room.tryFire(player, []);
      room.updateHealsAndTimers(1 / 30, []);
    }
    expect(player.stats.shotsFired).toBeGreaterThan(0);
  });

  it('still permits firing a loaded weapon to interrupt a manual reload', () => {
    const { room, player } = harness();
    player.inv.active = 2;
    player.inv.primary = { type: 'rifle', mag: 3 };
    player.inv.ammo.rifle = 20;
    room.t = 1;
    room.tryReload(player);
    room.tryFire(player, []);
    expect(player.inv.primary.mag).toBe(2);
    expect(player.reloadUntil).toBe(0);
  });

  it('does not transfer a pistol reload to a swapped sniper', () => {
    const { room, player } = harness();
    player.inv.active = 2;
    player.inv.primary = { type: 'pistol', mag: 0 };
    player.inv.secondary = { type: 'pistol', mag: 0 };
    player.inv.ammo.pistol = 30;
    player.inv.ammo.sniper = 10;
    room.t = 10;
    room.tryReload(player);
    const deadline = player.reloadUntil;
    player.move.pos = { x: 4, y: sampleHeight(room.gen.params, 4, 6), z: 6 };
    room.pickups.set('swap', { id: 'swap', item: 'sniper', weaponMag: 0, ...player.move.pos });
    room.t = deadline - 0.01;
    room.handleInteract(player, { ...neutralServerInput(), interact: true }, [], true);
    room.t = deadline;
    room.updateHealsAndTimers(0.01, []);
    expect(player.inv.primary).toEqual({ type: 'sniper', mag: 0 });
    expect(player.reloadUntil).toBe(0);
  });

  it('does not reload a holstered weapon while the throwable slot is active', () => {
    const { room, player } = harness();
    player.inv.active = 4;
    player.inv.secondary = { type: 'sniper', mag: 0 };
    player.inv.ammo.sniper = 10;
    room.tryReload(player);
    expect(player.reloadUntil).toBe(0);
  });

  it('rejects bandage crafting at capacity without spending materials', () => {
    const { room, player, messages } = harness();
    player.inv.bandages = MAX_BANDAGES;
    player.inv.mats.fiber = 4;
    room.tryCraft(player.id, 'bandage');
    expect(player.inv.mats.fiber).toBe(4);
    expect(player.craftRecipe).toBeNull();
    expect(messages.at(-1)?.data[0]).toMatchObject({ type: 'craft', ok: false });
  });

  it('refunds crafting if a pickup fills the bandage inventory before completion', () => {
    const { room, player } = harness();
    player.inv.bandages = MAX_BANDAGES - 1;
    player.inv.mats.fiber = 4;
    room.tryCraft(player.id, 'bandage');
    player.inv.bandages = MAX_BANDAGES;
    room.t = player.craftDoneAt;
    const events: any[] = [];
    room.updateHealsAndTimers(1, events);
    expect(player.inv.mats.fiber).toBe(4);
    expect(events).toContainEqual(expect.objectContaining({ type: 'craft', ok: false }));
  });
});

describe('round lifecycle regressions', () => {
  function duel() {
    const h = harness();
    const opponent = h.room.freshMatchPlayer('b', 'Bob', false);
    h.room.players.set('b', opponent);
    h.room.inMatch = true;
    h.room.n = 2;
    h.room.seed = 1;
    h.room.round = 1;
    h.room.roundActive = true;
    h.room.totals = new Map([['a', 0], ['b', 0]]);
    h.room.matchStats = new Map([['a', h.room.freshStats()], ['b', h.room.freshStats()]]);
    return { ...h, opponent };
  }

  it('awards a forfeited duel to the remaining player and retains current stats', () => {
    const { room, player, messages } = duel();
    player.connected = false;
    player.stats.damageDealt = 90;
    room.totals.set('a', 3); // a quitter cannot win by protecting an old lead
    room.endMatchEarly();
    const result = messages.find(m => m.event === 'matchEnd')!.data;
    expect(result.winnerId).toBe('b');
    expect(result.standings[0].id).toBe('b');
    expect(result.stats.a.damageDealt).toBe(90);
  });

  it('does not count a completed round twice when someone leaves during the pause', () => {
    const { room, player, messages } = duel();
    player.stats.damageDealt = 90;
    room.eliminationGroups = [['a'], ['b']];
    room.endRound();
    player.connected = false;
    room.endMatchEarly();
    expect(messages.find(m => m.event === 'matchEnd')!.data.stats.a.damageDealt).toBe(90);
  });

  it('cleans up an abandoned match without inventing a winner', () => {
    const { room, player, opponent, messages } = duel();
    player.connected = opponent.connected = false;
    room.endMatchEarly();
    expect(messages.some(m => m.event === 'matchEnd')).toBe(false);
    expect(room.started).toBe(false);
  });

  it('preserves a final result already earned before a player disconnects', () => {
    const { room, player, messages } = duel();
    room.round = 3;
    room.eliminationGroups = [['b'], ['a']];
    room.endRound();
    player.connected = false;
    room.endMatchEarly();
    expect(messages.find(m => m.event === 'matchEnd')!.data.winnerId).toBe('a');
  });

  it('uses the same tiebreak winner in the result and standings', () => {
    const { room, messages } = duel();
    room.seed = 0; // seeded winner is b, insertion order starts with a
    room.endMatch();
    const result = messages.find(m => m.event === 'matchEnd')!.data;
    expect(result.standings[0].id).toBe(result.winnerId);
  });

  it('resumes the actual round pause, result and depleted resources', () => {
    const { room, socket, player, messages } = duel();
    room.matchRoster = [];
    room.currentSpawns = { a: 0, b: 1 };
    room.nodeCharges.set(42, 0);
    room.eliminationGroups = [['a'], ['b']];
    room.endRound();
    messages.length = 0;
    room.resumeMatchFor({ id: player.id, socket });
    expect(messages.find(m => m.event === 'roundStart')!.data).toMatchObject({ active: false, depletedNodeIds: [42] });
    expect(messages.find(m => m.event === 'roundEnd')!.data).toMatchObject({ round: 1, resumed: true });
  });

  it('starts another training match with the previous bot settings on rematch', () => {
    const { room, socket, handlers, messages } = harness();
    room.kind = 'training';
    room.registerSocketEvents(socket);
    room.startPractice(2, 'hard', 'quick');
    room.endMatch();
    messages.length = 0;
    handlers.get('rematch')!();
    expect(room.started).toBe(true);
    expect(messages.find(m => m.event === 'matchStart')!.data).toMatchObject({ n: 3, practice: true, mode: 'quick' });
    expect(room.botDifficulty).toBe('hard');
  });

  it('sends 20 snapshots per second on a 30 Hz simulation', () => {
    const { room, messages } = harness();
    room.players.clear();
    room.phys.step = () => {};
    room.roundActive = true;
    room.lastTickAt = 0;
    for (const method of ['tickBots', 'recordPlayerHistory', 'updateProjectiles', 'updateZoneDamage',
      'updateHealsAndTimers', 'updateSmokes', 'updateCarePackage', 'updatePickupsWalkover',
      'updatePings', 'announceZoneSteps', 'flushDeaths', 'checkRoundEnd']) room[method] = () => {};
    const now = vi.spyOn(Date, 'now');
    for (let tick = 1; tick <= 300; tick++) {
      now.mockReturnValue(tick * 1000 / 30);
      room.tick();
    }
    const count = messages.filter(m => m.event === 'snapshot').length;
    expect(count).toBeGreaterThanOrEqual(199);
    expect(count).toBeLessThanOrEqual(200);
  });
});

it('removes harvested tree collisions and restores them for the next round', () => {
  const { room, player } = harness();
  const tree = room.gen.vegetation.find((v: any) => v.kind === 'tree' && v.colliderRadius > 0);
  room.phys = new GamePhysics(RAPIER, room.gen);
  try {
    room.phys.step();
    player.move.pos = { x: tree.x + 1, y: tree.y, z: tree.z };
    room.nodeCharges.set(tree.id, 1);
    const cast = () => room.phys.raycast({ x: tree.x - 2, y: tree.y + 2, z: tree.z }, { x: 1, y: 0, z: 0 }, 4);
    expect(cast()).not.toBeNull();
    player.harvestNodeId = tree.id;
    player.harvestProgress = 100;
    room.handleInteract(player, { ...neutralServerInput(), interact: true }, []);
    room.phys.step();
    expect(cast()).toBeNull();
    room.phys.resetResourceNodes();
    room.phys.step();
    expect(cast()).not.toBeNull();
  } finally { room.phys.dispose(); }
});
