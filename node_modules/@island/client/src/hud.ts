// DOM HUD + canvas minimap (§6.2: minimap shows island, zone, self and
// loud-shot pings — never enemy positions).
import {
  PLAYER_MAX_HP, SPRINT_STAMINA_MAX, WEAPONS, WORLD_SIZE, type WeaponType,
} from '@shared/constants';
import { sampleHeight, type TerrainParams } from '@shared/terrain';
import type {
  CareSnap, CombatStats, InventoryState, PingSnap, PlacementEntry, ZoneSnap,
} from '@shared/protocol';
import type { LandmarkPoi, SpawnPoi } from '@shared/worldgen';

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;

const WEAPON_NAMES: Record<WeaponType, string> = {
  fists: 'Fäuste', machete: 'Machete', spear: 'Speer', bow: 'Bogen',
  pistol: 'Pistole', rifle: 'Gewehr', shotgun: 'Schrotflinte', sniper: 'Scharfschütze',
  grenade: 'Granate', smoke: 'Rauch', flash: 'Blend',
};
const WEAPON_GLYPHS: Record<WeaponType, string> = {
  fists: '✦', machete: '╱', spear: '↑', bow: '◖',
  pistol: 'P', rifle: 'G', shotgun: 'S', sniper: '◎',
  grenade: '●', smoke: '◌', flash: '✳',
};
const THROW_LABELS = { frag: 'Granate', smoke: 'Rauch', flash: 'Blend' } as const;
const THROW_GLYPHS = { frag: '●', smoke: '◌', flash: '✳' } as const;
export const weaponName = (w: WeaponType): string => WEAPON_NAMES[w];

export class Hud {
  private mini = $('minimap') as unknown as HTMLCanvasElement;
  private miniCtx = this.mini.getContext('2d')!;
  private islandImg: HTMLCanvasElement | null = null;
  private announceTimer: ReturnType<typeof setTimeout> | null = null;
  private damageDirectionTimer: ReturnType<typeof setTimeout> | null = null;
  private spawns: SpawnPoi[] = [];
  private pois: LandmarkPoi[] = [];
  private reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  show(): void { $('hud').classList.add('active'); }
  hide(): void { $('hud').classList.remove('active'); }

  setTimer(t: number, phase: string): void {
    const m = Math.floor(t / 60), s = Math.floor(t % 60);
    $('round-timer').textContent = `${m}:${s.toString().padStart(2, '0')}`;
    $('phase-label').textContent =
      phase === 'loot' ? 'Loot-Phase' : phase === 'closing' ? 'Zone schließt' : 'Endkampf';
  }

  setZoneInfo(zone: ZoneSnap, t: number): void {
    const el = $('zone-info');
    if (zone.shrinking) el.textContent = '⚠ Zone schrumpft!';
    else if (zone.nextShrinkAt !== null) {
      const left = Math.max(0, Math.ceil(zone.nextShrinkAt - t));
      el.textContent = `Zone schrumpft in ${Math.floor(left / 60)}:${(left % 60).toString().padStart(2, '0')}`;
    } else el.textContent = 'Letzte Zone';
  }

  setAlive(count: number): void { $('alive-count').textContent = `${count} übrig`; }

  setWeapon(weapon: WeaponType): void {
    $('hud').dataset.weapon = weapon;
  }

  setCrosshairSpread(pixels: number): void {
    $('crosshair').style.setProperty('--crosshair-gap', `${Math.max(2, Math.min(22, pixels)).toFixed(1)}px`);
  }

  setCompass(yaw: number): void {
    const degrees = ((-yaw * 180 / Math.PI) % 360 + 360) % 360;
    const directions = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'];
    const direction = directions[Math.round(degrees / 45) % directions.length];
    $('compass').textContent = `${direction} · ${Math.round(degrees).toString().padStart(3, '0')}°`;
  }

  setHp(hp: number): void {
    $('hp-bar').style.transform = `scaleX(${Math.max(0, hp) / PLAYER_MAX_HP})`;
    $('hp-num').textContent = `${Math.ceil(Math.max(0, hp))}`;
  }

  setStamina(st: number): void {
    $('stamina-bar').style.transform = `scaleX(${st / SPRINT_STAMINA_MAX})`;
  }

  setInventory(inv: InventoryState): void {
    const slots = [
      { el: $('slot1'), w: inv.primary },
      { el: $('slot2'), w: inv.secondary },
    ];
    for (const { el, w } of slots) {
      el.querySelector('.slot-icon')!.textContent = w ? WEAPON_GLYPHS[w.type] : '—';
      el.querySelector('.wname')!.textContent = w ? WEAPON_NAMES[w.type] : 'Leer';
      const def = w ? WEAPONS[w.type] : null;
      el.querySelector('.ammo')!.textContent = def?.ammo
        ? `${w!.mag}/${inv.ammo[def.ammo]}${inv.reloading ? ' ⟳' : ''}`
        : w ? 'Nahkampf' : 'Waffe aufnehmen';
    }
    // slot 3 shows the selected throwable; pressing 3 again cycles (§F2)
    const throwCount = inv.throwables[inv.activeThrow];
    $('slot3').querySelector('.slot-icon')!.textContent = THROW_GLYPHS[inv.activeThrow];
    $('slot3').querySelector('.wname')!.textContent = THROW_LABELS[inv.activeThrow];
    const others = (['frag', 'smoke', 'flash'] as const)
      .filter((kind) => kind !== inv.activeThrow && inv.throwables[kind] > 0)
      .map((kind) => `${THROW_GLYPHS[kind]}${inv.throwables[kind]}`)
      .join(' ');
    $('slot3').querySelector('.ammo')!.textContent = `×${throwCount}${others ? `  ${others}` : ''}`;
    for (const i of [1, 2, 3] as const) $(`slot${i}`).classList.toggle('active', inv.active === i);
    $('plates-row').textContent = inv.plates > 0 ? `Panzerung ${'■'.repeat(inv.plates)} · nächster Treffer −20%` : 'Keine Panzerung';
    $('mats-row').textContent =
      `Holz ${inv.mats.wood}  ·  Stein ${inv.mats.stone}  ·  Fasern ${inv.mats.fiber}`;
    const affordable = {
      arrows: inv.mats.wood >= 2,
      bandage: inv.mats.fiber >= 2,
      plate: inv.mats.stone >= 3,
    };
    for (const [recipe, ok] of Object.entries(affordable)) {
      document.querySelector(`[data-recipe="${recipe}"]`)?.classList.toggle('affordable', ok);
    }
    $('consumables').innerHTML =
      `<strong>${inv.bandages}</strong> Verbände <span style="color:#ffc45c">[H]</span><br><strong>${inv.ammo.arrow}</strong> Pfeile`;
  }

  killfeed(text: string, isMe: boolean): void {
    const feed = $('killfeed');
    const div = document.createElement('div');
    div.textContent = text;
    if (isMe) div.classList.add('me');
    feed.prepend(div);
    while (feed.children.length > 6) feed.lastChild?.remove();
    setTimeout(() => div.remove(), 7000);
  }

  announce(text: string, ms = 2600): void {
    const el = $('announce');
    el.textContent = text;
    el.style.opacity = '1';
    if (this.announceTimer) clearTimeout(this.announceTimer);
    this.announceTimer = setTimeout(() => { el.style.opacity = '0'; }, ms);
  }

  hitmarker(headshot: boolean): void {
    const el = $('hitmarker');
    el.classList.toggle('head', headshot);
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 130);
  }

  damageFlash(): void {
    const el = $('damage-flash');
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 120);
  }

  /** A short, local confirmation pulse when the player successfully loots. */
  punchPickup(): void {
    if (this.reduceMotion) return;
    const targets = [$('bottombar'), document.querySelector('.slot.active') as HTMLElement | null];
    for (const el of targets) {
      el?.animate(
        [
          { transform: 'translateY(0) scale(1)', filter: 'brightness(1)' },
          { transform: 'translateY(-4px) scale(1.025)', filter: 'brightness(1.35)', offset: 0.42 },
          { transform: 'translateY(0) scale(1)', filter: 'brightness(1)' },
        ],
        { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' },
      );
    }
  }

  damageDirection(angle: number | null): void {
    if (angle === null) return;
    const el = $('damage-direction');
    el.style.setProperty('--damage-angle', `${angle}rad`);
    el.style.opacity = '1';
    if (this.damageDirectionTimer) clearTimeout(this.damageDirectionTimer);
    this.damageDirectionTimer = setTimeout(() => { el.style.opacity = '0'; }, 520);
  }

  setInZone(outside: boolean): void {
    $('zone-warn').style.opacity = outside ? '1' : '0';
  }

  setInteract(text: string | null, progress: number): void {
    const hint = $('interact-hint');
    if (!text) { hint.style.display = 'none'; return; }
    hint.style.display = 'block';
    $('interact-text').textContent = text;
    ($('interact-progress').firstElementChild as HTMLElement).style.width = `${progress * 100}%`;
  }

  setHealProgress(p: number | null): void {
    const el = $('heal-progress');
    el.style.display = p === null ? 'none' : 'block';
    if (p !== null) (el.firstElementChild as HTMLElement).style.width = `${p * 100}%`;
  }

  /** Sniper scope: overlay + breath meter (§F1). */
  setScoped(scoped: boolean): void {
    $('hud').classList.toggle('scoped', scoped);
    $('scope-overlay').style.display = scoped ? 'block' : 'none';
  }

  setBreath(fraction: number | null, holding: boolean): void {
    const wrap = $('breath-wrap');
    wrap.style.display = fraction === null ? 'none' : 'block';
    if (fraction !== null) {
      const bar = $('breath-bar');
      bar.style.transform = `scaleX(${Math.max(0, Math.min(1, fraction))})`;
      bar.classList.toggle('holding', holding);
    }
  }

  /** Frag cooking countdown ring (§F3); remaining in seconds or null. */
  setCooking(remaining: number | null, fuse: number): void {
    const el = $('cook-timer');
    if (remaining === null) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    const clamped = Math.max(0, remaining);
    $('cook-num').textContent = clamped.toFixed(1);
    el.style.setProperty('--cook-frac', `${(clamped / fuse) * 100}`);
    el.classList.toggle('danger', clamped < 1);
  }

  /** Full-screen white-out after a flashbang (§F2). */
  setFlashWhiteout(opacity: number): void {
    $('flash-overlay').style.opacity = opacity <= 0.005 ? '0' : String(Math.min(1, opacity));
  }

  setSpectating(v: boolean): void {
    $('spectate-label').style.display = v ? 'block' : 'none';
  }

  showDeathRecap(text: string): void {
    const el = $('death-recap');
    el.textContent = text;
    el.style.display = 'block';
  }

  hideDeathRecap(): void { $('death-recap').style.display = 'none'; }

  setNetworkStatus(text: string | null, danger = true): void {
    const el = $('network-banner');
    el.textContent = text ?? '';
    el.style.background = danger ? '#5e3020' : '#23533d';
    el.classList.toggle('visible', !!text);
  }

  setDebug(text: string | null): void {
    const el = $('debug');
    el.style.display = text ? 'block' : 'none';
    if (text) el.textContent = text;
  }

  // ---------- minimap ----------
  initIsland(params: TerrainParams, spawns: SpawnPoi[], pois: LandmarkPoi[]): void {
    this.spawns = spawns;
    this.pois = pois;
    const size = 320;
    const cv = document.createElement('canvas');
    cv.width = cv.height = size;
    const g = cv.getContext('2d')!;
    const img = g.createImageData(size, size);
    for (let py = 0; py < size; py++) {
      for (let px = 0; px < size; px++) {
        const x = (px / size - 0.5) * WORLD_SIZE;
        const z = (py / size - 0.5) * WORLD_SIZE;
        const h = sampleHeight(params, x, z);
        let r = 10, gg = 24, b = 38;                    // sea
        if (h > 1.6) { r = 74; gg = 112; b = 56; }      // grass
        else if (h > 0.5) { r = 190; gg = 168; b = 116; } // beach
        if (h > 9) { r = 128; gg = 124; b = 110; }      // highground
        const i = (py * size + px) * 4;
        img.data[i] = r; img.data[i + 1] = gg; img.data[i + 2] = b; img.data[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    this.islandImg = cv;
  }

  private toMap(x: number, z: number): [number, number] {
    const s = this.mini.width / WORLD_SIZE;
    return [(x + WORLD_SIZE / 2) * s, (z + WORLD_SIZE / 2) * s];
  }

  drawMinimap(
    selfX: number, selfZ: number, selfYaw: number,
    zone: ZoneSnap, pings: PingSnap[], care: CareSnap, t: number,
  ): void {
    const g = this.miniCtx;
    const size = this.mini.width;
    g.clearRect(0, 0, size, size);
    if (this.islandImg) g.drawImage(this.islandImg, 0, 0);
    const s = size / WORLD_SIZE;

    // spawn POIs
    g.fillStyle = 'rgba(230,200,120,0.8)';
    for (const sp of this.spawns) {
      const [px, py] = this.toMap(sp.x, sp.z);
      g.fillRect(px - 2, py - 2, 4, 4);
    }
    // ruins marker (map center)
    g.strokeStyle = 'rgba(220,220,220,0.6)';
    g.strokeRect(size / 2 - 3, size / 2 - 3, 6, 6);
    for (const poi of this.pois) {
      if (poi.id === 'ruins') continue;
      const [px, py] = this.toMap(poi.x, poi.z);
      g.fillStyle = poi.id === 'wreck' ? '#d6b06c' : poi.id === 'watchtower' ? '#ef8f48' : '#9aa79b';
      g.beginPath();
      g.arc(px, py, 4, 0, Math.PI * 2);
      g.fill();
    }

    // zone: current (blue) + target (white)
    g.strokeStyle = '#63d0ff';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(size / 2, size / 2, zone.radius * s, 0, Math.PI * 2);
    g.stroke();
    if (zone.targetRadius < zone.radius - 0.5) {
      g.strokeStyle = 'rgba(255,255,255,0.7)';
      g.lineWidth = 1;
      g.beginPath();
      g.arc(size / 2, size / 2, zone.targetRadius * s, 0, Math.PI * 2);
      g.stroke();
    }

    // loud-shot pings (§6.2)
    g.fillStyle = '#ff5533';
    for (const ping of pings) {
      if (ping.until < t) continue;
      const [px, py] = this.toMap(ping.x, ping.z);
      g.beginPath();
      g.arc(px, py, 5, 0, Math.PI * 2);
      g.fill();
    }

    // care package (§7)
    if (care.state !== 'none') {
      const [px, py] = this.toMap(care.x, care.z);
      g.fillStyle = care.state === 'landed' ? '#ffcc44' : 'rgba(255,204,68,0.6)';
      g.fillRect(px - 4, py - 4, 8, 8);
      g.strokeStyle = '#000';
      g.strokeRect(px - 4, py - 4, 8, 8);
    }

    // self (white arrow showing facing)
    const [sx, sy] = this.toMap(selfX, selfZ);
    g.save();
    g.translate(sx, sy);
    g.rotate(-selfYaw);
    g.fillStyle = '#fff';
    g.beginPath();
    g.moveTo(0, -7);
    g.lineTo(4.5, 5);
    g.lineTo(-4.5, 5);
    g.closePath();
    g.fill();
    g.restore();
  }

  // ---------- scoreboards ----------
  showRoundEnd(
    round: number, placements: PlacementEntry[], totals: Record<string, number>,
    nextRoundIn: number, myId: string, suddenDeathNext: boolean, stats: Record<string, CombatStats>,
  ): void {
    $('scoreboard-title').textContent = `Runde ${round} beendet`;
    $('scoreboard-sub').textContent = 'Platzierungspunkte: 3 / 2 / 1 / 0 / 0';
    this.fillScores(placements, totals, myId, true, stats);
    $('rematch-btn').style.display = 'none';
    const label = suddenDeathNext ? 'SUDDEN DEATH' : 'Nächste Runde';
    $('next-round-in').textContent = `${label} in ${Math.round(nextRoundIn)} s …`;
    $('scoreboard-screen').classList.remove('hidden');
  }

  showMatchEnd(
    standings: PlacementEntry[], totals: Record<string, number>, winnerName: string,
    myId: string, iWon: boolean, stats: Record<string, CombatStats>,
  ): void {
    $('scoreboard-title').textContent = iWon ? '🏆 SIEG!' : `Match vorbei — ${winnerName} gewinnt`;
    $('scoreboard-sub').textContent = 'Endstand nach 3 Runden';
    this.fillScores(standings, totals, myId, false, stats);
    $('next-round-in').textContent = '';
    $('rematch-btn').style.display = 'block';
    $('scoreboard-screen').classList.remove('hidden');
  }

  hideScoreboard(): void { $('scoreboard-screen').classList.add('hidden'); }

  private fillScores(
    rows: PlacementEntry[], totals: Record<string, number>, myId: string,
    showRound: boolean, stats: Record<string, CombatStats>,
  ): void {
    const body = $('scoreboard-body');
    body.innerHTML = '';
    const sorted = [...rows].sort((a, b) => a.place - b.place);
    for (const r of sorted) {
      const tr = document.createElement('tr');
      if (r.id === myId) tr.classList.add('me');
      const st = stats[r.id] ?? { kills: 0, damageDealt: 0, damageTaken: 0, shotsFired: 0, hits: 0, headshots: 0, pickups: 0 };
      const accuracy = st.shotsFired > 0 ? `${Math.round(st.hits / st.shotsFired * 100)}%` : '—';
      tr.innerHTML = `<td>${r.place}.</td><td></td><td>${showRound ? `+${r.points}` : ''}</td><td>${totals[r.id] ?? 0}</td><td>${st.kills}</td><td>${st.damageDealt}</td><td>${accuracy}</td><td>${st.pickups}</td>`;
      (tr.children[1] as HTMLElement).textContent = r.name;
      body.appendChild(tr);
    }
  }
}
