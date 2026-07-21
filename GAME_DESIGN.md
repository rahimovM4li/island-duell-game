# Island Duell – Gameplay-Vertrag

## Spieler-Versprechen

Ein kurzes, taktisches First-Person-LAN-Duell, in dem Loot, Geräusche, Sichtlinien
und die schrumpfende Zone wichtiger sind als reine Reaktionsgeschwindigkeit.

## Kernloop

1. An einem Rand-POI spawnen und die erste Ausrüstung lesen.
2. Waffen, Heilung und Materialien looten oder craften.
3. Zwischen sicherer Deckung, guter Sicht und hochwertigem Loot abwägen.
4. Über Schritte, Schüsse, Minimap-Pings und Sichtkontakt Gegner orten.
5. Kämpfen, Platzierungspunkte erhalten und nach kurzer Wertung neu starten.

Primäre Verben: bewegen, schleichen/sprinten, zielen, kämpfen, looten, sammeln,
craften und heilen. Druck entsteht durch knappe Ausrüstung, verräterische laute
Waffen, schlechtere Nachtsicht und die Zone. Belohnt werden gute Positionierung,
gezieltes Risiko und Überleben. Tod führt sofort in den Zuschauermodus; die
nächste Runde ist der schnelle Retry.

## Level- und Begegnungsplan

- **Wald:** viel visuelle Deckung, Büsche und Gras; sicherere Rotation, aber
  kürzere Sicht und einfacheres Loot.
- **Strand:** offen und riskant; Top-Loot belohnt Spieler, die Sichtlinien und
  Timing beherrschen. Das mastartige **Strandwrack** ist der weithin sichtbare,
  kaum geschützte Top-Loot-Hotspot.
- **Plateau:** Der begehbare **Aussichtsposten** liefert Höhenvorteil und gutes
  Loot, ist aber gut sichtbar und nur über eine exponierte Treppe erreichbar.
- **Waldbunker:** enge Sichtlinien und harte Seiten-/Rückendeckung; mittleres
  Risiko und gutes Loot als Alternative zum offenen Plateau.
- **Zentrale Ruinen:** harte Deckung, Stein-Schritte und Care-Package; spätes
  Match zwingt konkurrierende Routen hier zusammen.
- **Spawnring:** fünf getrennte Einstiege mit sofort lesbarem Grundloot;
  verhindert frühe Zufallstode ohne Entscheidungen.

Pacing: ruhiges Eröffnungslooting → erste Geräusch-/Sichtkontakte → zwei
Zonenschritte mit erzwungener Rotation → dunkler, enger Endkampf.

## Game Feel und Lesbarkeit

- Horizontale Bewegung beschleunigt und bremst kontrolliert; Client und Host
  verwenden dieselbe Simulation und gleichen Position sowie Geschwindigkeit ab.
- Zielen verändert Haltung, Viewmodel und FOV; Nachladen besitzt eine sichtbare
  Viewmodel-Animation und wird durch Sprint, Schuss oder Waffenwechsel abgebrochen.
- Jede Feuerwaffe besitzt getrennte Hipfire-/ADS-/Bewegungsstreuung und einen
  kontrollierbaren Recoil. Das dynamische Fadenkreuz bildet Bewegung und Bloom
  ab; Kopf- und Körperregion werden hostautoritativ unterschieden.
- Schritte variieren nach Gras, Sand und Stein. Schleichen ist deutlich leiser,
  Sprinten schneller und lauter. Schritte, Schüsse, Explosionen und
  Buschrascheln sind relativ zur Blickrichtung im Stereo-Pan ortbar.
- Treffer, Schaden, Explosionen, Eliminierungen, Tod, Pickups und Rundenergebnis
  haben jeweils getrenntes visuelles und akustisches Feedback.
- Gegnernamen existieren nur in Lobby, Killfeed und Wertung – nie über der Figur.
- Eigene Buschdeckungen werden nur lokal auf 34 % skaliert; andere Clients sehen
  weiterhin den vollen Busch. Death Recap und Rundenstatistiken erklären
  Kampfausgänge ohne zusätzliche Gegnerinformationen während des Lebens.
- `prefers-reduced-motion` deaktiviert vermeidbare Kamerabewegung und UI-Punches.

## Technischer Laufzeitvertrag

Pro Client-Frame: Eingabe → gemeinsame Bewegungsprognose → Rapier-Schritt →
Kamera → Remote-Interpolation → Welt/HUD → Entities/FX → Diagnose → Render.
Der Host simuliert mit 30 Hz und sendet vollständige Snapshots mit 20 Hz.

Physik: Rapier 3D mit statischem Heightfield und primitiven Baum-, Fels- und
Ruinen-/Landmark-Collidern; Spieler sind kinematische Kapseln. Projektile und Treffer
werden host-autoritativ per eigener Integration/Raycast verarbeitet. Es gibt
keine dynamischen Rigid Bodies, Sensoren oder CCD-Körper. Eine Physikwelt wird
bei Matchende vollständig freigegeben und beim Rematch neu aufgebaut.

Determinismus: Welt, Loot, Kampfstreuung, Client-FX und SFX verwenden getrennte,
vom Match-Seed abgeleitete Zufallsströme. F3 sowie
`window.__ISLAND_DUELL_DIAGNOSTICS__.snapshot()` liefern Render-, Entity-,
Physik-, Eingabe- und Netzwerkwerte für reproduzierbare Fehlerberichte.

Netzwerk: Die Socket-Verbindung und die veröffentlichte Spieler-ID sind getrennt.
Ein geheimes, tabgebundenes Resume-Token bindet einen neuen Socket innerhalb
von 12 Sekunden wieder an dieselbe Matchfigur. F3 zeigt RTT, Jitter und
Probeverlust; Hostwechsel und Serverausfälle haben sichtbare Statusmeldungen.

## Bewusste Nicht-Ziele

Mobile Steuerung, Teams, Cloud-Matchmaking/NAT-Traversal, Meta-Progression,
Lag-Compensation/Rollback, Anti-Cheat und Voice-Chat bleiben außerhalb von v1.
