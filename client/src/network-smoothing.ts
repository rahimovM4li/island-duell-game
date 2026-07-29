import { MAX_LAG_COMPENSATION_MS } from '@shared/constants';

export const MIN_INTERPOLATION_DELAY_MS = 75;
export const MAX_INTERPOLATION_DELAY_MS = 185;
export const MAX_REMOTE_EXTRAPOLATION_MS = 85;

export type ConnectionQuality = 'excellent' | 'good' | 'unstable' | 'poor';

export interface RemoteTransformSample {
  at: number;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  vx: number;
  vy: number;
  vz: number;
}

export interface SampledRemoteTransform {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  extrapolatedMs: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/**
 * Keep two snapshots in hand on a clean 20-Hz connection, then add headroom
 * only when jitter or measured loss makes that necessary.
 */
export function targetInterpolationDelayMs(jitterMs: number, lossPct: number): number {
  const jitterHeadroom = clamp(Math.max(0, jitterMs) * 1.8, 0, 72);
  const lossHeadroom = clamp(Math.max(0, lossPct) * 3.2, 0, 38);
  return clamp(
    MIN_INTERPOLATION_DELAY_MS + jitterHeadroom + lossHeadroom,
    MIN_INTERPOLATION_DELAY_MS,
    MAX_INTERPOLATION_DELAY_MS,
  );
}

export function smoothInterpolationDelay(
  currentMs: number,
  targetMs: number,
  dt: number,
): number {
  const responsiveness = targetMs > currentMs ? 6 : 1.8;
  const blend = 1 - Math.exp(-Math.max(0, dt) * responsiveness);
  return currentMs + (targetMs - currentMs) * blend;
}

/**
 * The target shown to the shooter is already interpolationDelayMs old. Add
 * one-way network travel, then clamp so a client can never request an
 * excessive historical advantage.
 */
export function recommendedShotRewindMs(interpolationDelayMs: number, rttMs: number): number {
  return clamp(
    Math.max(0, interpolationDelayMs) + Math.max(0, rttMs) * 0.5,
    MIN_INTERPOLATION_DELAY_MS,
    MAX_LAG_COMPENSATION_MS,
  );
}

export function classifyConnectionQuality(
  rttMs: number,
  jitterMs: number,
  lossPct: number,
): ConnectionQuality {
  if (lossPct >= 8 || jitterMs >= 55 || rttMs >= 220) return 'poor';
  if (lossPct >= 3 || jitterMs >= 30 || rttMs >= 140) return 'unstable';
  if (lossPct >= 1 || jitterMs >= 15 || rttMs >= 80) return 'good';
  return 'excellent';
}

function shortestYawDelta(from: number, to: number): number {
  let delta = to - from;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}

/** Interpolate buffered snapshots and extrapolate through at most one short loss gap. */
export function sampleRemoteTransform(
  samples: readonly RemoteTransformSample[],
  renderAt: number,
): SampledRemoteTransform | null {
  if (samples.length === 0) return null;
  const first = samples[0];
  const last = samples[samples.length - 1];
  if (renderAt >= last.at) {
    const extrapolatedMs = clamp(renderAt - last.at, 0, MAX_REMOTE_EXTRAPOLATION_MS);
    const seconds = extrapolatedMs / 1000;
    return {
      x: last.x + last.vx * seconds,
      y: last.y + last.vy * seconds,
      z: last.z + last.vz * seconds,
      yaw: last.yaw,
      pitch: last.pitch,
      extrapolatedMs,
    };
  }
  if (renderAt <= first.at) {
    return { ...first, extrapolatedMs: 0 };
  }
  let a = first;
  let b = last;
  for (let index = 0; index < samples.length - 1; index += 1) {
    if (samples[index].at <= renderAt && samples[index + 1].at >= renderAt) {
      a = samples[index];
      b = samples[index + 1];
      break;
    }
  }
  const span = Math.max(0.001, b.at - a.at);
  const alpha = clamp((renderAt - a.at) / span, 0, 1);
  const lerp = (from: number, to: number): number => from + (to - from) * alpha;
  return {
    x: lerp(a.x, b.x),
    y: lerp(a.y, b.y),
    z: lerp(a.z, b.z),
    yaw: a.yaw + shortestYawDelta(a.yaw, b.yaw) * alpha,
    pitch: lerp(a.pitch, b.pitch),
    extrapolatedMs: 0,
  };
}
