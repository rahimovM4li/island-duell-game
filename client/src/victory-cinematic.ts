import * as THREE from 'three';

export const VICTORY_FALL_SHOT_SECONDS = 1.05;
export const VICTORY_CINEMATIC_SECONDS = 3.65;
export const REDUCED_MOTION_VICTORY_SECONDS = 1.45;

export interface VictorySubject {
  winner: THREE.Vector3;
  winnerYaw: number;
  victim: THREE.Vector3 | null;
}

export interface VictoryCameraPose {
  position: THREE.Vector3;
  target: THREE.Vector3;
  danceWeight: number;
}

const smoothstep = (min: number, max: number, value: number): number => {
  const t = THREE.MathUtils.clamp((value - min) / Math.max(0.0001, max - min), 0, 1);
  return t * t * (3 - 2 * t);
};

/**
 * Deterministic two-shot camera. The first shot keeps the defeated player and
 * winner in frame; the second settles in front of the winner for the emote.
 */
export function computeVictoryCameraPose(
  elapsed: number,
  subject: VictorySubject,
  reducedMotion: boolean,
  out: VictoryCameraPose,
): VictoryCameraPose {
  const facingX = -Math.sin(subject.winnerYaw);
  const facingZ = -Math.cos(subject.winnerYaw);

  const victim = subject.victim ?? subject.winner;
  const middleX = (subject.winner.x + victim.x) * 0.5;
  const middleY = (subject.winner.y + victim.y) * 0.5;
  const middleZ = (subject.winner.z + victim.z) * 0.5;
  let lineX = subject.winner.x - victim.x;
  let lineZ = subject.winner.z - victim.z;
  const lineLength = Math.hypot(lineX, lineZ);
  if (lineLength < 0.15) {
    lineX = facingX;
    lineZ = facingZ;
  } else {
    lineX /= lineLength;
    lineZ /= lineLength;
  }
  const sideX = -lineZ;
  const sideZ = lineX;
  const duelDistance = THREE.MathUtils.clamp(lineLength * 0.45 + 3.25, 3.5, 6.2);
  const fallX = middleX + sideX * duelDistance - lineX * 0.7;
  const fallY = middleY + 2.25;
  const fallZ = middleZ + sideZ * duelDistance - lineZ * 0.7;

  const danceTime = Math.max(0, elapsed - VICTORY_FALL_SHOT_SECONDS);
  const orbit = reducedMotion ? 0 : Math.sin(danceTime * 0.72) * 0.18;
  const cos = Math.cos(orbit);
  const sin = Math.sin(orbit);
  const frontX = facingX * cos - facingZ * sin;
  const frontZ = facingX * sin + facingZ * cos;
  const winnerCameraX = subject.winner.x + frontX * 3.45;
  const winnerCameraY = subject.winner.y + 1.58;
  const winnerCameraZ = subject.winner.z + frontZ * 3.45;

  const transition = reducedMotion
    ? smoothstep(0.25, 0.65, elapsed)
    : smoothstep(VICTORY_FALL_SHOT_SECONDS - 0.15, VICTORY_FALL_SHOT_SECONDS + 0.55, elapsed);
  out.position.set(
    THREE.MathUtils.lerp(fallX, winnerCameraX, transition),
    THREE.MathUtils.lerp(fallY, winnerCameraY, transition),
    THREE.MathUtils.lerp(fallZ, winnerCameraZ, transition),
  );
  out.target.set(
    THREE.MathUtils.lerp(middleX, subject.winner.x, transition),
    THREE.MathUtils.lerp(middleY + 0.88, subject.winner.y + 1.02, transition),
    THREE.MathUtils.lerp(middleZ, subject.winner.z, transition),
  );
  out.danceWeight = reducedMotion
    ? smoothstep(0.45, 0.8, elapsed)
    : smoothstep(VICTORY_FALL_SHOT_SECONDS, VICTORY_FALL_SHOT_SECONDS + 0.38, elapsed);
  return out;
}
