// WebAudio-synthesized sound effects (documented deviation: no audio assets,
// everything is generated to keep LAN installs self-contained).
import { deriveSeed, mulberry32, type Rng } from '@shared/rng';

export type SfxName =
  | 'pistol' | 'rifle' | 'shotgun' | 'sniper' | 'bow' | 'melee' | 'explosion'
  | 'smokePop' | 'flashBang' | 'grenadeBeep'
  | 'hit' | 'headshot' | 'hurt' | 'pickup' | 'pickupWeapon' | 'pickupAmmo'
  | 'pickupHeal' | 'pickupArmor' | 'reload' | 'heal' | 'craft' | 'zone' | 'click' | 'care'
  | 'stepGrass' | 'stepStone' | 'stepSand' | 'bushRustle'
  | 'death' | 'elimination' | 'roundWin' | 'roundLose';

export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private effectsBus: GainNode | null = null;
  private footstepsBus: GainNode | null = null;
  private rng: Rng = mulberry32(1);
  private volumes = { master: 0.72, effects: 0.8, footsteps: 0.9 };

  setSeed(seed: number): void {
    this.rng = mulberry32(deriveSeed(seed, 'client-audio'));
  }

  /** Must be called from a user gesture. */
  unlock(): void {
    if (this.ctx) { void this.ctx.resume(); return; }
    try {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.effectsBus = this.ctx.createGain();
      this.footstepsBus = this.ctx.createGain();
      this.effectsBus.connect(this.master);
      this.footstepsBus.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.applyVolumes();
    } catch { /* no audio available */ }
  }

  setVolumes(master: number, effects: number, footsteps: number): void {
    this.volumes = { master, effects, footsteps };
    this.applyVolumes();
  }

  private applyVolumes(): void {
    if (this.master) this.master.gain.value = 0.5 * Math.max(0, Math.min(1, this.volumes.master));
    if (this.effectsBus) this.effectsBus.gain.value = Math.max(0, Math.min(1, this.volumes.effects));
    if (this.footstepsBus) this.footstepsBus.gain.value = Math.max(0, Math.min(1, this.volumes.footsteps));
  }

  private connectSpatial(node: AudioNode, footsteps: boolean, pan: number): void {
    if (!this.ctx) return;
    const bus = footsteps ? this.footstepsBus : this.effectsBus;
    if (!bus) return;
    const panner = this.ctx.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    node.connect(panner).connect(bus);
  }

  private noiseBurst(dur: number, freq: number, gain: number, decay: number, footsteps: boolean, pan: number): void {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (this.rng() * 2 - 1) * Math.pow(1 - i / len, decay);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(filter).connect(g);
    this.connectSpatial(g, footsteps, pan);
    src.start();
  }

  private tone(freq: number, dur: number, gain: number, type: OscillatorType, slide: number, footsteps: boolean, pan: number): void {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), ctx.currentTime + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(g);
    this.connectSpatial(g, footsteps, pan);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  }

  play(name: SfxName, distance = 0, intensity = 1, pan = 0): void {
    if (!this.ctx) return;
    const level = Math.max(0.025, 1 - distance / 90) * Math.max(0, intensity);
    const variation = 0.94 + this.rng() * 0.12;
    const hz = (value: number) => value * variation;
    const footsteps = name.startsWith('step') || name === 'bushRustle';
    const noise = (dur: number, freq: number, gain: number, decay = 0.9) =>
      this.noiseBurst(dur, freq, gain, decay, footsteps, pan);
    const tone = (freq: number, dur: number, gain: number, type: OscillatorType = 'sine', slide = 0) =>
      this.tone(freq, dur, gain, type, slide, footsteps, pan);
    switch (name) {
      case 'pistol': noise(0.12, hz(2400), 0.7 * level); break;
      case 'rifle': noise(0.09, hz(3200), 0.65 * level); break;
      case 'shotgun': noise(0.28, hz(1500), 0.95 * level); tone(hz(90), 0.2, 0.4 * level, 'square', -40); break;
      case 'sniper': noise(0.16, hz(2600), 1.05 * level, 0.7); tone(hz(70), 0.42, 0.5 * level, 'square', -35); noise(0.5, hz(500), 0.3 * level, 0.5); break;
      case 'smokePop': noise(0.35, hz(600), 0.4 * level, 0.7); tone(hz(180), 0.28, 0.14 * level, 'sine', -70); break;
      case 'flashBang': noise(0.1, hz(5200), 1.1 * level, 1.4); tone(hz(2900), 0.7, 0.4 * level, 'sine', 60); break;
      case 'grenadeBeep': tone(hz(1350), 0.05, 0.22 * level, 'square'); break;
      case 'bow': noise(0.07, hz(900), 0.3 * level); tone(hz(220), 0.1, 0.15 * level, 'triangle', 120); break;
      case 'melee': noise(0.06, hz(700), 0.4 * level); break;
      case 'explosion': noise(0.7, hz(700), 1.2 * level, 0.6); tone(hz(55), 0.5, 0.6 * level, 'square', -25); break;
      case 'hit': tone(hz(1100), 0.06, 0.3 * level, 'square'); break;
      case 'headshot': tone(hz(1450), 0.06, 0.3 * level, 'square'); tone(hz(1900), 0.09, 0.18 * level, 'sine', 180); break;
      case 'hurt': tone(hz(200), 0.18, 0.4 * level, 'sawtooth', -90); break;
      case 'pickup': tone(hz(660), 0.09, 0.25 * level, 'triangle', 220); break;
      case 'pickupWeapon': tone(hz(290), 0.08, 0.22 * level, 'square', 90); tone(hz(580), 0.12, 0.16 * level, 'triangle', 160); break;
      case 'pickupAmmo': noise(0.035, hz(2100), 0.12 * level); tone(hz(820), 0.045, 0.12 * level, 'square', 110); break;
      case 'pickupHeal': tone(hz(520), 0.12, 0.18 * level, 'sine', 120); tone(hz(760), 0.16, 0.12 * level, 'sine', 80); break;
      case 'pickupArmor': noise(0.07, hz(1200), 0.2 * level); tone(hz(240), 0.13, 0.18 * level, 'triangle', -40); break;
      case 'reload': noise(0.045, hz(1600), 0.16 * level); tone(hz(360), 0.07, 0.11 * level, 'square', 80); break;
      case 'heal': tone(hz(520), 0.25, 0.2 * level, 'sine', 180); break;
      case 'craft': tone(hz(440), 0.1, 0.25 * level, 'square'); tone(hz(660), 0.12, 0.2 * level, 'square'); break;
      case 'zone': tone(hz(140), 0.6, 0.3 * level, 'sawtooth', 40); break;
      case 'click': tone(hz(880), 0.04, 0.15 * level, 'square'); break;
      case 'care': tone(hz(330), 0.4, 0.3 * level, 'triangle', 110); tone(hz(495), 0.5, 0.2 * level, 'triangle', 110); break;
      case 'stepGrass': noise(0.05, hz(520), 0.15 * level, 1.5); break;
      case 'stepSand': noise(0.065, hz(880), 0.12 * level, 1.35); break;
      case 'stepStone': noise(0.035, hz(1900), 0.13 * level, 1.8); tone(hz(175), 0.045, 0.05 * level, 'triangle', -20); break;
      case 'bushRustle': noise(0.16, hz(1250), 0.18 * level, 1.2); break;
      case 'death': noise(0.22, hz(600), 0.2 * level); tone(hz(260), 0.45, 0.32 * level, 'sawtooth', -170); break;
      case 'elimination': tone(hz(720), 0.08, 0.22 * level, 'square', 130); tone(hz(1080), 0.15, 0.18 * level, 'triangle', 180); break;
      case 'roundWin': tone(440, 0.14, 0.2 * level, 'triangle', 110); tone(660, 0.2, 0.18 * level, 'triangle', 165); tone(880, 0.28, 0.15 * level, 'sine', 110); break;
      case 'roundLose': tone(300, 0.22, 0.22 * level, 'triangle', -80); tone(190, 0.38, 0.16 * level, 'sine', -60); break;
    }
  }
}
