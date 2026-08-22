# Roadmap

Diese Datei ist der aktuelle, überprüfbare Projektstatus. Erledigte Meilensteine bleiben sichtbar; jede relevante Änderung steht chronologisch im [Changelog](CHANGELOG.md).

Stand: 22. August 2026  
Aktiver Produktpfad: **Fleet Corridors – indirekte Mobile-Flottenstrategie**

## Legende

- ✅ abgeschlossen
- 🚧 in Arbeit
- ⏳ geplant
- ⛔ außerhalb des aktuellen Scopes

## M0 – Repository, Deployment und Qualität ✅

- Repository-Audit, Vision, Produktionsplanung und Asset-Provenienz
- Phaser 4, TypeScript, Vite, Vitest und Playwright reproduzierbar gepinnt
- GitHub Pages mit Typecheck, Unit-, Build- und Browser-Gate
- installierbare Landscape-PWA, Safe Areas, Fullscreen-Fallback und HiDPI
- reproduzierbare README-Screenshots

## M1 – Deterministischer Combat-Core ✅

- 2400×1400 World Space und 30-Hz-Fixed-Step
- träge Kinematik, Beschleunigung, Drehrate und Separation
- Hull, Shield, Armor, Energy, Cooldowns und Nebelreduktion
- Auto-Breitseite, aufladbare Lance, physische Homing-Torpedos und Shield Boost
- deterministische gültige Treffer; keine Miss-/Intercept-Würfe
- vier originale Schiffspräsentationen mit sichtbaren Hardpoints und Startmodulen

## M2 – Fleet-Corridors-Domain ✅

- obere, mittlere und untere natürliche Route mit zwei Junctions
- fünf Haltungen: Angriff, Breitseite, Halten, Abstand und Rückzug
- rollenbasierte autonome Navigation und Zielpriorisierung
- echte Korridorbindung für Feuerlösungen und Junction-Routing für Transfers
- oberes Relais, untere Werft/Nebelzone und mittlerer Direktweg
- Versorgung, Regeneration, Deployment-Cooldown, Fregatte/Zerstörer und 7-Schiff-Limit
- strategische Gegner-KI nutzt dieselben Regeln und reagiert auf Routendruck/Objectives
- Sieg/Niederlage über die Command Ships
- 11 Fleet-Unit-Tests; insgesamt 30 Unit-Tests grün

## M3 – Spielbarer Mobile-Proof-of-Concept ✅

- Startwahl aus Cruiser/Frigate und verpflichtendes sichtbares Aegis-/Vector-Modul
- Startflotten mit je zwei Schiffen; skalierbar auf 3–7 pro Seite
- Routengruppen-Haltung statt direkter Einzelsteuerung
- Schiffe navigieren, wenden, wählen Ziele und feuern autonom
- Einzelwahl nur für Telemetrie, optionalen Fokus/Spezialsysteme und seltenen Transfer
- Full-bleed-Karte ohne reservierten Bottom-HUD-Streifen
- freies One-Finger-/Maus-Pan ohne Auto-Rücksprung
- Pinch-/Mausrad-/Button-Zoom von 72–270 % plus expliziter Flottenfokus
- deutsches Command-HUD, Prozent-Telemetrie und kontextuelle Vier-Schritt-Einführung
- Relais-/Werft-Capture, Versorgung und manuelles Deployment vollständig spielbar
- 18/18 E2E-Gates auf 844×390, 667×375 und Desktop

## M3.1 – Strategie- und Balance-Validierung ✅

- 100/100 Headless-Matches abgeschlossen
- Median 204 s, P90 297 s, erster Verlust median nach 37 s
- Center Push: 122 s Median
- Upper Relay: 215 s Median
- Lower Shipyard/Nebel: 204 s Median
- 167 Captures, 1.166 Deployments, Peak 14 Schiffe
- kritische Bewertung dokumentiert

Offene Befunde:

- 🚧 84 % Spielersiege sind zu leicht
- 🚧 Center Push ist gegenüber Seitensystemen zu effizient
- 🚧 Command-Ship-Zielzeit entsteht noch zu stark über reine Lebenspunkte
- 🚧 Objective-Boni sind regelwirksam, aber visuell nicht konkret genug erklärt

## M4 – Combat Readability und audiovisuelle Wirkung 🚧

- ✅ klare Routengrafik, Junctions, Owner-Farben und Capture-Ringe
- ✅ feindliche rote Konturen, Zielmarker, Schildringe und Healthbars
- ✅ Broadside-Bolts, Lance-Beam, Torpedos, Trefferwellen und Explosionen
- 🚧 Center-Risiko und Objective-Feedback visuell stärker kommunizieren
- 🚧 klassenspezifische Salven, Trefferreaktionen und Zerstörungssequenzen
- 🚧 Command-Ship-Phasen statt HP-Schwamm
- ⏳ originale Audio-Busse, UI-/Waffen-/Impact-Varianten, Ducking und Mobile-Unlock
- ⏳ VFX-Pooling, Performance-Telemetrie und Drei-Match-Memory-Soak
- ⏳ lesbare 7v7-Formation ohne Effekt-/Marker-Chaos

### Abnahme M4

- erster Waffeneffekt in höchstens 35 Sekunden
- Center, Relais und Werft sind ohne Hilfe visuell unterscheidbar
- Spieler kann Trefferquelle, Objective-Owner und Rückzugsgrund erklären
- stabile 60 FPS auf Pixel-7-Klasse bei 7v7 und drei vollständigen Restarts
- keine wachsenden Projectile-/VFX-Objektzahlen

## M5 – Verständlichkeit, Balance und erster Content-Loop 🚧

- ✅ In-App-Kurzanleitung und makroorientierte Hilfe
- 🚧 fünf externe Mobile-Erstspieler mit Zeit-, Fehl- und Verständnisprotokoll
- 🚧 Siegquote Richtung 55–65 % und Strategiedauern näher zusammenführen
- ⏳ Nachkampfbericht: Routendruck, Captures, Verluste, Versorgung und Wendepunkt
- ⏳ zweiter sichtbarer Waffen-Montageschritt im Preflight
- ⏳ Reward → sichtbarer Refit → nächster Einsatz
- ⏳ drei langsam eskalierende Missionen auf Basis desselben Fleet-Loops
- ⏳ Vorschau auf nächste Hüllen, Rollen und Waffen ohne Meta-Überladung

## M6 – Hochwertiger Vertical Slice ⏳

- drei abgestimmte Missionen mit verständlicher Eskalation
- vollständiger Audio-/VFX-/Damage-State-Pass
- originale sichtbare Waffen- und Schiffsupgrades
- Accessibility-, Browser-, Performance- und Visual-Regression-Matrix
- finale Credits, Lizenz-/Datenschutzhinweise und Save-Reset
- öffentlich markierter Vertical-Slice-Release

## Außerhalb des aktuellen Scopes ⛔

- Multiplayer
- 3D, Höhenebenen oder freie ballistische Physik
- Open World, prozedurale Galaxie und 10–15-Missionen-Kampagne
- Boarding, Officers und detaillierte Crewverwaltung
- komplexer Task-Force-Editor vor einem bewiesenen Drei-Missionen-Loop

## Aktuelle Position

Wir stehen am Ende von **M3.1**: Der neue Fleet-Corridors-Kern ist implementiert, mobil bedienbar, automatisiert getestet und als einzelner PoC spielbar. Der frühere Joystick-/Drei-Missionen-Pfad bleibt nur noch als Legacy-Code im Repository und ist nicht aktiv.

Der nächste überprüfbare Meilenstein ist **M4 „Combat Readability und audiovisuelle Wirkung“**. Reihenfolge: Center-/Objective-Balance → konkretes Objective-Feedback → Audio-Foundation → klassenbasierte Waffen-/Trefferchoreografie → 7v7-Performance. Erst danach wird der PoC zu drei Missionen erweitert. Die priorisierte Reihenfolge steht in den [Top-20-Hebeln](docs/planning/TOP_20_LEVERS.md).
