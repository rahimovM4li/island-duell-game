export interface FlashVisualState {
  opacity: number;
  peakOpacity: number;
  holdRemaining: number;
  fadeRemaining: number;
  fadeDuration: number;
}

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp01((value - edge0) / Math.max(0.001, edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Build a readable flashbang envelope: a direct look holds near-white before
 * the after-image fades, while peripheral/back-turned hits remain brief.
 */
export function createFlashVisual(
  intensity: number,
  duration: number,
  active: FlashVisualState | null = null,
): FlashVisualState {
  const strength = clamp01(intensity);
  const peakOpacity = clamp01(strength * 1.38);
  const directLook = smoothstep(0.58, 0.9, strength);
  const holdRemaining = directLook * (1.05 + strength * 0.65);
  const totalDuration = Math.max(0.25, duration);
  const fadeDuration = Math.max(0.35, totalDuration - holdRemaining);
  const fresh: FlashVisualState = {
    opacity: peakOpacity,
    peakOpacity,
    holdRemaining,
    fadeRemaining: fadeDuration,
    fadeDuration,
  };
  if (!active || active.opacity <= 0.005) return fresh;
  if (fresh.peakOpacity + 0.01 < active.opacity) {
    return {
      ...active,
      fadeRemaining: Math.max(active.fadeRemaining, fresh.fadeRemaining * strength),
      fadeDuration: Math.max(active.fadeDuration, fresh.fadeDuration),
    };
  }
  return {
    opacity: Math.max(active.opacity, fresh.opacity),
    peakOpacity: Math.max(active.peakOpacity, fresh.peakOpacity),
    holdRemaining: Math.max(active.holdRemaining, fresh.holdRemaining),
    fadeRemaining: Math.max(active.fadeRemaining, fresh.fadeRemaining),
    fadeDuration: Math.max(active.fadeDuration, fresh.fadeDuration),
  };
}

export function advanceFlashVisual(state: FlashVisualState, dt: number): FlashVisualState {
  let remainingDt = Math.max(0, dt);
  let holdRemaining = state.holdRemaining;
  let fadeRemaining = state.fadeRemaining;
  if (holdRemaining > 0) {
    const consumed = Math.min(holdRemaining, remainingDt);
    holdRemaining -= consumed;
    remainingDt -= consumed;
  }
  if (holdRemaining <= 0 && remainingDt > 0) {
    fadeRemaining = Math.max(0, fadeRemaining - remainingDt);
  }
  const fadeFraction = holdRemaining > 0
    ? 1
    : Math.max(0, Math.min(1, fadeRemaining / Math.max(0.001, state.fadeDuration)));
  return {
    ...state,
    opacity: state.peakOpacity * Math.pow(fadeFraction, 0.72),
    holdRemaining,
    fadeRemaining,
  };
}
