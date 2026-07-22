import { SERVER_TICK_HZ } from '@shared/constants';
import type { InputMsg } from '@shared/protocol';

export const SERVER_INPUT_DT = 1 / SERVER_TICK_HZ;
export const SERVER_INPUT_STALE_MS = 250;
export const MAX_SERVER_INPUT_QUEUE = 12;

export interface ServerInputBuffer {
  queue: InputMsg[];
  lastAcceptedSeq: number;
}

/**
 * Accept only monotonically increasing input packets and keep a hard memory cap.
 * A sequence is consumed even when the queue is full, so a packet flood cannot
 * replay older actions after the server drains the queue.
 */
export function enqueueServerInput(buffer: ServerInputBuffer, input: InputMsg): boolean {
  if (input.seq <= buffer.lastAcceptedSeq) return false;
  buffer.lastAcceptedSeq = input.seq;
  if (buffer.queue.length >= MAX_SERVER_INPUT_QUEUE) return false;
  buffer.queue.push(input);
  return true;
}

export function neutralServerInput(seq = 0, yaw = 0, pitch = 0): InputMsg {
  return {
    seq,
    dt: SERVER_INPUT_DT,
    mx: 0,
    mz: 0,
    yaw,
    pitch,
    sprint: false,
    sneak: false,
    prone: false,
    aim: false,
    jump: false,
    fire: false,
    interact: false,
  };
}

export interface ServerTickInput {
  /** Exactly one movement input, always using the authoritative fixed dt. */
  movement: InputMsg;
  /** Original packets, retained so short action edges are not lost. */
  actions: InputMsg[];
}

/** Build one authoritative input sample for a server simulation tick. */
export function inputForServerTick(
  previous: InputMsg,
  queue: InputMsg[],
  nowMs: number,
  lastInputAtMs: number,
): ServerTickInput {
  const actions = queue.slice();
  const latest = actions.at(-1) ?? previous;
  const stale = actions.length === 0 && nowMs - lastInputAtMs > SERVER_INPUT_STALE_MS;
  const source = stale
    ? neutralServerInput(latest.seq, latest.yaw, latest.pitch)
    : latest;

  return {
    actions,
    movement: {
      ...source,
      dt: SERVER_INPUT_DT,
      // Edge-triggered actions are replayed from `actions`, never held here.
      slot: undefined,
      reload: undefined,
      throwCycle: undefined,
    },
  };
}
