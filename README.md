# Island Duell (v0.1)

Browser-basiertes 3D-Multiplayer-Duell (FFA, 2–5 Spieler) auf einer prozeduralen
Insel mit serverautoritativem öffentlichen Matchmaking und persistenten
Code-Partys. Eine Party garantiert nur, dass Freunde in derselben Runde landen;
auf der Insel kämpft weiterhin jeder gegen jeden.

## Spielen und lokal starten

Öffentlich: [https://island-duell-game.onrender.com](https://island-duell-game.onrender.com)

```bash
npm install
npm run build
npm start          # Express, Socket.IO und Client auf Port 3000
```

Danach `http://localhost:3000` öffnen. Im Vite-Dev-Modus (`npm run dev`) verbindet
sich der Client automatisch mit `http://localhost:3000`; im Produktionsbuild
verwendet er dieselbe Origin. Eine abweichende öffentliche Adresse kann beim
Build über `VITE_MULTIPLAYER_URL` gesetzt werden. Es gibt keine IP-Eingabe in
der Spieleroberfläche.

Anderer Port (PowerShell): `$env:PORT=4000; npm start`

Anderer Port (macOS/Linux): `PORT=4000 npm start`.

Zusätzliche Browser-Origins werden serverseitig als kommaseparierte Allowlist
über `CORS_ORIGINS` ergänzt. Standardmäßig sind localhost und die Render-Origin
erlaubt. Cookies oder Credentials werden nicht verwendet.

## Lobby und Spielmodi

- **Schnellspiel:** privates Match nur für die aktuelle Code-Party, ab zwei
  echten Mitgliedern. Der Host kann bei zwei bis vier Spielern optional auf fünf
  Gegner mit Bots auffüllen. Diese Matches zählen als normale Matches, nicht als
  Training.
- **Multiplayer:** öffentliche Queue nur mit echten Spielern. Singles und ganze
  Partys werden kombiniert, wobei eine Party immer atomar in denselben Raum
  wechselt. Ab zwei Menschen läuft ein serverautoritärer 15-Sekunden-Countdown;
  bis fünf Spieler können währenddessen beitreten.
- **Training:** separates Solo-Match gegen konfigurierbare Bots. Mit aktiver
  Party ist Training gesperrt.

Teamcodes sind sechs Zeichen lang, nicht case-sensitiv und vermeiden
verwechselbare Zeichen. Party-Host, Mitglieder und Code bleiben nach einem Match
erhalten; bei einem Host-Austritt übernimmt ein verbundener Spieler.

## Steuerung

| Taste | Aktion |
|---|---|
| WASD + Maus | Bewegen / Umsehen (Klick ins Spiel = Mauszeiger-Lock) |
| Shift | Sprinten (Ausdauer mit langsamer Regeneration) |
| Strg | Schleichen; mit ausgerüsteter Sniper auf den Bauch legen |
| Leertaste | Springen |
| Linksklick | Angreifen / Schießen / Granate werfen |
| Rechte Maustaste | Mit Pistole/Gewehr/Schrotflinte/Scharfschützengewehr zielen |
| R | Nachladen |
| 1 / 2 / 3 oder Mausrad | Waffenslot 1 / 2 / Wurfslot auswählen beziehungsweise durch belegte Slots wechseln |
| E (halten ~1,5 s) | Ressourcen abbauen (Baum→Holz, Fels→Stein, Busch→Fasern); kurz drücken: Waffe tauschen wenn beide Slots voll |
| H | Verband benutzen (30 HP über 3 s) |
| 4 / 5 | Craften: Verband (2 Fasern) / Panzerplatte (3 Stein) |
| F3 | Debug-Overlay (FPS, Draw Calls, Dreiecke, Position/Tempo, Entities, Rapier, Netzwerk) |
| WASD + Maus (als Zuschauer) | Freecam fliegen und umsehen |
| Leertaste / Strg / Shift (als Zuschauer) | Hoch / runter / schneller fliegen |

Items am Boden werden durch Drüberlaufen aufgehoben.
Über **Einstellungen** im Hauptmenü oder Pause-Hinweis lassen sich Maus,
Gesamt-/Effekt-/Schrittlautstärke, Kamerabewegung, Grafikqualität und die
wichtigsten Tasten dauerhaft konfigurieren.

## Spielregeln (Kurzfassung)

- **Match = 3 Runden.** Platzierungspunkte 3/2/1/0/0; bei N=2 exakt Best-of-3
  (Sieger 3 / Verlierer 0). Gleichstand nach Runde 3 → Sudden-Death-Runde(n).
- **Zwei Tempi:** Klassisch bleibt bei etwa 8–11 Minuten pro Runde. Schnell
  komprimiert Zone und Care-Package auf etwa 5–7 Minuten; Bewegung,
  Feuerrate, Nachladen und Heilung bleiben unverändert.
- **Rundenablauf:** 0:00–3:00 Looting → 3:00–8:00 Closing
  (Zone schrumpft 3:00 und 6:00) → ab 8:00 Endgame (letzte Zone 8:30).
  Alle Runden bleiben bei klarer Tagesbeleuchtung.
  Finaler Ring: 20 + 5×N m Durchmesser. Zonenschaden 2 → 5 → 10 HP/s.
- **Spawns:** 5 Einstiege auf einem 80-m-Ring (72° Abstand), pro Spawn 1 Nahkampf-
  + 1 Fernkampfwaffe + 2 Verbände als Bodenloot. 12 feste POI-Kisten
  (Ruinen/Strandwrack = Top-Loot, Aussichtsposten/Waldbunker = gut,
  Wald = einfach) + 3×N Streukisten.
- **Landmarks:** offenes Strandwrack, begehbarer Aussichtsposten und enger
  Waldbunker besitzen eigene Silhouetten, Deckung, Collider und Minimapmarker.
- **Laut vs. leise:** Schusswaffen pingen den Schützen 2 s auf der
  Minimap. Nahkampf ist lautlos.
  Schleichen reduziert die hörbare Schrittlautstärke stark. Die Minimap zeigt
  NIE Gegnerpositionen; über Gegnern werden auch keine Namen eingeblendet.
- **Deckung:** Wald, große Büsche und Grasfelder brechen die Sichtlinie und
  ermöglichen Anschleichen, Verstecken und Hinterhalte. Der eigene Busch wird
  lokal verkleinert, damit die First-Person-Sicht benutzbar bleibt; Gegner sehen
  weiterhin die volle Deckung. Bewegung im Busch erzeugt ortbares Rascheln.
- **Kampflesbarkeit:** hostautoritatives Bewegungs-/Hipfire-Streumodell,
  kontrollierbarer Kamera-Recoil, dynamisches Fadenkreuz und getrennte
  Kopf-/Körperregionen. Sprinten, Schießen oder Waffenwechsel bricht Nachladen ab.
- **Care-Package** bei 5:00 in der Inselmitte (voll geladenes Gewehr).
- **Double-KO** durch die Zone: wer zuletzt Schaden ausgeteilt hat, gewinnt die
  Runde; sonst geteilte (bessere) Platzierung.
- Tote Spieler können bis zum Rundenende mit der Freecam über die Insel fliegen.
  Rematch = gleiche Lobby,
  neue Insel (neuer Seed). Der Death Recap zeigt Ursache, Distanz, letzten
  Schaden und Rest-HP des Gegners; die Wertung zeigt Kills, Schaden,
  Präzision und Loot.
- **Verbindungsausfälle:** Spieleridentitäten bleiben bei kurzen Aussetzern 12 Sekunden
  reserviert. Reconnect/Reload desselben Browser-Tabs nimmt die laufende Runde
  wieder auf; Hostwechsel und Verbindungsstatus werden verständlich angezeigt.

## Entwicklung

```bash
npm run dev        # Server (tsx watch, :3000) + Vite-Client (:5173) parallel
npm run assets:build # Blender-GLBs mit Meshopt komprimieren und validieren
npm run assets:validate # bestehende Atlas-/GLB-Ausgaben nur prüfen
npm run typecheck  # tsc für shared/server/client
npm test           # Unit-Tests + E2E-Botmatch über echte Sockets
npm run test:browser # Produktionsbuild + echter Headless-Edge-Smoke-Test
```

Der E2E-Test (`tests/match.e2e.test.ts`) spielt mit 5 Bot-Clients ein komplettes
Match über Socket.io, trennt einen Nicht-Host mitten in der Runde und prüft die
Wiederaufnahme derselben stabilen Spieleridentität. `TIME_SCALE` beschleunigt
dabei die Rundenuhr, ohne die Bewegungsphysik zu verändern.

Im laufenden Spiel stellt `window.__ISLAND_DUELL_DIAGNOSTICS__.snapshot()` in
den Browser-DevTools einen strukturierten Laufzeit-Snapshot bereit. Der
E2E-Test startet nach dem vollständigen Match zusätzlich ein Rematch und prüft
damit das Aufräumen und Neuaufbauen der Physikwelt.

## Architektur

```
shared/   deterministische Spiellogik: Konstanten (§-Balancing), Seed-RNG,
          Terrain (analytische Höhenfunktion), Worldgen, Timeline/Zone,
          Scoring, Protokoll (+Type Guards), Rapier-Physik, Movement-Sim
server/   PartyManager für Codes, Hostwechsel und Party-Reconnect; RoomManager
          für atomare Gruppen-Zuweisung sowie isolierte öffentliche, private
          Schnellspiel-, Trainings- und Legacy-Räume; pro Raum ein
          hostautoritatives GameRoom mit festem 30-Hz-Input-/Physik-Tick,
          begrenzte monotone Input-Queues, Kampf (Melee/Hitscan/Projektile/
          Granaten), Kampfstatistiken, Reconnect-Sitzungen,
          Zone, Loot/Kisten, Crafting,
          20-Hz-Snapshots, Wertung; Express + Socket.io, dient client/dist aus
client/   Three.js-Renderer (Chunk-Terrain 8×8 à 32 m, instanzierte Vegetation,
          Tag/Nacht, Nebel), Client-Prediction mit identischer Shared-Sim +
          Snap-Back-Reconciliation, ~100 ms Interpolation für Remote-Spieler,
          adaptive Renderauflösung, Solo-Onboarding und flüssige Zuschauer-Freecam,
          HUD/Minimap/Death-Recap/Scoreboards, persistente Einstellungen,
          räumliche WebAudio-SFX
```

- Host sendet nur den **Seed** — Insel, Spawns, Kisten-Positionen und Vegetation
  generiert jeder Client deterministisch identisch (mulberry32 + Streams).
- Snapshots sind **vollständig** (20 Hz), Events (Schüsse, Treffer, Loot, …)
  kommen zusätzlich als Batch pro Tick und ausschließlich in den zugehörigen
  Socket.IO-Raum.

PartyManager und RoomManager sind bewusst In-Memory und für genau eine
Render-Instanz ausgelegt. Horizontale Skalierung benötigt später geteilten
Party-/Room-/Token-State und einen Socket.IO-Adapter, beispielsweise Redis.

### Kompakte 3D-Assets

Waffen, Loot-Props, Vegetation, Ruinenobjekte, Spielfigur sowie Strandwrack,
Aussichtsposten und Waldbunker liegen in fünf Meshopt-komprimierten GLBs unter
`client/public/assets/`. Alle Modelle verwenden denselben 512×256-PNG-Atlas.
Die Dateien werden beim Beitritt parallel geladen und danach für alle Runden
gecacht; Geometrien und Textur werden zwischen Instanzen geteilt. Falls ein
Download oder die Decodierung fehlschlägt, verwendet der Client automatisch die
bisherigen prozeduralen Modelle.

Der editierbare Master liegt unter `art/island-duell-assets.blend`.
`scripts/blender/build_island_assets.py` erzeugt daraus Atlas, GLBs und das
gemeinsame Collider-Manifest. `npm run assets:build` weldet und komprimiert die
Blender-Exporte und prüft Namen, UVs, Dreiecks- sowie Downloadbudgets. Der genaue
Ablauf steht in `docs/ASSET_PIPELINE.md`.

## Bewusste Abweichungen vom PRD

- **Grafik:** eigene Low-Poly-GLBs mit gemeinsamem Texturatlas statt
  Kenney-Asset-Pack; prozedurale Meshes bleiben als Offline-Fallback erhalten.
- **Sound:** WebAudio-synthetisierte Effekte statt Audiodateien (gleiche
  Begründung).
- Bogen und Pfeile wurden vollständig aus Loot, Crafting, Inventar und Assets
  entfernt; ihr Anteil am Spawn-Loot wurde der Pistole zugeschlagen.

## Nicht enthalten (out of scope v1, per PRD)

Mobile Touch-Steuerung, Teams, Anti-Cheat, Konten/Cloud-Progression und Voice.
