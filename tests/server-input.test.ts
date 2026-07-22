import { describe, expect, it } from 'vitest';
import type { InputMsg } from '@shared/protocol';
import {
  enqueueServerInput, inputForServerTick, MAX_SERVER_INPUT_QUEUE,
  neutralServerInput, SERVER_INPUT_DT, SERVER_INPUT_STALE_MS,
} from '../server/src/input';

function input(seq: number, overrides: Partial<InputMsg> = {}): InputMsg {
  return {
    ...neutralServerInput(seq),
    dt: 1 / 144,
    ...overrides,
  };
}

describe('authoritative server input', () => {
  it('uses one fixed movement step regardless of client packet rate or dt', () => {
    for (const rate of [30, 60, 144]) {
      const packets = Array.from({ length: Math.ceil(rate / 30) }, (_, i) =>
        input(i + 1, { dt: 1 / rate, mz: 1 }),
      );
      const tick = inputForServerTick(neutralServerInput(), packets, 100, 100);
      expect(tick.movement.dt).toBeCloseTo(SERVER_INPUT_DT);
      expect(tick.movement.mz).toBe(1);
      expect(tick.actions).toHaveLength(packets.length);
    }
  });

  it('keeps the latest held intent but retains short action pulses', () => {
    const packets = [
      input(10, { fire: true, reload: true }),
      input(11, { fire: false }),
    ];
    const tick = inputForServerTick(neutralServerInput(9), packets, 100, 100);
    expect(tick.movement.seq).toBe(11);
    expect(tick.movement.fire).toBe(false);
    expect(tick.movement.reload).toBeUndefined();
    expect(tick.actions[0].reload).toBe(true);
    expect(tick.actions.map((packet) => packet.fire)).toEqual([true, false]);
  });

  it('neutralizes held movement and combat after a short input timeout', () => {
    const previous = input(4, { mx: 1, sprint: true, fire: true, interact: true });
    const tick = inputForServerTick(previous, [], SERVER_INPUT_STALE_MS + 1, 0);
    expect(tick.movement).toMatchObject({
      seq: 4, mx: 0, mz: 0, sprint: false, fire: false, interact: false,
    });
  });

  it('rejects duplicate/out-of-order packets and caps memory', () => {
    const buffer = { queue: [] as InputMsg[], lastAcceptedSeq: 0 };
    expect(enqueueServerInput(buffer, input(2))).toBe(true);
    expect(enqueueServerInput(buffer, input(2))).toBe(false);
    expect(enqueueServerInput(buffer, input(1))).toBe(false);

    for (let seq = 3; seq < 3 + MAX_SERVER_INPUT_QUEUE + 5; seq += 1) {
      enqueueServerInput(buffer, input(seq));
    }
    expect(buffer.queue).toHaveLength(MAX_SERVER_INPUT_QUEUE);
    expect(buffer.lastAcceptedSeq).toBe(3 + MAX_SERVER_INPUT_QUEUE + 4);
  });
});
