// Pure functions of round time t (seconds): phase, day/night, fog, zone (§6).
import {
  FINAL_COLLAPSE_AT, FOG_DAY, FOG_NIGHT, NIGHT_FULL, NIGHT_START,
  PHASE_CLOSING_END, PHASE_LOOT_END, SHRINK1_AT, SHRINK2_AT, SHRINK3_AT,
  SHRINK_DURATION, ZONE_DOT, ZONE_RADII, ZONE_START_RADIUS, finalRingDiameter,
} from './constants';
import { clamp } from './terrain';

export type Phase = 'loot' | 'closing' | 'endgame';

export function phaseAt(t: number): Phase {
  if (t < PHASE_LOOT_END) return 'loot';
  if (t < PHASE_CLOSING_END) return 'closing';
  return 'endgame';
}

/** 0 = full day … 1 = full night (§6.2). */
export function timeOfDayAt(t: number): number {
  return clamp((t - NIGHT_START) / (NIGHT_FULL - NIGHT_START), 0, 1);
}

export function fogAt(t: number): number {
  return FOG_DAY + (FOG_NIGHT - FOG_DAY) * timeOfDayAt(t);
}

/** Loud shots ping the shooter on the minimap only while it is still light (§6.2). */
export function loudPingActiveAt(t: number): boolean {
  return timeOfDayAt(t) < 1;
}

export interface ZoneState {
  radius: number;
  targetRadius: number;
  /** round time when the next shrink starts, or null if collapsing */
  nextShrinkAt: number | null;
  shrinking: boolean;
  dot: number; // HP/s outside the circle
  tier: number; // 0..3 shrink steps completed/in progress
}

interface Step { at: number; from: number; to: number; dur: number }

export function zoneSteps(n: number): Step[] {
  const finalR = finalRingDiameter(n) / 2;
  return [
    { at: SHRINK1_AT, from: ZONE_START_RADIUS, to: ZONE_RADII[0], dur: SHRINK_DURATION[0] },
    { at: SHRINK2_AT, from: ZONE_RADII[0], to: ZONE_RADII[1], dur: SHRINK_DURATION[1] },
    { at: SHRINK3_AT, from: ZONE_RADII[1], to: finalR, dur: SHRINK_DURATION[2] },
    // safety collapse guarantees the round ends by ~11 min (§6.1 target length)
    { at: FINAL_COLLAPSE_AT, from: finalR, to: 1.5, dur: SHRINK_DURATION[3] },
  ];
}

export function zoneAt(t: number, n: number): ZoneState {
  const steps = zoneSteps(n);
  let radius = ZONE_START_RADIUS;
  let tier = 0;
  let shrinking = false;
  let targetRadius = steps[0].to;
  let nextShrinkAt: number | null = steps[0].at;
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    if (t < s.at) break;
    tier = Math.min(i + 1, 3);
    const k = clamp((t - s.at) / s.dur, 0, 1);
    radius = s.from + (s.to - s.from) * k;
    shrinking = k < 1;
    targetRadius = s.to;
    nextShrinkAt = i + 1 < steps.length ? steps[i + 1].at : null;
  }
  // DoT tiers: early 2, mid 5 (after shrink 2 begins), final 10 (after shrink 3 begins)
  const dot = t < SHRINK2_AT ? ZONE_DOT[0] : t < SHRINK3_AT ? ZONE_DOT[1] : ZONE_DOT[2];
  return { radius, targetRadius, nextShrinkAt, shrinking, dot, tier };
}
