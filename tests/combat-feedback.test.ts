import { describe, expect, it } from 'vitest';
import { classifyHitFeedback } from '../client/src/combat-feedback';

describe('combat feedback classification', () => {
  it('distinguishes body, head, armor, shield-break and helmet-block hits', () => {
    expect(classifyHitFeedback({ headshot: false }).kind).toBe('body');
    expect(classifyHitFeedback({ headshot: true }).kind).toBe('head');
    expect(classifyHitFeedback({ headshot: false, armor: true }).kind).toBe('armor');
    expect(classifyHitFeedback({ headshot: false, armor: true, shieldBreak: true }).kind).toBe('shield-break');
    expect(classifyHitFeedback({ headshot: true, armor: true, shieldBreak: true, blocked: true }).kind)
      .toBe('helmet-block');
  });

  it('maps every class to a unique intentional sound cue', () => {
    const sounds = [
      classifyHitFeedback({ headshot: false }).sound,
      classifyHitFeedback({ headshot: true }).sound,
      classifyHitFeedback({ headshot: false, armor: true }).sound,
      classifyHitFeedback({ headshot: false, shieldBreak: true }).sound,
      classifyHitFeedback({ headshot: true, blocked: true }).sound,
    ];
    expect(new Set(sounds).size).toBe(sounds.length);
  });

  it('shows readable damage or absorbed shield values without inventing helmet damage', () => {
    expect(classifyHitFeedback({ headshot: false, damage: 22 }).label).toBe('TREFFER · 22');
    expect(classifyHitFeedback({
      headshot: true, armor: true, absorbed: 25, damage: 12,
    }).label).toBe('KOPF · SCHILD · 25');
    expect(classifyHitFeedback({ headshot: true, blocked: true, damage: 0 }).label)
      .toBe('HELM GEBROCHEN');
  });
});
