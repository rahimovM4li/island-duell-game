import {
  ARMOR_PER_PLATE, MAX_PLATES, MAX_SHIELD,
} from '@shared/constants';

export interface ArmorState {
  shield: number;
  helmet: boolean;
  headshot: boolean;
}

export interface ArmorHitResult {
  hpDamage: number;
  shield: number;
  shieldAbsorbed: number;
  helmet: boolean;
  helmetBroke: boolean;
}

export function platesForShield(shield: number): number {
  return Math.min(MAX_PLATES, Math.ceil(Math.max(0, shield) / ARMOR_PER_PLATE));
}

export function grantArmorPlate(shield: number): number {
  return Math.min(MAX_SHIELD, Math.max(0, shield) + ARMOR_PER_PLATE);
}

export function canGrantArmorPlate(shield: number): boolean {
  return platesForShield(shield) < MAX_PLATES;
}

/** Resolve protection before health damage. Helmets have priority over shield. */
export function resolveArmorHit(amount: number, state: ArmorState): ArmorHitResult {
  const incoming = Math.max(0, Math.round(amount));
  const shield = Math.min(MAX_SHIELD, Math.max(0, state.shield));

  if (state.headshot && state.helmet) {
    return {
      hpDamage: 0,
      shield,
      shieldAbsorbed: 0,
      helmet: false,
      helmetBroke: true,
    };
  }

  const shieldAbsorbed = Math.min(shield, incoming);
  return {
    hpDamage: incoming - shieldAbsorbed,
    shield: shield - shieldAbsorbed,
    shieldAbsorbed,
    helmet: state.helmet,
    helmetBroke: false,
  };
}
