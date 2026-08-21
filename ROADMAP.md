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

## M1 – Mobile-first Produktionsfundament ✅

- ✅ Phaser 4, TypeScript, Vite und Vitest pinnen
- ✅ 390×844 Referenzviewport für reproduzierbare Mobile-QA
- ✅ dynamische Vollbreiten-Shell mit Safe Areas statt fest eingeschlossener 390:844-Säule
- ✅ Browser-Fullscreen, fullscreen-fähiges Web-App-Manifest, Plattform-Fallback sowie kontrollierter 80–140-%-Zoom
- ✅ Boot- und Combat-Szene anlegen
- ✅ Playwright-Konfiguration für Mobile und Desktop
- ✅ CI und GitHub Pages Deployment live verifiziert
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

## M4 – Originale Art und Combat Feel 🚧

- ✅ eigenständiger Spieler-Cruiser als Art-Proof samt Asset-Provenienz
- ✅ vier lesbare Schiffssilhouetten und vollständige Hardpoint-Sets
- ✅ grundlegende Hardpoint-basierte Engine-, Broadside-, Lance-, Torpedo- und Shield-VFX
- 🚧 gestaffelte Waffen-Choreografien, Trefferreaktionen und VFX-Pooling
- ⏳ originale Audio-Busse, Varianten und Mobile-Audio-Unlock
- ✅ originaler Nebula-Base-Layer mit zwei deterministisch driftenden Sternlayern
- 🚧 taktisches HUD-Polish und Asset-Loading-Feedback
- ✅ erster HUD-System-Pass mit größeren Hierarchien, originalen Vektor-Icons und sichtbaren Aktionskosten
- ✅ sichtbare Lance-, Torpedo- und Broadside-Mounts auf den Schiffen
- ✅ drei reproduzierbare Mobile-Screenshots für README und visuelle Standabnahme

## M5 – Reward, Shipyard und Persistenz 🚧

- ✅ Hauptmenü mit Cruiser-/Frigate-Startwahl und klarer Loadout-Darstellung
- ✅ zwei spielwirksame Flaggschiff-Module: Bulwark-Schild und Vector Drive
- ✅ Refit-Vorschau für Waffenbucht, Schildmatrix und Vector Drive
- ⏳ Mission Results, Credits und Salvage
- ⏳ drei tatsächlich kauf-/ausrüstbare Trade-off-Upgrades
- ⏳ versioniertes LocalStorage-Save
- ⏳ Replay-Loop und ein zweiter Schwierigkeitszustand

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

Der Mobile-Shell-Baseline-Pass aus direktem Spieltest-Feedback ist abgeschlossen: Vollbreite, Fullscreen-Fallback, Zoom, Startschiffwahl, Flaggschiff-Module und der erste HUD-System-Pass sind integriert. Als nächstes folgen der zweite HUD-Pass, gekrümmte Movement-/Facing-Vorschau, echte Loadout-Slots mit weiteren sichtbaren Waffenvarianten und gestaffelte Waffen-/Treffer-Choreografien. Die Reihenfolge steht in der aktualisierten [Top-20-Gap-Analyse](docs/planning/TOP_20_LEVERS.md).
