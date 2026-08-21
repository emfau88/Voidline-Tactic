# Changelog

Alle nachvollziehbaren Änderungen an Voidline Tactics werden hier chronologisch dokumentiert. Das Format orientiert sich an Keep a Changelog; Commit-IDs werden nach dem jeweiligen Meilenstein ergänzt.

## [Unreleased]

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
