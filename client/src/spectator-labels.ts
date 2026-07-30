export function shouldShowSpectatorLabel(
  spectating: boolean,
  alive: boolean,
  playerName: string,
): boolean {
  return spectating && alive && playerName.trim().length > 0;
}
