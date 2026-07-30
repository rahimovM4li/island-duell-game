import { describe, expect, it } from 'vitest';
import { shouldShowSpectatorLabel } from '../client/src/spectator-labels';

describe('spectator player names', () => {
  it('shows names only to spectators and only for living named players', () => {
    expect(shouldShowSpectatorLabel(true, true, 'Spieler 1')).toBe(true);
    expect(shouldShowSpectatorLabel(false, true, 'Spieler 1')).toBe(false);
    expect(shouldShowSpectatorLabel(true, false, 'Spieler 1')).toBe(false);
    expect(shouldShowSpectatorLabel(true, true, '')).toBe(false);
  });
});
