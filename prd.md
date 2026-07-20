/goal implement all from this prd and Infos and verificate at the end that all functions are working 

 Island Duell — Product Requirements Document (PRD)
Version: v0.1
Typ: Browserbasiertes 3D-Multiplayer-Action/Survival-PvP
Spielerzahl: 2–5 Spieler, Free-for-all, gleiches WLAN (LAN)
Zielplattform: Desktop-Browser (WebGL2)
Status: Design-Baseline. Alle Zahlen sind Startwerte für das Balancing-Testing.

0. Noch zu bestätigen (Defaults sind gesetzt, aber überstimmbar)
#EntscheidungGesetzter DefaultAlternativeB1Match-ScoringPlatzierungs-Punkte über 3 feste RundenEliminierung „first to 2 wins"B2Modus v1Reines Free-for-allTeam-Modus (später)B3LobbyLock bei Match-Start, kein Mid-Match-JoinDynamischer Late-Join

1. Vision & Kern-Loop
Ein schnelles, lesbares PvP-Duell für 2–5 Spieler im selben WLAN. Jeder startet
getrennt auf einer kleinen, prozedural generierten Insel, lootet Waffen und
Ressourcen, und wird durch eine schrumpfende Zone und einen Tag/Nacht-Zyklus
zum finalen Kampf getrieben. Eine Runde dauert 8–11 Minuten; ein Match sind 3 Runden.

Kern-Loop pro Runde: Spawn → Loot (Tag) → Positionieren (Zone schrumpft, Nacht fällt) → Endkampf (finaler Ring) → Punkte.

Design-Prinzipien:

Klein & dicht schlägt groß & leer.
Jede Waffe hat einen klaren Nachteil — kein strikt bestes Item.
Komplexitäts-Budget fließt ins Kampfgefühl, nicht in Menüs.
LAN heißt <5 ms Latenz → kein Rollback/Lag-Comp, nicht over-engineeren.
2. Bestätigte Rahmen-Entscheidungen
ThemaEntscheidungKameraFirst-PersonMatch3 Runden, Platzierungs-Punkte (Details §6)NetzwerkNode.js + Socket.io, ein Spieler hostet, autoritativer HostZoneJa, mit sanften DoT-WertenTTKMittel (2–4 gute Treffer)CraftingMinimal (3 Rezepte)Rundenlänge8–11 min, im Test justierenBewegungSprint + normaler Jump, kein Double-JumpArtFertiges Low-Poly-Pack (z. B. Kenney) für v1PlattformNur Desktop-BrowserSpielerzahl2–5, Free-for-all

3. Spieler-Scaling (2–5)
Alles skaliert über die Lobby-Größe N (2 ≤ N ≤ 5), festgelegt beim Match-Start.

ParameterFormel / WertBeispiel N=2Beispiel N=5Belegte Spawn-POIsN von 5 (Ring, 80 m Radius, 72° Abstand)25Streu-Loot-Kisten3 × N615Feste POI-Kisten12 (konstant)1212Zonen-Finalring (Durchmesser)20 + 5×N m30 m45 mPlatzierungs-Punkte pro RundeTop-3 punkten (3/2/1)Sieger 3 / 03/2/1/0/0

Warum so: Loot-pro-Kopf bleibt konstant, egal ob 2 oder 5 spielen. Der
Finalring wächst leicht mit der Spielerzahl, damit das Endgame bei 5 kein reiner
Würfelwurf wird. Das Punktesystem reduziert sich bei N=2 exakt auf klassisches
Best-of-3.

4. Kernmechaniken
4.1 Spieler-Zustand
HP: 100, keine passive Regeneration (Heilung nur über Bandagen).
Bewegung: Laufen ~6 m/s, Sprint ~9 m/s (begrenzt/regenerierend optional), normaler Jump, kein Double-Jump. Rapier Character-Controller (Kinematic Capsule).
Inventar: 2 Waffenslots (Primär/Sekundär) + 1 Wurf-Slot + Verbrauchsgüter (Bandagen, Munition, Craft-Material).
4.2 Sammeln
Waffen/Items: sichtbare Pickups (Kisten, POIs) → Walk-over-Pickup, kein Menü.
Ressourcen: Interact-Hold (~1,5 s) an Bäumen/Felsen/Büschen.
4.3 Waffen-Baseline
WaffeTypSchadenKadenz/DrawReichweiteMunitionRolleFäusteMelee80,5 s1,5 m–FallbackMacheteMelee350,6 s2 m–Burst-NahkampfSpeerMelee280,8 s3,5 m–Reichweiten-MeleeBogenProjektil40 Körper / 70 Kopf1,0 s40 m/s PfeilPfeile (craftbar/aufsammelbar)Leise, Skill-belohntPistoleHitscan220,25 smittel7er-MagAllrounderGewehr (selten)Hitscan300,15 shoch20er-MagWin-Condition, muni-armSchrotflinte (selten)Hitscan (8 Pellets)12×8 (96 nah)0,9 shart fallend >8 m5erNahkampf-KonterGranateWurf60 Zentrum, Radius 5 m3 s Zünder–1–2 StückArea-Denial

Trade-off-Prinzip: Gewehr tödlich, aber laut + muni-arm. Bogen leise/stark, aber
Projektil muss gezielt werden. Schrotflinte kontert Rusher. Kein „strikt bestes" Item.

4.4 Ressourcen & Crafting (minimal, 3 Rezepte)
RezeptInputOutputZeitPfeileHolzPfeil-Bündel1 sBandageFiberHeilt 30 HP über 3 s1 sPanzerplatteStein−20 % Schaden, 1× Ladung~2 s

Kein XP, keine Level, kein Tech-Tree. Progression = Ausrüstung + Verbrauchsgüter + Positionierung.

5. Karte & Welt
5.1 Größe & Struktur
Spielfläche: 256 m × 256 m; Insel ~200 m Land-Durchmesser + Strandring.
Chunks: 32×32 m → 8×8 = 64 Chunks. Bei der Größe kann fast alles geladen bleiben; Chunks dienen v. a. Generierung + Instancing.
Kollision: Rapier Heightfield-Collider aus dem Noise-Terrain.
Fog: Tag ~100–120 m, Nacht ~50 m. Verkauft „offen", obwohl klein.
5.2 Landschaftselemente (jeweils mit Gameplay-Rolle)
ElementRolleRessourceLoot-QualitätWaldDeckung, Ambush, blockiert SichtlinienHolz (Bäume)gewöhnlich, sicherStrandoffen, exponiert — Risiko-Köder–Top-LootRuinen (zentral)dichte Nahkampf-Sichtlinien–Top-Loot, umkämpftPlateau/HöheSichtlinien-Vorteil, aber exponiert–gutFelsenharte DeckungSteinmittelBüsche–Fiber–

Loot an Risiko koppeln: beste Waffen exponiert (Strand/Ruinen), sichere Beute gewöhnlich (Wald).

5.3 Spawns (§3)
5 vorplatzierte, qualitätsgleiche Spawn-POIs auf einem Ring (80 m Radius, 72° Abstand).
Jeder Spawn-POI hat garantierten Loot-Floor: 1 Melee + 1 Ranged + 2 Bandagen in ~20 m. Niemand startet waffenlos.

6. Rundenablauf & Match
6.1 Phasen (Ziel-Rundenlänge ~11 min)
ZeitPhaseLichtZone0:00–3:00LootingTagoffen (~90 % der Insel)3:00–8:00ClosingDämmerung → NachtShrink 1 (3:00) + Shrink 2 (6:00)8:00–EndeEndgameNachtShrink 3 (8:30), finaler Ring (§3)

6.2 Tag/Nacht-Effekte
Tag: Fog ~120 m. Laute Waffen (Pistole/Gewehr/Schrot) pingen die Schützen-Position 2 s auf der Gegner-Minimap.
Nacht: Fog ~50 m. Mündungsfeuer sehr sichtbar; Fackel/Lampe verrät Position → Bogen (leise, kein Flash) wird nachts stark. Beide Waffenklassen bekommen ihr Zeitfenster.
6.3 Schrumpfende Zone
Kreisförmig, 3 Shrink-Schritte, finaler Durchmesser = 20 + 5×N m (§3).
DoT außerhalb: 2 HP/s (früh) → 5 HP/s (mittel) → 10 HP/s (final). Bestraft, tötet aber nicht sofort — kurzes Repositionieren bleibt möglich.
6.4 Match-Struktur (Default B1: Platzierungs-Punkte)
3 feste Runden. Jeder respawnt jede Runde (kein langes Zuschauen).
Punkte pro Runde: Platz 1 = 3, Platz 2 = 2, Platz 3 = 1, Rest 0.
Platzierung = Reihenfolge des Ausscheidens (letzter Überlebender = Platz 1).
Sieger: höchste Summe nach 3 Runden. Gleichstand → 1 Sudden-Death-Runde.
N=2-Reduktion: Sieger 3 / Verlierer 0 pro Runde → wer 2 Runden gewinnt (6:x), ist uneinholbar = klassisches Best-of-3.
Runden-Sieg: letzter Überlebender. Doppel-KO durch Zone → wer zuletzt Schaden verursachte, gewinnt; sonst geteilte Platzierung.
7. Balancing-Hebel
Gleichwertige Spawns: alle 5 Spawn-POIs identische Loot-Qualität.
Loot-Floor: garantiert Melee + Ranged pro Spawn.
Keine Stat-Progression: einzige Lücke ist Ausrüstung, und die droppt beim Tod.
Ping-on-loud: wer laut kämpft, verrät sich → Info für Schwächere.
Care-Package bei 5:00: markierter Airdrop mit einer Legendär-Waffe in Kartenmitte → Comeback-Ziel + erzwungener Konflikt (bei 5 Spielern ein starker Hotspot).
Platzierungs-Punkte über 3 Runden: stärkster Anti-Varianz-Hebel; eine Pechrunde entscheidet nichts.
8. Netcode-Architektur
Modell: Host-autoritativ. Ein Spieler startet node server.js; andere verbinden über LAN-IP. Der Host ist gleichzeitig Spieler.
Sync: Host broadcastet Full-Snapshot aller N Spieler @ 20 Hz. Bei N=5 ~4 KB/s — trivial im LAN.
Client-Interpolation: ~100 ms Buffer für Remote-Spieler. Lokaler Spieler client-predicted.
Trefferprüfung: host-seitig autoritativ (Hitscan + Projektil).
Bewusst NICHT gebaut: Rollback, Lag-Compensation, Interest-Management, Anti-Cheat. LAN-Latenz <5 ms macht das überflüssig.
Host-Vorteil: 0 ms Latenz für den Host; bei <5 ms LAN vernachlässigbar. Nicht kompensieren.
Message-Typen (Startpunkt): join, lobbyState, matchStart(N, seed), input (Client→Host), snapshot (Host→Clients, 20 Hz), event (Pickup/Damage/Death/Craft), roundEnd, matchEnd.

9. Technische Meilensteine
Reihenfolge so, dass früh ein spielbares Ergebnis entsteht — Netcode auf flacher Ebene vor der Welt (riskantestes Stück zuerst isolieren).

M0 — Skeleton (lokal, Single-Player): Three.js-Szene, flache Ebene, Player-Capsule, FP-Kamera, WASD + Maus, Rapier-Character-Controller. → Bewegung spielbar.
M1 — Netcode-Spike (2–5 Spieler, leere Welt): Node+Socket.io, LAN-IP-Connect, Position/Rotation-Sync @ 20 Hz, Client-Interpolation, Host-autoritativ. N Capsules sehen sich. Lobby-Grundgerüst (N=2..5).
M2 — Combat-Core: Hitscan + Projektil, HP, Schaden, Tod. Start mit 1 Melee + 1 Ranged. Trefferprüfung host-seitig. Kampfgefühl richtig kriegen.
M3 — Weltgenerierung: Noise-Terrain, Chunking, Instanced Vegetation, Fog, Heightfield-Collider, seed-basiert (Host sendet Seed → alle generieren identisch).
M4 — Systeme: Loot-Spawns (skaliert mit N), Pickup, Inventar, alle Waffen, Crafting, Tag/Nacht (Directional Light + Skybox-Lerp + Fog), Zone (Shader-Ring + DoT), Care-Package.
M5 — Round-Loop & Match: Phasen-Timer, Win/Lose, Platzierungs-Punkte über 3 Runden, Lobby-Lock, Rematch, Minimap + Ping-on-loud.
M6 — Polish: SFX, Mündungsfeuer, Hit-Feedback, UI/HUD, Low-Poly-Art-Pass, Perf-Tuning (LOD, Instancing, Draw-Call-Batching).
10. Tech-Stack (fixiert)
BereichTechnologieRenderingThree.js (Low-Poly, WebGL2)PhysikRapier.js (Character-Controller, Heightfield-Collider)MultiplayerNode.js + Socket.io, LAN-gehostetWeltChunk-basiert, Noise-Generierung, Instancing, FogArt (v1)Fertiges Low-Poly-Pack (z. B. Kenney)ZielplattformDesktop-Browser

11. Explizit außerhalb v1-Scope
Mobile/Touch-Support
Team-Modi
Internet-/Cloud-Hosting, Matchmaking
Anti-Cheat, Rollback-Netcode
Persistente Progression, Unlocks, Cosmetics
Voice-Chat
12. Offene Balancing-Fragen fürs Playtesting
TTK final justieren (aktuell 2–4 Treffer).
Zonen-DoT-Kurve & Shrink-Timing gegen Rundenlänge.
Loot-Dichte (3×N) — fühlt sich N=5 zu gedrängt an?
Care-Package-Waffe: wie stark darf „legendär" sein, ohne die Runde zu entscheiden?
Sprint-Ausdauer: mit/ohne Regeneration.

 Kurz-Analyse
Vision: Schnelles 3D-FP-PvP-Duell für 2–5 Spieler im LAN mit Loot + schrumpfender Zone + Tag/Nacht in 8–11 min Runden.
Kern-Loop: Spawn → Loot (Tag) → Positionieren (Zone schrumpft, Dämmerung) → Endkampf (Nacht) → Punkte über 3 Runden.
Zielplattform: Desktop-Browser (WebGL2), LAN-only.
Nicht-Ziele v1: Mobile, Team-Modi, Cloud/Matchmaking, Anti-Cheat, Rollback, Progression, Voice.
Constraint 1: Host-autoritativ, kein Rollback/Lag-Comp — LAN <5 ms macht es überflüssig.
Constraint 2: Skalierung strikt über N (2–5); Loot-pro-Kopf konstant, Finalring wächst leicht mit N.
Constraint 3: Kein „strikt bestes" Item — jede Waffe mit Nachteil; Loot an Risiko gekoppelt.
Constraint 4: Kenney Low-Poly-Assets für v1; TTK mittel (2–4 Treffer), keine passive HP-Regen.
2. Fixierte Entscheidungen
Thema	Entscheidung	Quelle im PRD
Kamera	First-Person	§2
Match-Format	3 Runden, Platzierungs-Punkte 3/2/1/0/0	§2, §6.4
Modus v1	Free-for-all	§0 (B2), §2
Lobby	Lock bei Match-Start, kein Late-Join	§0 (B1/B3)
Netzwerk-Modell	Node.js + Socket.io, ein Spieler hostet, host-autoritativ	§2, §8, §10
Sync-Rate	20 Hz Full-Snapshot, ~100 ms Client-Interpolation	§8
Trefferprüfung	Host-seitig (Hitscan + Projektil)	§8
Rendering	Three.js (WebGL2)	§10
Physik	Rapier.js — Kinematic-Capsule + Heightfield-Collider	§4.1, §5.1, §10
Bewegung	Laufen ~6 m/s, Sprint ~9 m/s, normaler Jump, kein Double-Jump	§4.1
HP	100, keine passive Regen	§4.1
Inventar	2 Waffen + 1 Wurf + Verbrauch	§4.1
Waffen-Baseline	Fäuste, Machete, Speer, Bogen, Pistole, Gewehr, Schrot, Granate	§4.3
Crafting	3 Rezepte: Pfeile, Bandage, Panzerplatte	§2, §4.4
Map-Größe	256×256 m, ~200 m Land-Durchmesser	§5.1
Chunks	32×32 m, 8×8 Grid, seed-basiert	§5.1, §9 M3
Spawn-POIs	5 auf Ring 80 m, 72° Abstand; Loot-Floor 1 Melee + 1 Ranged + 2 Bandagen	§3, §5.3
Loot-Skalierung	3×N Streu-Kisten + 12 feste POI-Kisten	§3
Fog	Tag ~120 m, Nacht ~50 m	§5.1, §6.2
Zone	3 Shrinks, Final-Ø = 20+5·N m, DoT 2 → 5 → 10 HP/s	§3, §6.3
Ping-on-loud	Schuss markiert Schütze 2 s auf Minimap	§6.2, §7
Care-Package	Bei 5:00 an Kartenmitte, 1 Legendärwaffe	§7
Rundensieg	Letzter Überlebender; Doppel-KO via Zone → letzter Schadensverursacher	§6.4
Sudden-Death	Bei Match-Gleichstand → 1 Extra-Runde	§6.4
Message-Typen	join, lobbyState, matchStart(N,seed), input, snapshot, event, roundEnd, matchEnd	§8
3. Offene Entscheidungen & Risiken
Punkt	Warum offen	Empfehlung	Blockiert Milestone
Sprint-Ausdauer (mit/ohne Regen)	§12 offen	Mit langsamer Regen starten, in Playtest justieren	M2
TTK-Feinjustage	§12 offen	Baseline aus §4.3 fahren, ab M5 anpassen	M5
Zonen-DoT-Kurve vs Rundenlänge	§12 offen	Startwerte 2/5/10 halten, Playtest ab M5	M5
Loot-Dichte bei N=5	§12 offen	3×N halten, in M5-Playtest prüfen	M4
Care-Package-Waffenstärke	§12 offen	Start: Gewehr voll geladen, kein OHK	M4
Munitions-Start & Drop-Raten pro Waffe	PRD schweigt	Tabelle vor Loot-Spawn definieren	M4
Bogen-Pfeile aufsammeln (Modus)	§4.3 nur „aufsammelbar"	Interact-Hold am Boden	M4
Fackel/Lampe als Item	§6.2 nur erwähnt	v1 weglassen, sofern Playtest es nicht fordert	M4
Rematch-Flow (Seed neu?)	§9 M5 nennt nur „Rematch"	Neuer Seed, gleiche Lobby	M5
Doppel-KO / geteilte Platzierung — Punktzuordnung	§6.4 undefiniert	Beide bekommen den höheren Platzwert	M5
Perf-Budget (Ziel-FPS, Draw-Calls, Snapshot-Bytes)	PRD schweigt	60 FPS Mittelklasse-Laptop, <200 DrawCalls, <5 KB/s bei N=5	M6
LAN-Discovery vs manuelle IP	PRD schweigt	v1 manuelle IP; Discovery nur wenn Zeit übrig	M1
Zuschauer-Modus für Tote in laufender Runde	PRD sagt „kein langes Zuschauen" nur zwischen Runden	Freie Kamera erlauben bis Runde endet	M5
4. Architektur-Skizze
Tech-Stack (aus §10): Three.js, Rapier.js, Node.js, Socket.io, Chunk-Noise-Welt, Kenney-Assets.

Modul-Baum (Vorschlag, muss in Aufgabe 1 bestätigt werden):

Netzwerk-Topologie:


5. Milestone-Plan
M0 — Skeleton (lokal, Single-Player)
Ziel: Ein Spieler bewegt sich auf flacher Ebene per WASD+Maus, springt und sprintet.
Exit-Kriterium: Browser lädt Szene, Kapsel steht durch Rapier auf der Ebene, FP-Kamera + Pointer-Lock funktionieren, stabile Framerate.
Aufgaben:
 Repo-Skeleton (Monorepo, TS-Config, client/, server/, shared/)
 Vite-Setup für client/
 Three.js-Basisszene, Directional Light, Bodenplane
 @dimforge/rapier3d-compat integrieren, flache Ebene mit Collider
 Kinematic-Capsule Character-Controller
 FP-Kamera-Rig (Yaw/Pitch) + Pointer-Lock
 WASD + Sprint + Jump (kein Double-Jump)
 Debug-Overlay (FPS, Position, Delta)
Abhängigkeiten: —
Risiken: (1) Rapier-WASM-Ladepfad unter Vite falsch → compat-Build synchron initialisieren. (2) Pointer-Lock-Bugs in Chromium → Standard-requestPointerLock()-Flow ohne Wrapper.
M1 — Netcode-Spike (2–5 Spieler, leere Welt)
Ziel: N Kapseln sehen sich in leerer Welt, korrekt interpoliert.
Exit-Kriterium: 2–5 Clients verbinden zu node server.js über LAN-IP; Host spielt gleichzeitig; Bewegung ruckelfrei.
Aufgaben:
 Node + Socket.io Server-Skeleton, LAN-Bind (0.0.0.0)
 shared/protocol.ts mit join, lobbyState, matchStart(N,seed), input, snapshot
 Lobby-Zustand serverseitig, Slots 2..5, N-Lock bei Match-Start
 Client-UI: LAN-IP-Eingabe, Ready-Toggle
 20 Hz Snapshot-Broadcast (Position/Rotation aller Spieler)
 Client-Snapshot-Buffer ~100 ms + Interpolation für Remote-Spieler
 Client-Prediction lokaler Bewegung + einfache Snap-back-Reconciliation
 Host-Prozess kombiniert (Server + Browser-Client) dokumentieren
 Ping-/Bandbreiten-Overlay
Abhängigkeiten: M0
Risiken: (1) Prediction driftet → einfache Distanz-Schwelle → Snap. (2) Manuelle IP-Eingabe unhandlich → letzte IP im localStorage cachen.
M2 — Combat-Core
Ziel: Spieler töten sich mit 1 Melee + 1 Ranged.
Exit-Kriterium: HP sinkt bei Treffern, Tod triggert Event, Damage ist host-autoritativ.
Aufgaben:
 Waffen-Statemachine (Draw, Fire, Cooldown)
 Hitscan-Waffe (Pistole) mit host-seitigem Raycast in Rapier
 Melee (Machete) mit Cone-/Sphere-Check
 HP-Komponente, keine Regen
 event: damage / death
 Client-Hit-Feedback (Hit-Marker, Damage-Flash) — rein visuell, keine Predicted-Kills
 Sofort-Respawn nach Tod auf Start-POI (für Spike, endgültig in M5)
 Balancing-Konstanten in shared/constants.ts
Abhängigkeiten: M1
Risiken: (1) Client zeigt Kill, Server verneint → nur Impact-FX predicten, nie den Kill. (2) Rapier-Raycast-Performance bei jedem Schuss → Query-Filter auf Player-Layer beschränken.
M3 — Weltgenerierung
Ziel: Alle Clients rendern dieselbe Insel aus Host-Seed.
Exit-Kriterium: Noise-Terrain 256×256 m + Chunking + Instanced Vegetation + Fog laufen in Ziel-Framerate; alle Clients pixel-identisch.
Aufgaben:
 Seed über matchStart verteilen, shared/math/rng.ts (seedbar)
 Noise-basierte Heightmap
 Chunk-System 32×32 m (8×8)
 Rapier Heightfield-Collider aus Heightmap
 Instanced Meshes für Bäume/Felsen/Büsche (Kenney)
 Strandring + Wasser-Plane
 Fog (Tag ~120 m)
 Deterministische Platzierung von POIs (Ruinen, Plateau, 5 Spawns) aus Seed
Abhängigkeiten: M1, M2
Risiken: (1) Bäume/Felsen kollidieren mit POIs → POI-Zonen als Exclusion-Mask im Placement. (2) Nicht-deterministische Reihenfolge (Map-Iteration, Async) → alle Generatoren strikt synchron und seed-basiert halten.
M4 — Systeme
Ziel: Inhaltlich vollständige Runde (Loot, Waffen, Crafting, Zone, Tag/Nacht, Care-Package).
Exit-Kriterium: Eine 8–11 min Runde ist end-to-end spielbar, jede Waffe funktioniert, Zone tötet außerhalb, Nacht kommt.
Aufgaben:
 Loot-Spawn-Placer mit N-Skalierung (3·N Streu + 12 feste POI-Kisten)
 5 Spawn-POIs mit garantiertem Loot-Floor (1 Melee, 1 Ranged, 2 Bandagen)
 Walk-over-Pickup + Interact-Hold für Ressourcen
 Inventar (2 Waffen + 1 Wurf + Verbrauch), Waffen-Swap
 Alle Waffen: Fäuste, Machete, Speer, Bogen, Pistole, Gewehr, Schrot, Granate
 Projektil-System (Bogen, Granate) host-autoritativ
 Crafting-3-Rezepte
 Tag/Nacht-Zyklus: Directional-Light-Lerp + Skybox-Lerp + Fog-Distance-Lerp
 Ping-on-loud: laute Waffen taggen Schützen 2 s auf Minimap
 Zone: Shader-Ring visuell, Shrink-Schedule (3 Stufen), DoT 2/5/10 HP/s
 Care-Package bei 5:00 mit markierter Legendärwaffe an Kartenmitte
Abhängigkeiten: M2, M3
Risiken: (1) Balancing-Explosion → alle Zahlen in constants.ts, Feintuning erst nach M5. (2) Granaten-Physik divergiert Client↔Host → Explosion nur host-seitig auflösen, Client zeigt Trail + FX aus Event.
M5 — Round-Loop & Match
Ziel: Vollständiges 3-Runden-Match mit Punkten, Rematch, HUD.
Exit-Kriterium: Match startet, endet, Punkte werden korrekt aggregiert, Sudden-Death funktioniert, Rematch mit neuem Seed möglich.
Aufgaben:
 Phasen-Timer (0:00–3:00 Loot, bis 8:00 Closing, ab 8:00 Endgame)
 Rundensieg = letzter Überlebender; Doppel-KO via Zone → letzter Schadensverursacher
 Platzierungspunkte 3/2/1/0/0
 Match-Aggregation, Sudden-Death bei Gleichstand
 Zuschauer-Modus (freie Kamera) für Ausgeschiedene bis Rundenende
 Round-End- und Match-End-UI mit Tabelle
 Lobby-Lock während Match; Rematch-Flow
 Minimap-Widget (POIs, Zone, Ping-on-loud)
 HUD: HP, Ammo, Zone-Timer, Punkte
Abhängigkeiten: M4
Risiken: (1) Sudden-Death-Endloszyklus → nach 2 Sudden-Death-Runden zufälliger Tiebreak. (2) Punktzuordnung bei geteilter Platzierung ambig → in §3 offener Punkt vor Implementierung klären.
M6 — Polish
Ziel: Präsentables Erlebnis, Perf-Ziel erreicht.
Exit-Kriterium: Ziel-Framerate auf Mittelklasse-Laptop, SFX komplett, Art-Konsistenz.
Aufgaben:
 SFX: Schüsse, Impacts, Fußstapfen, Zone-Warnung, Care-Package
 Mündungsfeuer + Muzzle-Light
 Hit-Marker + Kill-Feed
 LOD für Vegetation
 Draw-Call-Batching-Review
 Perf-Profiler-Overlay
 Kenney-Art-Konsistenz-Pass
 Loading-Screen + Lobby-Polish
Abhängigkeiten: M5
Risiken: (1) Perf-Bottleneck erst spät sichtbar → schon ab M3 Baseline messen, Regression alarmieren. (2) SFX-Latenz durch großen Asset-Load → SFX in kleinen Batches vorladen.
6. Querschnitts-Themen
Networking / State-Sync

 Ein Message-Katalog in shared/protocol.ts, versionierbar (v Feld)
 20 Hz Snapshot fix, 100 ms Interp-Buffer fix
 Client-Prediction nur für eigenen Move; alle anderen Zustände server-events
 Kein Rollback, keine Lag-Comp — bewusst nicht bauen (§8)
Performance-Budget

 Ziel: 60 FPS auf Mittelklasse-Laptop (in §3 zu bestätigen)
 Snapshot <5 KB/s bei N=5
 Vegetation ausschließlich Instanced
 Perf-Overlay ab M0 aktiv
Assets / Content

 Ausschließlich Kenney-Pack in v1
 Attributions-Datei anlegen
 Textur-Atlas-Regel: pro Chunk maximal ein Atlas-Bind
Build & Dev-Loop

 Monorepo mit Workspaces (client, server, shared)
 dev-Script startet Vite + Server parallel
 shared/ als reines TS-Package ohne Runtime-Deps
Tests (Fokus: Balancing-Formeln, kein E2E)

 Unit-Tests für N-Skalierungsformeln (§3)
 Unit-Tests für Punktetabelle und Sudden-Death
 Type-Guards für alle Protokoll-Messages
 LAN-Playtest ist die Netzwerk-Validierung
Determinismus

 Alle Generatoren nutzen shared/math/rng.ts
 Math.random in Generatoren verboten (Lint-Regel möglich)
 Reihenfolge-abhängige Iteration vermeiden (keine Map/Set ohne stabilen Sortierschritt)
Telemetrie / Debug

 Debug-Overlay: FPS, Ping, Bandwidth, Zone-Status, HP, Ammo
 Optionaler Kill-Log-Dump serverseitig (nach M5) für Balancing-Analyse
7. Vorgeschlagene Reihenfolge der nächsten 5 Aufgaben
Repo-Skeleton anlegen — Monorepo mit client/, server/, shared/, TS-Config, npm-Workspaces, ein dev-Command startet beide. S
Vite-Client mit Three.js-Basisszene — Bodenplane, Directional Light, Render-Loop, FPS-Counter. S
Rapier integrieren + Kinematic-Capsule — Kapsel steht auf Ebene, Basis für Character-Controller. M
FP-Kamera + WASD/Sprint/Jump mit Pointer-Lock — Lokal spielbar → M0 abgeschlossen. M
Socket.io-Skeleton + Lobby-Protokoll (join, lobbyState) — Server bindet LAN, Client verbindet per IP, Lobby-State läuft. Erster Schritt in M1. M