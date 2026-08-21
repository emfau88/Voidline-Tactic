# Changelog

Alle nachvollziehbaren Änderungen an Voidline Tactics werden hier chronologisch dokumentiert. Das Format orientiert sich an Keep a Changelog; Commit-IDs werden nach dem jeweiligen Meilenstein ergänzt.

## [Unreleased]

Nächster Schwerpunkt: M4 – Originale Art und Combat Feel.

## [0.1.0] – 2026-08-21

Meilenstein-Commits:

- `09b5acc` – Mobile-first Phaser-Fundament
- `5f5c3d6` – deterministischer Combat Core
- `255a7e9` – spielbarer Mobile-Greybox-Slice
- `a4fa320` – CI und GitHub-Pages-Deployment

### Added

- Mobile-first Phaser-4-/TypeScript-/Vite-Produktionsgrundlage
- reproduzierbar gepinnte Runtime-, Build- und Testabhängigkeiten
- Boot- und Combat-Szene im 390×844 Referenzviewport
- Vitest- und Playwright-Grundkonfiguration
- `ROADMAP.md` als lebender Projektstatus
- `CHANGELOG.md` als chronologische Änderungshistorie
- renderer-unabhängiger Combat Core in festen 1000×1500 World Units
- datengetriebene Definitionen für vier Schiffe und Broadside, Lance und Torpedo
- Commands und Events für Bewegung, Rotation, Angriffe, Schild und Rundenwechsel
- seedbarer Zufall für reproduzierbare Treffer- und Schadensauflösung
- gemeinsame Waffenvalidierung für Preview, Spieler und Gegner-KI
- sieben Unit Tests für Bewegung, Arcs, Kosten, Schaden, Determinismus und Phasen
- vollständig bedienbarer 2-gegen-2-Mobile-Kampf mit Auswahl, Bewegung und Facing
- Touch-optimierte Action Bar mit großen Zielen, Ressourcenanzeigen und klarer Bestätigung
- Reichweiten-, Treffer-, Schild- und Hull-Vorschau für alle drei Waffen
- animierter Gegnerzug mit derselben Regelbasis wie der Spieler
- prozedurale Greybox-Schiffe, Schlachtfeld, Schilde, Treffer-, Projektil- und Explosions-VFX
- Hilfe- und Ergebnisdialoge, deutsche Statusmeldungen und Reduced-Motion-Unterstützung
- vier Mobile-Chromium-E2E-Tests für Layout, Hilfe, Touch-Bewegung und Gegnerphase

### Changed

- Combat-Szene vom statischen Architekturbeweis zum durchgängig spielbaren Mobile-Slice ausgebaut
- Schiffszustände und Aktionsverfügbarkeit werden nach jedem Command direkt im HUD gespiegelt
- README auf den spielbaren Produktionsstand, Mobile-Steuerung und lokalen Entwickler-Workflow aktualisiert
- Produktionsplan durchgängig auf Mobile-first als primäre Layout- und Eingabestrategie geschärft

### Infrastructure

- GitHub-Pages-Workflow mit Typecheck, Unit Tests, Production Build und Mobile-/Desktop-E2E-Gate angelegt
- Live-Spiel-Link und Deployment-Status in die README aufgenommen
- erstes öffentliches Deployment in [GitHub Actions Run 1](https://github.com/emfau88/Voidline-Tactic/actions/runs/32506418474) erfolgreich gebaut, getestet und veröffentlicht
- Live-Build auf 390×844 visuell, funktional und ohne Console Errors abgenommen

## [0.0.1] – 2026-08-21

Commit: `6ce1172`

### Added

- zentrale Projekt-README
- Repository Audit, Production Plan und Art-/VFX-Richtung
- Hinweise zur Verwendung und rechtlichen Einordnung der Mockups

### Changed

- Vision nach `docs/design/` verschoben
- Konzeptbilder verständlich benannt und nach `docs/reference/mockups/` verschoben
- HTML-Prototyp v2 als aktuellen Interaction Spike eingeordnet
- HTML-Prototyp v1 archiviert
