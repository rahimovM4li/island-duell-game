// §3 N-scaling formulas + §6 zone/timeline numbers.
import { describe, expect, it } from 'vitest';
import {
  FINAL_COLLAPSE_AT, finalRingDiameter, scatterCrateCount, FIXED_POI_CRATES,
  SHRINK1_AT, SHRINK2_AT, SHRINK3_AT, ZONE_RADII, ZONE_START_RADIUS,
} from '@shared/constants';
import {
  fogAt, lightingPresetForRound, loudPingActiveAt, phaseAt, timeOfDayAt, zoneAt, zoneSteps,
} from '@shared/timeline';

describe('N scaling (§3)', () => {
  it('scatter crates = 3×N', () => {
    expect(scatterCrateCount(2)).toBe(6);
    expect(scatterCrateCount(3)).toBe(9);
    expect(scatterCrateCount(5)).toBe(15);
  });

  it('total crates = 12 fixed + 3×N', () => {
    expect(FIXED_POI_CRATES + scatterCrateCount(2)).toBe(18);
    expect(FIXED_POI_CRATES + scatterCrateCount(5)).toBe(27);
  });

  it('final ring diameter = 20 + 5×N m', () => {
    expect(finalRingDiameter(2)).toBe(30);
    expect(finalRingDiameter(3)).toBe(35);
    expect(finalRingDiameter(4)).toBe(40);
    expect(finalRingDiameter(5)).toBe(45);
  });
});

describe('round timeline (§6.1)', () => {
  it('selects deterministic but different day, dawn, sunset or night moods per round', () => {
    const allowed = new Set(['day', 'dawn', 'sunset', 'night']);
    for (const seed of [1, 7, 42, 1337]) {
      const rounds = [1, 2, 3].map((round) => lightingPresetForRound(seed, round));
      expect(rounds.every((preset) => allowed.has(preset))).toBe(true);
      expect(new Set(rounds).size).toBe(3);
      expect(rounds).toEqual([1, 2, 3].map((round) => lightingPresetForRound(seed, round)));
    }
  });

  it('maps fixed lighting presets to readable light and fog levels without rain', () => {
    expect(timeOfDayAt(100, 1, 'day')).toBe(0);
    expect(timeOfDayAt(100, 1, 'dawn')).toBeGreaterThan(0);
    expect(timeOfDayAt(100, 1, 'sunset')).toBeGreaterThan(timeOfDayAt(100, 1, 'dawn'));
    expect(timeOfDayAt(100, 1, 'night')).toBe(1);
    expect(fogAt(100, 1, 'day')).toBeGreaterThan(fogAt(100, 1, 'night'));
  });
  it('phases: 0–3 loot, 3–8 closing, 8+ endgame', () => {
    expect(phaseAt(0)).toBe('loot');
    expect(phaseAt(179)).toBe('loot');
    expect(phaseAt(180)).toBe('closing');
    expect(phaseAt(479)).toBe('closing');
    expect(phaseAt(480)).toBe('endgame');
  });

  it('day → night between 3:00 and 8:00', () => {
    expect(timeOfDayAt(0)).toBe(0);
    expect(timeOfDayAt(180)).toBe(0);
    expect(timeOfDayAt(330)).toBeCloseTo(0.5);
    expect(timeOfDayAt(480)).toBe(1);
    expect(timeOfDayAt(600)).toBe(1);
  });

  it('fog 120 m day → 50 m night (§6.2)', () => {
    expect(fogAt(0)).toBe(120);
    expect(fogAt(480)).toBe(50);
  });

  it('loud-shot pings only while there is daylight (§6.2)', () => {
    expect(loudPingActiveAt(0)).toBe(true);
    expect(loudPingActiveAt(400)).toBe(true);
    expect(loudPingActiveAt(480)).toBe(false);
    expect(loudPingActiveAt(600)).toBe(false);
  });
});

describe('zone (§6.3)', () => {
  it('steps land on the fixed radii and the N-scaled final ring', () => {
    for (const n of [2, 3, 4, 5]) {
      const steps = zoneSteps(n);
      expect(steps[0]).toMatchObject({ at: SHRINK1_AT, from: ZONE_START_RADIUS, to: ZONE_RADII[0] });
      expect(steps[1]).toMatchObject({ at: SHRINK2_AT, to: ZONE_RADII[1] });
      expect(steps[2]).toMatchObject({ at: SHRINK3_AT, to: finalRingDiameter(n) / 2 });
      expect(steps[3].at).toBe(FINAL_COLLAPSE_AT);
    }
  });

  it('radius interpolates during a shrink and settles on the target', () => {
    const z0 = zoneAt(0, 3);
    expect(z0.radius).toBe(ZONE_START_RADIUS);
    expect(z0.dot).toBe(2);
    const mid = zoneAt(SHRINK1_AT + 22.5, 3); // half of the 45 s shrink
    expect(mid.shrinking).toBe(true);
    expect(mid.radius).toBeCloseTo((ZONE_START_RADIUS + ZONE_RADII[0]) / 2);
    const done = zoneAt(SHRINK1_AT + 60, 3);
    expect(done.radius).toBe(ZONE_RADII[0]);
    expect(done.shrinking).toBe(false);
  });

  it('DoT escalates 2 → 5 → 10 HP/s', () => {
    expect(zoneAt(100, 3).dot).toBe(2);
    expect(zoneAt(SHRINK2_AT, 3).dot).toBe(5);
    expect(zoneAt(SHRINK3_AT, 3).dot).toBe(10);
  });

  it('safety collapse forces the round to end (radius → 1.5)', () => {
    const z = zoneAt(FINAL_COLLAPSE_AT + 60, 4);
    expect(z.radius).toBe(1.5);
  });

  it('quick mode compresses time without changing the zone geometry', () => {
    const pace = 1.75;
    expect(phaseAt(180 / pace, pace)).toBe('closing');
    expect(zoneAt(SHRINK1_AT / pace + 22.5 / pace, 3, pace).radius)
      .toBeCloseTo(zoneAt(SHRINK1_AT + 22.5, 3).radius);
    expect(zoneSteps(3, pace)[0].at).toBeCloseTo(SHRINK1_AT / pace);
  });
});
