import { describe, expect, it } from 'vitest';
import { GameRoom } from '../server/src/game';
import { generateWorld } from '@shared/worldgen';
import type { PickupInfo } from '@shared/protocol';

describe('helmet crate loot', () => {
  it('guarantees one helmet from the first opened top crate each round', () => {
    const room = new GameRoom(
      { on: () => undefined, emit: () => undefined } as never,
      {} as never,
    );
    const gen = generateWorld(717, 3);
    const internals = room as unknown as {
      gen: typeof gen;
      roundActive: boolean;
      pickups: Map<string, PickupInfo>;
      openCrate(pickup: PickupInfo): void;
    };
    internals.gen = gen;
    internals.roundActive = false;
    const topCrates = gen.crates.filter((crate) => crate.tier === 'top');
    expect(topCrates.length).toBeGreaterThanOrEqual(2);

    for (const crate of topCrates.slice(0, 2)) {
      internals.openCrate({
        id: crate.id,
        item: 'crate',
        tier: 'top',
        x: crate.x,
        y: 0,
        z: crate.z,
      });
    }

    expect([...internals.pickups.values()].filter((pickup) =>
      pickup.item === 'helmetItem')).toHaveLength(1);
  });
});
