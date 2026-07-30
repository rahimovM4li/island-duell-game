import { describe, expect, it } from 'vitest';
import { generateWorld } from '@shared/worldgen';
import type { PickupInfo, WeaponSlotState } from '@shared/protocol';
import { GameRoom } from '../server/src/game';

interface TestPlayer {
  id: string;
  isBot: boolean;
  yaw: number;
  reloadUntil: number;
  move: {
    pos: { x: number; y: number; z: number };
    prone: boolean;
    sneaking: boolean;
  };
  inv: {
    primary: WeaponSlotState | null;
    secondary: WeaponSlotState | null;
    active: 1 | 2 | 3;
    ammo: { pistol: number; rifle: number; shell: number; sniper: number };
  };
}

describe('authoritative selected-weapon drop', () => {
  it('creates one temporarily locked world pickup in front of the player', () => {
    const room = new GameRoom(
      { on: () => undefined, emit: () => undefined } as never,
      {} as never,
    );
    const gen = generateWorld(812, 2);
    const internals = room as unknown as {
      gen: typeof gen;
      phys: { raycast(): null };
      tickCounter: number;
      pickups: Map<string, PickupInfo>;
      pickupLocks: Map<string, {
        ownerId: string;
        pickupReadyTick: number;
        ownerReadyTick: number;
      }>;
      players: Map<string, TestPlayer>;
      freshMatchPlayer(id: string, name: string, isBot: boolean): TestPlayer;
      dropSelectedWeapon(player: TestPlayer): boolean;
    };
    internals.gen = gen;
    internals.phys = { raycast: () => null };
    internals.tickCounter = 10;

    const player = internals.freshMatchPlayer('dropper', 'Dropper', true);
    player.move.pos = { x: 4, y: 3, z: 6 };
    player.yaw = 0;
    player.inv.primary = { type: 'rifle', mag: 9 };
    player.inv.secondary = { type: 'machete', mag: 0 };
    player.inv.active = 1;
    internals.players.set(player.id, player);

    expect(internals.dropSelectedWeapon(player)).toBe(true);

    expect(player.inv.primary).toBeNull();
    expect(player.inv.secondary?.type).toBe('machete');
    expect(player.inv.active).toBe(2);
    const pickup = [...internals.pickups.values()].at(-1);
    expect(pickup).toMatchObject({
      item: 'rifle',
      weaponMag: 9,
      x: 4,
      z: 4,
      droppedBy: 'dropper',
      dropOrigin: { x: 4, y: 4.12, z: 6 },
    });
    expect(internals.pickupLocks.get(pickup!.id)).toMatchObject({
      ownerId: 'dropper',
    });
    expect(internals.pickupLocks.get(pickup!.id)!.pickupReadyTick).toBeGreaterThan(10);
    expect(internals.pickupLocks.get(pickup!.id)!.ownerReadyTick)
      .toBeGreaterThan(internals.pickupLocks.get(pickup!.id)!.pickupReadyTick);
  });
});
