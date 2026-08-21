# Voidline Tactics

[![Deploy GitHub Pages](https://github.com/emfau88/Voidline-Tactic/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/emfau88/Voidline-Tactic/actions/workflows/deploy-pages.yml)

Rundenbasierte 2D-Flottentaktik für den Browser: Schiffe positionieren, Facing planen, Feuerwinkel nutzen und Energie über mehrere Züge einteilen. Die Produktionsversion wird mobile-first mit Phaser, TypeScript und einer deterministischen Kampfdomäne entwickelt.

## [▶ Jetzt im Browser spielen](https://emfau88.github.io/Voidline-Tactic/)

Der aktuelle Stand ist ein vollständig bedienbarer 2-gegen-2-Mobile-Kampf mit Startschiffwahl, zwei echten Flaggschiff-Modulen, vier originalen Schiffen, eigenem Nebula-Schlachtfeld und Hardpoint-basierten Kampf-VFX. Die App nutzt auf Phones die volle verfügbare Breite, bietet 80–140 % taktischen Zoom und aktiviert den Browser-Vollbildmodus, sofern die Plattform ihn für Webseiten erlaubt. Auf iOS ergänzt ein fullscreen-fähiges Web-App-Manifest den „Zum Home-Bildschirm“-Fallback. Der öffentliche Link wurde zuletzt am **21. August 2026** auf Mobile-Chromium geprüft und wird nach jedem Push erst nach Typecheck, Unit Tests, Production Build und Browser-Tests veröffentlicht.

## Aktueller Mobile-Build

| Startschiff und Refit-Vorschau | Gefechtsübersicht | Ziel- und Schadensprognose |
|---|---|---|
| [<img src="docs/screenshots/mobile-fleet-selection.png" alt="Mobile Startschiffwahl mit Refit-Vorschau" width="260">](docs/screenshots/mobile-fleet-selection.png) | [<img src="docs/screenshots/mobile-combat-overview.png" alt="Mobile Gefechtsübersicht mit vier Schiffen" width="260">](docs/screenshots/mobile-combat-overview.png) | [<img src="docs/screenshots/mobile-target-preview.png" alt="Torpedo-Zielvorschau mit Trefferchance und Schadensprognose" width="260">](docs/screenshots/mobile-target-preview.png) |

Die Galerie lässt sich reproduzierbar mit `npm run capture:readme` gegen den lokalen Server oder über `CAPTURE_BASE_URL` gegen einen anderen Build aktualisieren.

## So funktioniert der Kampf

1. Eigenes Schiff auf dem Schlachtfeld auswählen.
2. Aktion im unteren HUD wählen.
3. Bei Bewegung das Ziel antippen und für die neue Ausrichtung ziehen; bei Waffen ein gegnerisches Schiff antippen.
4. Kosten und Vorschau prüfen, dann bestätigen.
5. Mit **RUNDE** den Gegnerzug starten.

Broadside wirkt seitlich, Lance nach vorn und Torpedo auf größere Distanz. Aktionspunkte begrenzen die Zahl der Manöver; Energie regeneriert zu Beginn der eigenen Phase.

## Projektstatus

- ✅ mobile-first App-Shell und responsives Touch-HUD
- ✅ echte Mobile-Vollbreite, Safe Areas, Fullscreen-Fallback und 80–140 % taktischer Zoom
- ✅ Startmenü mit Cruiser-/Frigate-Wahl, Flaggschiff-Modul und Refit-Vorschau
- ✅ deterministischer Combat Core mit seedbarem Zufall
- ✅ Movement, Facing, drei Waffen, Shield, Gegner-KI und Sieg/Niederlage
- ✅ Unit- und Browser-Tests für Mobile und Desktop
- ✅ automatisches, CI-geprüftes GitHub-Pages-Deployment
- ✅ vier originale Schiffsassets mit dokumentierter Herkunft und vollständigen Hardpoints
- ✅ originärer Nebula-Hintergrund mit dezentem Zwei-Layer-Stern-Parallax
- ✅ grundlegende Hardpoint-basierte Combat-VFX und Reduced-Motion-Fallbacks
- 🚧 zweiter taktischer HUD-Pass, tiefere VFX-Choreografien und Audio
- ⏳ Reward, Shipyard, Upgrades und Persistenz

Den verbindlichen Fortschritt führt die [Roadmap](ROADMAP.md); jede relevante Änderung steht im [Changelog](CHANGELOG.md). Die [Top-20-Hebel](docs/planning/TOP_20_LEVERS.md) messen die Lücke zu den Konzeptbildern und priorisieren die nächsten Produktionsschritte.

## Lokal entwickeln

Voraussetzung ist Node.js 24 mit npm.

```powershell
npm ci
npm run dev
```

Vite zeigt anschließend die lokale URL an. Für den vollständigen Qualitätslauf:

```powershell
npm run check
npx playwright install chromium
npm run test:e2e
```

| Befehl | Aufgabe |
|---|---|
| `npm run dev` | lokaler Entwicklungsserver |
| `npm run typecheck` | TypeScript-Prüfung |
| `npm test` | deterministische Domänen-Tests |
| `npm run test:e2e` | Mobile- und Desktop-Browser-Flows |
| `npm run capture:readme` | drei reproduzierbare Mobile-Screenshots |
| `npm run build` | statischer Production Build in `dist/` |
| `npm run check` | Typecheck, Unit Tests und Production Build |

## Kanonische Dokumente

- [Roadmap](ROADMAP.md) – aktueller, überprüfbarer Projektstatus
- [Changelog](CHANGELOG.md) – chronologische Änderungshistorie
- [Game Vision](docs/design/GAME_VISION.md) – Produktvision und Designleitplanken
- [Art- und VFX-Richtung](docs/design/ART_AND_VFX_DIRECTION.md) – originale Bildsprache und Asset-Pipeline
- [Asset Manifest](docs/assets/ASSET_MANIFEST.md) – Herkunft, Version, Rechte-/IP-Status und Runtime-Pfade
- [Production Plan](docs/planning/PRODUCTION_PLAN.md) – phasenweiser Weg zum hochwertigen Vertical Slice
- [Top-20-Hebel](docs/planning/TOP_20_LEVERS.md) – priorisierte Lücke vom aktuellen Build zum Mockup-Niveau
- [Repository Audit](docs/reviews/REPOSITORY_AUDIT.md) – Bestandsaufnahme und bekannte Risiken
- [Prototype Notes](prototypes/README.md) – Einordnung der isolierten HTML-Spikes

## Repository-Struktur

```text
src/
  app/                 Bootstrap und Spielkonfiguration
  domain/combat/       pure Regeln, Commands, Events und KI
  game/                Phaser-Szenen und Präsentation
  ui/                  zugängliches DOM-HUD
tests/
  unit/                Combat-Core-Tests
  e2e/                 echte Mobile-/Desktop-Browser-Flows
scripts/                reproduzierbare Projekt- und Dokumentationswerkzeuge
docs/                   Vision, Planung, Screenshots, Art-Richtung und Audit
prototypes/             isolierte frühere Interaction Spikes
```

Die Konzeptbilder unter `docs/reference/mockups/` sind visuelle Referenzen und keine Runtime-Assets. Neue Spielgrafik und Audio werden eigenständig produziert und mit Herkunft sowie Nutzungsrechten dokumentiert.
