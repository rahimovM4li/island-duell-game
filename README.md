# Island Duell (v0.1)

Browser-basiertes 3D-Multiplayer-Duell (FFA, 2–5 Spieler) auf einer prozeduralen Insel — LAN-only, ein Spieler hostet. Umsetzung des PRD v0.1.

## Schnellstart (LAN)

```bash
npm install        # einmalig
npm run build      # einmalig (Client-Produktionsbuild)
npm start          # startet den Host-Server auf Port 3000
```

Der Server druckt die LAN-URLs, z. B. `http://192.168.1.42:3000`. Alle Mitspieler
öffnen diese URL im Browser (Chrome/Edge/Firefox, WebGL2 nötig). Der erste
Spieler in der Lobby ist Host und startet das Match, sobald 2–5 Spieler da und
alle bereit sind.

Anderer Port: `PORT=4000 npm start`.

## Steuerung

| Taste | Aktion |
|---|---|
| WASD + Maus | Bewegen / Umsehen (Klick ins Spiel = Mauszeiger-Lock) |
| Shift | Sprinten (Ausdauer mit langsamer Regeneration) |
| Leertaste | Springen |
| Linksklick | Angreifen / Schießen / Granate werfen |
| R | Nachladen |
| 1 / 2 / 3 | Waffenslot 1 / 2 / Wurfslot |
| E (halten ~1,5 s) | Ressourcen abbauen (Baum→Holz, Fels→Stein, Busch→Fasern); kurz drücken: Waffe tauschen wenn beide Slots voll |
| H | Verband benutzen (30 HP über 3 s) |
| 4 / 5 / 6 | Craften: Pfeile (2 Holz) / Verband (2 Fasern) / Panzerplatte (3 Stein) |
| F3 | Debug-Overlay (FPS, Position, Bandbreite) |

Items am Boden werden durch Drüberlaufen aufgehoben.

## Spielregeln (Kurzfassung)

- **Match = 3 Runden.** Platzierungspunkte 3/2/1/0/0; bei N=2 exakt Best-of-3
  (Sieger 3 / Verlierer 0). Gleichstand nach Runde 3 → Sudden-Death-Runde(n).
- **Rundenablauf:** 0:00–3:00 Looting (Tag) → 3:00–8:00 Closing (Dämmerung,
  Zone schrumpft 3:00 und 6:00) → ab 8:00 Endgame (Nacht, letzte Zone 8:30).
  Finaler Ring: 20 + 5×N m Durchmesser. Zonenschaden 2 → 5 → 10 HP/s.
- **Spawns:** 5 POIs auf einem 80-m-Ring (72° Abstand), pro Spawn 1 Nahkampf-
  + 1 Fernkampfwaffe + 2 Verbände als Bodenloot. 12 feste POI-Kisten
  (Ruine/Strand = Top-Loot, Plateau = gut, Wald = einfach) + 3×N Streukisten.
- **Laut vs. leise:** Pistole/Gewehr/Schrot pingen den Schützen 2 s auf der
  Minimap, solange es hell ist. Bogen und Nahkampf sind lautlos.
  Minimap zeigt NIE Gegnerpositionen.
- **Care-Package** bei 5:00 in der Inselmitte (voll geladenes Gewehr).
- **Double-KO** durch die Zone: wer zuletzt Schaden ausgeteilt hat, gewinnt die
  Runde; sonst geteilte (bessere) Platzierung.
- Tote Spieler spektieren frei bis zum Rundenende. Rematch = gleiche Lobby,
  neue Insel (neuer Seed).

## Entwicklung

```bash
npm run dev        # Server (tsx watch, :3000) + Vite-Client (:5173) parallel
npm run typecheck  # tsc für shared/server/client
npm test           # Unit-Tests + E2E-Botmatch über echte Sockets
```

Der E2E-Test (`tests/match.e2e.test.ts`) spielt mit 3 Bot-Clients ein komplettes
Match über Socket.io; `TIME_SCALE` (Env) beschleunigt dafür die Rundenuhr,
ohne die Bewegungsphysik zu verändern.

## Architektur

```
shared/   deterministische Spiellogik: Konstanten (§-Balancing), Seed-RNG,
          Terrain (analytische Höhenfunktion), Worldgen, Timeline/Zone,
          Scoring, Protokoll (+Type Guards), Rapier-Physik, Movement-Sim
server/   Host-autoritativer GameRoom: Lobby, 30-Hz-Tick, Kampf (Melee/
          Hitscan/Projektile/Granaten), Zone, Loot/Kisten, Crafting,
          20-Hz-Snapshots, Wertung; Express + Socket.io, dient client/dist aus
client/   Three.js-Renderer (Chunk-Terrain 8×8 à 32 m, instanzierte Vegetation,
          Tag/Nacht, Nebel), Client-Prediction mit identischer Shared-Sim +
          Snap-Back-Reconciliation, ~100 ms Interpolation für Remote-Spieler,
          HUD/Minimap/Scoreboards, WebAudio-SFX
```

- Host sendet nur den **Seed** — Insel, Spawns, Kisten-Positionen und Vegetation
  generiert jeder Client deterministisch identisch (mulberry32 + Streams).
- Snapshots sind **vollständig** (20 Hz), Events (Schüsse, Treffer, Loot, …)
  kommen zusätzlich als Batch pro Tick. Kein Rollback/Lag-Compensation — LAN.

## Bewusste Abweichungen vom PRD

- **Grafik:** prozedurale Low-Poly-Meshes statt Kenney-Asset-Pack — das Repo
  bleibt ohne Downloads/Assets lauffähig.
- **Sound:** WebAudio-synthetisierte Effekte statt Audiodateien (gleiche
  Begründung).
- Bogenschütze bekommt Pfeile über Crafting (2 Holz → 4 Pfeile), Pfeilbündel
  liegen zusätzlich in Kisten.

## Nicht enthalten (out of scope v1, per PRD)

Mobile, Teams, Internet-Hosting/NAT, Anti-Cheat, Progression, Voice.
