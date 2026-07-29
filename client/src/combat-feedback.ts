export type HitFeedbackKind = 'body' | 'head' | 'armor' | 'shield-break' | 'helmet-block';

export interface HitFeedbackInput {
  headshot: boolean;
  blocked?: boolean;
  armor?: boolean;
  shieldBreak?: boolean;
  damage?: number;
  absorbed?: number;
}

export interface HitFeedback {
  kind: HitFeedbackKind;
  label: string;
  sound: 'hit' | 'headshot' | 'shieldHit' | 'shieldBreak' | 'helmetBreak';
  flashTarget: boolean;
}

export function classifyHitFeedback(input: HitFeedbackInput): HitFeedback {
  const amount = Math.max(0, Math.round(
    input.armor ? input.absorbed ?? 0 : input.damage ?? 0,
  ));
  const label = (text: string): string => amount > 0 ? `${text} · ${amount}` : text;
  if (input.blocked) {
    return { kind: 'helmet-block', label: 'HELM GEBROCHEN', sound: 'helmetBreak', flashTarget: true };
  }
  if (input.shieldBreak) {
    return { kind: 'shield-break', label: label('SCHILD GEBROCHEN'), sound: 'shieldBreak', flashTarget: true };
  }
  if (input.armor) {
    return {
      kind: 'armor',
      label: label(input.headshot ? 'KOPF · SCHILD' : 'SCHILD'),
      sound: 'shieldHit',
      flashTarget: true,
    };
  }
  if (input.headshot) {
    return { kind: 'head', label: label('KOPFTREFFER'), sound: 'headshot', flashTarget: true };
  }
  return { kind: 'body', label: label('TREFFER'), sound: 'hit', flashTarget: true };
}
