import { describe, expect, it } from 'vitest';
import {
  ARMOR_PER_PLATE, MAX_PLATES, MAX_SHIELD, RECIPES,
} from '@shared/constants';
import {
  canGrantArmorPlate, grantArmorPlate, resolveArmorHit,
} from '../server/src/armor';

describe('armor plates', () => {
  it('grant exactly 25 shield up to two plates / 50 shield', () => {
    expect(ARMOR_PER_PLATE).toBe(25);
    expect(MAX_PLATES).toBe(2);
    expect(MAX_SHIELD).toBe(50);
    expect(grantArmorPlate(0)).toBe(25);
    expect(grantArmorPlate(25)).toBe(50);
    expect(grantArmorPlate(42)).toBe(50);
    expect(grantArmorPlate(50)).toBe(50);
    expect(canGrantArmorPlate(24)).toBe(true);
    expect(canGrantArmorPlate(25)).toBe(true);
    expect(canGrantArmorPlate(26)).toBe(false);
    expect(canGrantArmorPlate(50)).toBe(false);
  });

  it('absorbs damage point-for-point before health instead of reducing it by a percentage', () => {
    expect(resolveArmorHit(40, { shield: 30, helmet: false, headshot: false })).toEqual({
      hpDamage: 10,
      shield: 0,
      shieldAbsorbed: 30,
      helmet: false,
      helmetBroke: false,
    });
    expect(resolveArmorHit(12, { shield: 25, helmet: false, headshot: false })).toEqual({
      hpDamage: 0,
      shield: 13,
      shieldAbsorbed: 12,
      helmet: false,
      helmetBroke: false,
    });
  });

  it('keeps the existing plate crafting recipe unchanged', () => {
    expect(RECIPES.plate).toMatchObject({
      input: { stone: 3 },
      time: 2,
      output: '1 armor plate',
    });
  });
});

describe('helmet', () => {
  it('blocks the first headshot completely and then breaks', () => {
    expect(resolveArmorHit(124, { shield: 50, helmet: true, headshot: true })).toEqual({
      hpDamage: 0,
      shield: 50,
      shieldAbsorbed: 0,
      helmet: false,
      helmetBroke: true,
    });
  });

  it('does not block body hits or a later headshot after it broke', () => {
    expect(resolveArmorHit(30, { shield: 0, helmet: true, headshot: false })).toMatchObject({
      hpDamage: 30,
      helmet: true,
      helmetBroke: false,
    });
    expect(resolveArmorHit(124, { shield: 50, helmet: false, headshot: true })).toMatchObject({
      hpDamage: 74,
      shield: 0,
      shieldAbsorbed: 50,
      helmet: false,
      helmetBroke: false,
    });
  });
});
