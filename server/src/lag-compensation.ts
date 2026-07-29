import type { Vec3 } from '@shared/physics';

export interface HistoricalPlayerPose {
  t: number;
  feet: Vec3;
  yaw: number;
  sneaking: boolean;
  prone: boolean;
}

const shortestYawDelta = (from: number, to: number): number => {
  let delta = to - from;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
};

export function appendHistoricalPose(
  history: HistoricalPlayerPose[],
  pose: HistoricalPlayerPose,
  keepAfter: number,
): void {
  const previous = history.at(-1);
  if (previous && pose.t < previous.t) return;
  history.push({
    ...pose,
    feet: { ...pose.feet },
  });
  while (history.length > 2 && history[1].t < keepAfter) history.shift();
}

export function sampleHistoricalPose(
  history: readonly HistoricalPlayerPose[],
  targetTime: number,
): HistoricalPlayerPose | null {
  if (history.length === 0) return null;
  if (targetTime <= history[0].t) return { ...history[0], feet: { ...history[0].feet } };
  const last = history[history.length - 1];
  if (targetTime >= last.t) return { ...last, feet: { ...last.feet } };
  for (let index = 0; index < history.length - 1; index += 1) {
    const a = history[index];
    const b = history[index + 1];
    if (targetTime < a.t || targetTime > b.t) continue;
    const alpha = (targetTime - a.t) / Math.max(0.000001, b.t - a.t);
    const lerp = (from: number, to: number): number => from + (to - from) * alpha;
    return {
      t: targetTime,
      feet: {
        x: lerp(a.feet.x, b.feet.x),
        y: lerp(a.feet.y, b.feet.y),
        z: lerp(a.feet.z, b.feet.z),
      },
      yaw: a.yaw + shortestYawDelta(a.yaw, b.yaw) * alpha,
      // Stances are discrete. Switch halfway rather than inventing a collider.
      sneaking: alpha < 0.5 ? a.sneaking : b.sneaking,
      prone: alpha < 0.5 ? a.prone : b.prone,
    };
  }
  return { ...last, feet: { ...last.feet } };
}

export function clampedRewindSeconds(
  reportedMs: number | undefined,
  maxRewindMs: number,
  timeScale = 1,
): number {
  const milliseconds = Number.isFinite(reportedMs)
    ? Math.max(0, Math.min(maxRewindMs, reportedMs ?? 0))
    : 0;
  return milliseconds / 1000 * Math.max(0.01, timeScale);
}
