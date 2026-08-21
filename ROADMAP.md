# Roadmap

Diese Datei ist der aktuelle, nachvollziehbare Projektstatus. Erledigte Meilensteine bleiben sichtbar; Detailänderungen stehen chronologisch im [CHANGELOG](CHANGELOG.md).

Stand: 21. August 2026

## Statuslegende

- ✅ abgeschlossen
- 🚧 in Arbeit
- ⏳ geplant
- ⛔ bewusst außerhalb des aktuellen Scopes

## M0 – Repository und Produktgrundlage ✅

- Repository analysiert und geordnet
- Vision, Audit, Produktionsplan und Art-/VFX-Richtung dokumentiert
- Prototyp v2 als Interaction Spike eingeordnet, v1 archiviert
- Risiken zu Architektur, Mobile UX, Assets und IP festgehalten

## M1 – Mobile-first Produktionsfundament 🚧

- ✅ Phaser 4, TypeScript, Vite und Vitest pinnen
- ✅ 390×844 Referenzviewport mit responsivem FIT-Scaling
- ✅ Boot- und Combat-Szene anlegen
- ✅ Playwright-Konfiguration für Mobile und Desktop
- 🚧 CI und GitHub Pages Deployment angelegt, Live-Verifikation ausstehend
- ✅ README um Live-Link, Spielanleitung und Entwickler-Workflow ergänzt

## M2 – Deterministischer Combat Core ✅

- ✅ feste 1000×1500 World Units unabhängig vom Viewport
- ✅ Combat State, Commands, Events und seedbarer Zufall
- ✅ Turn Flow, AP, Energy, Hull, Shield und Phasenregeneration
- ✅ gemeinsame Regeln für Preview, Spieler und KI
- ✅ datengetriebene Definitionen für vier Schiffe und drei Waffen
- ✅ Unit Tests für Winkel, Reichweite, Kosten, Schaden, Phasen und KI

## M3 – Spielbarer Mobile-Greybox-Slice ✅

- ✅ 2 Spieler- gegen 2 Gegnerschiffe
- ✅ Auswahl, Movement Radius, Ghost Path und Facing
- ✅ Broadside-, Lance- und Torpedo-Arcs
- ✅ verständliche Action Bar, Target Preview und End Turn
- ✅ kompakter, animierter Gegnerzug und Sieg/Niederlage
- ✅ Touch zuerst, Maus zusätzlich
- ✅ Hilfe- und Ergebnisdialoge, Reduced Motion und große Touch-Ziele
- ✅ Mobile-E2E-Tests für Shell, Hilfe, Bewegung und Gegnerphase

## M4 – Originale Art und Combat Feel ⏳

- eigenständiger Spieler-Cruiser als Art-Proof
- vier lesbare Schiffssilhouetten und Hardpoints
- Engine, Broadside, Lance, Torpedo und Shield VFX
- Audio-Busse, Varianten und Reduced Motion
- Parallax-Hintergrund und taktisches HUD

## M5 – Reward, Shipyard und Persistenz ⏳

- Mission Results, Credits und Salvage
- drei Trade-off-Upgrades
- versioniertes LocalStorage-Save
- Replay-Loop und ein zweiter Schwierigkeitszustand

## M6 – Qualität und Vertical-Slice-Release ⏳

- kontextuelles Onboarding
- Responsive-, Accessibility- und Browser-Matrix
- Visual Regression und Restart-/Memory-Soak
- externe Verständlichkeits-Playtests
- polierter öffentlicher Vertical Slice

## Später / außerhalb des Slice ⛔

- Boarding-Minispiel
- Officers und detaillierte Crew
- vollständige 10–15-Missionen-Kampagne
- Multiplayer, 3D, Open World und prozedurale Galaxie

## Nächster überprüfbarer Meilenstein

Das öffentliche GitHub-Pages-Deployment mit grüner CI, verständlicher README und direkt spielbarem Link. Danach folgt in M4 ein eigenständiger visueller Art-Proof für Schiff, Hintergrund, HUD und Combat-VFX.
