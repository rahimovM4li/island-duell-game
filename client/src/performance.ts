export interface ResolutionSample {
  fps: number;
  scale: number;
  changed: boolean;
}

/** Slowly adapts render resolution; geometry/gameplay quality stays user-controlled. */
export class AdaptiveResolution {
  private elapsed = 0;
  private frames = 0;
  private scale = 1;
  private fastWindows = 0;

  sample(dt: number): ResolutionSample | null {
    this.elapsed += dt;
    this.frames += 1;
    if (this.elapsed < 2) return null;

    const fps = this.frames / this.elapsed;
    const before = this.scale;
    if (fps < 46) {
      this.scale = Math.max(0.65, this.scale - 0.1);
      this.fastWindows = 0;
    } else if (fps > 58) {
      this.fastWindows += 1;
      if (this.fastWindows >= 2) {
        this.scale = Math.min(1, this.scale + 0.05);
        this.fastWindows = 0;
      }
    } else {
      this.fastWindows = 0;
    }

    this.elapsed = 0;
    this.frames = 0;
    return { fps, scale: this.scale, changed: before !== this.scale };
  }

  reset(): void {
    this.elapsed = 0;
    this.frames = 0;
    this.fastWindows = 0;
    this.scale = 1;
  }
}
