export type HitFeedbackKind = 'body' | 'head' | 'armor' | 'shield-break' | 'helmet-block';

export interface HitFeedbackInput {
  headshot: boolean;
  blocked?: boolean;
  armor?: boolean;
  shieldBreak?: boolean;
}

export interface HitFeedback {
  kind: HitFeedbackKind;
  label: string;
  sound: 'hit' | 'headshot' | 'shieldHit' | 'shieldBreak' | 'helmetBreak';
  flashTarget: boolean;
}

export function classifyHitFeedback(input: HitFeedbackInput): HitFeedback {
  if (input.blocked) {
    return { kind: 'helmet-block', label: 'HELM GEBROCHEN', sound: 'helmetBreak', flashTarget: true };
  }
  if (input.shieldBreak) {
    return { kind: 'shield-break', label: 'SCHILD GEBROCHEN', sound: 'shieldBreak', flashTarget: true };
  }
  if (input.armor) {
    return { kind: 'armor', label: input.headshot ? 'KOPF · SCHILD' : 'SCHILD', sound: 'shieldHit', flashTarget: true };
  }
  if (input.headshot) {
    return { kind: 'head', label: 'KOPFTREFFER', sound: 'headshot', flashTarget: true };
  }
  return { kind: 'body', label: '', sound: 'hit', flashTarget: true };
}
