// WebAudio-synthesized sound effects (documented deviation: no audio assets,
// everything is generated — keeps the repo self-contained for LAN installs).
type SfxName =
  | 'pistol' | 'rifle' | 'shotgun' | 'bow' | 'melee' | 'explosion'
  | 'hit' | 'hurt' | 'pickup' | 'heal' | 'craft' | 'zone' | 'click' | 'care';

export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;

  /** must be called from a user gesture */
  unlock(): void {
    if (this.ctx) { void this.ctx.resume(); return; }
    try {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.35;
      this.master.connect(this.ctx.destination);
    } catch { /* no audio available */ }
  }

  private noiseBurst(dur: number, freq: number, gain: number, decay = 0.9): void {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(filter).connect(g).connect(this.master);
    src.start();
  }

  private tone(freq: number, dur: number, gain: number, type: OscillatorType = 'sine', slide = 0): void {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), ctx.currentTime + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(g).connect(this.master);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  }

  play(name: SfxName, distance = 0): void {
    if (!this.ctx) return;
    const att = Math.max(0.05, 1 - distance / 90); // simple distance attenuation
    switch (name) {
      case 'pistol': this.noiseBurst(0.12, 2400, 0.7 * att); break;
      case 'rifle': this.noiseBurst(0.09, 3200, 0.65 * att); break;
      case 'shotgun': this.noiseBurst(0.28, 1500, 0.95 * att); this.tone(90, 0.2, 0.4 * att, 'square', -40); break;
      case 'bow': this.noiseBurst(0.07, 900, 0.3 * att); this.tone(220, 0.1, 0.15 * att, 'triangle', 120); break;
      case 'melee': this.noiseBurst(0.06, 700, 0.4 * att); break;
      case 'explosion': this.noiseBurst(0.7, 700, 1.2 * att, 0.6); this.tone(55, 0.5, 0.6 * att, 'square', -25); break;
      case 'hit': this.tone(1100, 0.06, 0.3, 'square'); break;
      case 'hurt': this.tone(200, 0.18, 0.4, 'sawtooth', -90); break;
      case 'pickup': this.tone(660, 0.09, 0.25, 'triangle', 220); break;
      case 'heal': this.tone(520, 0.25, 0.2, 'sine', 180); break;
      case 'craft': this.tone(440, 0.1, 0.25, 'square'); this.tone(660, 0.12, 0.2, 'square'); break;
      case 'zone': this.tone(140, 0.6, 0.3, 'sawtooth', 40); break;
      case 'click': this.tone(880, 0.04, 0.15, 'square'); break;
      case 'care': this.tone(330, 0.4, 0.3, 'triangle', 110); this.tone(495, 0.5, 0.2, 'triangle', 110); break;
    }
  }
}
