# Voidline Tactics

[![Deploy GitHub Pages](https://github.com/emfau88/Voidline-Tactic/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/emfau88/Voidline-Tactic/actions/workflows/deploy-pages.yml)

Mobile-first 2D-Flottentaktik in langsamer Echtzeit mit taktischer Pause: Du steuerst den Sollkurs eines Flaggschiffs per virtuellem Joystick, markierst Feuerziele und löst entscheidende Systeme selbst aus. Die Eskorte handelt halbautonom, Standardbatterien feuern aus passenden Seitenbögen und gegnerische Spezialangriffe werden sichtbar angekündigt.

## [▶ Jetzt im Browser spielen](https://emfau88.github.io/Voidline-Tactic/)

Der aktuelle Stand ist ein bedienbarer 2-gegen-2-Vertical-Slice mit Startschiffwahl, zwei Flaggschiff-Doktrinen, direkter Joystick-Steuerung, Fokusziel, vier Eskorte-Befehlen, Auto-Breitseiten, aufladbarer Rift Lance, physischen Void Torpedoes und aktivem Schild-Boost. **Pause**, **¼-Tempo** und **Live** können jederzeit gewechselt werden. Die frühere Kurszeichnung bleibt im Code erhalten, ist für diesen Steuerungstest aber bewusst inaktiv.

Die App nutzt auf Phones die volle verfügbare Breite, startet mit einer nahen 135-%-Kamera, rendert bis zu 2× HiDPI und bietet 80–180 % taktischen Zoom per Zwei-Finger-Geste, Buttons und Mausrad. Browser-Vollbild wird verwendet, wenn die Plattform ihn für Webseiten erlaubt; auf iOS ergänzt das installierbare Web-App-Manifest den „Zum Home-Bildschirm“-Fallback.

## Aktueller Mobile-Build

| Startschiff und Refit-Vorschau | Laufendes 2-gegen-2-Gefecht | Pause, Joystick und Lance-Telegraph |
|---|---|---|
| [<img src="docs/screenshots/mobile-fleet-selection.png" alt="Mobile Startschiffwahl mit Refit-Vorschau" width="260">](docs/screenshots/mobile-fleet-selection.png) | [<img src="docs/screenshots/mobile-combat-overview.png" alt="Mobile Echtzeit-Gefechtsübersicht mit Joystick, Sollkurs und gut markierten Gegnern" width="260">](docs/screenshots/mobile-combat-overview.png) | [<img src="docs/screenshots/mobile-target-preview.png" alt="Taktische Pause mit Joystick-Sollkurs, Zielkarte und Lance-Telegraph" width="260">](docs/screenshots/mobile-target-preview.png) |

Die Galerie wird reproduzierbar mit `npm run capture:readme` gegen den lokalen Server oder über `CAPTURE_BASE_URL` gegen einen anderen Build aktualisiert.

## So funktioniert der Kampf

1. **Steuern:** Den linken Stick in die gewünschte Richtung ziehen. Das Schiff dreht entsprechend Masse und Drehrate auf den angezeigten Sollkurs; beim Loslassen bleibt dieser Kurs aktiv.
2. **Ziel:** Einen Gegner antippen. Verfügbare Breitseiten feuern automatisch, sobald Entfernung und Seitenbogen passen.
3. **Spezialsysteme:** Lanze, Torpedo und Schild-Boost selbst auslösen. Die Lanze braucht eine stabile Feuerlösung; Torpedos existieren sichtbar im Raum und besitzen keinen Miss-Wurf.
4. **Zeit:** Mit PAUSE vollständig anhalten, in PLANEN auf ¼-Tempo beobachten oder mit LIVE normal weiterlaufen lassen. Alle Befehle bleiben in der Pause verfügbar.
5. **Formation:** Die Eskorte zwischen Folgen, linker/rechter Flanke und Schutz wechseln lassen. Der cyanfarbene Nebel reduziert eingehenden Schaden um 25 %.

Die Kernidee ist bewusste Verantwortungsteilung: Der Spieler trifft wenige hochwertige Entscheidungen, während Navigation, Standardfeuer und Eskorte kontinuierlich weiterarbeiten. So bleibt der Kampf auf Touch-Geräten verständlich, ohne statisch oder zäh zu werden.

## Projektstatus

- ✅ mobile-first App-Shell, Safe Areas, Fullscreen-Fallback, HiDPI und 80–180-%-Pinch-Zoom
- ✅ Startmenü mit Cruiser-/Frigate-Wahl, sichtbaren Loadouts und Refit-Vorschau
- ✅ deterministische 30-Hz-Fixed-Step-Simulation ohne versteckte Treffer- oder Abfangwürfe
- ✅ direkte träge Flaggschiff-Kinematik mit persistentem Joystick-Sollkurs und sichtbarer Kursanzeige
- 🧪 Kurszeichnung als reversible Alternative erhalten, aber im aktuellen Build bewusst inaktiv
- ✅ halbautonome Eskorte mit vier Direktiven und gegnerische Echtzeit-KI
- ✅ Auto-Breitseiten, manuelle Lanze/Torpedo/Schild-Systeme, Cooldowns und Energie
- ✅ physische Homing-Torpedos, Lance-Telegraph, Hardpoint-VFX, Nebel-Cover und Sieg/Niederlage
- ✅ Pause, ¼-Tempo und Live während jeder Kampfaktion
- ✅ 15 Unit-Tests und 14 Mobile-/Desktop-Browser-Läufe einschließlich Joystick, Multi-Touch, Pause und HiDPI
- ✅ automatisches, CI-geprüftes GitHub-Pages-Deployment
- 🚧 Combat-Feel-Pass: tiefere VFX, Trefferreaktionen, Kamera-Choreografie, Audio und Onboarding
- ⏳ Mission Results, Rewards, Shipyard-Upgrades und Persistenz

Den verbindlichen Fortschritt führt die [Roadmap](ROADMAP.md); jede relevante Änderung steht im [Changelog](CHANGELOG.md). Die [Top-20-Hebel](docs/planning/TOP_20_LEVERS.md) bewerten die Lücke zu den Konzeptbildern und geben messbare nächste Schritte vor.

## Lokal entwickeln

Voraussetzung ist Node.js 24 mit npm.

```powershell
npm ci
npm run dev
```

Für die vollständige Qualitätsprüfung:

```powershell
npm run check
npm run test:e2e
```

| Befehl | Aufgabe |
|---|---|
| `npm run dev` | lokaler Entwicklungsserver |
| `npm run typecheck` | TypeScript-Prüfung |
| `npm test` | deterministische Domänen- und Präsentationstests |
| `npm run test:e2e` | sieben Flows auf Mobile- und Desktop-Chromium |
| `npm run capture:readme` | drei reproduzierbare Mobile-Screenshots |
| `npm run build` | statischer Production Build in `dist/` |
| `npm run check` | Typecheck, Unit Tests und Production Build |

## Kanonische Dokumente

- [Roadmap](ROADMAP.md) – aktueller, überprüfbarer Projektstatus
- [Changelog](CHANGELOG.md) – chronologische Änderungshistorie
- [Game Vision](docs/design/GAME_VISION.md) – verbindliche Echtzeit-Produktvision und Designleitplanken
- [Art- und VFX-Richtung](docs/design/ART_AND_VFX_DIRECTION.md) – Bildsprache und Asset-Pipeline
- [Asset Manifest](docs/assets/ASSET_MANIFEST.md) – Herkunft, Version, Rechte-/IP-Status und Runtime-Pfade
- [Production Plan](docs/planning/PRODUCTION_PLAN.md) – phasenweiser Weg zum hochwertigen Vertical Slice
- [Top-20-Hebel](docs/planning/TOP_20_LEVERS.md) – priorisierte Lücke vom Build zum Mockup-Niveau
- [Repository Audit](docs/reviews/REPOSITORY_AUDIT.md) – historische Bestandsaufnahme des Ausgangsrepos
- [Prototype Notes](prototypes/README.md) – Einordnung früherer HTML-Interaction-Spikes

## Repository-Struktur

```text
src/
  app/                 Bootstrap, Anzeige und Startschiffwahl
  domain/combat/       pure Fixed-Step-Regeln, Kinematik, Waffen und KI
  game/                Phaser-Szene, Schiffsdarstellung und VFX
  ui/                  zugängliches DOM-HUD
tests/
  unit/                Combat-Core- und Hardpoint-Tests
  e2e/                 echte Mobile-/Desktop-Browser-Flows
scripts/               reproduzierbare Screenshot- und Projektwerkzeuge
docs/                   Vision, Planung, Screenshots, Art-Richtung und Audit
prototypes/             isolierte frühere Interaction-Spikes
```

Die Konzeptbilder unter `docs/reference/mockups/` sind visuelle Referenzen und keine Runtime-Assets. Neue Spielgrafik und Audio werden eigenständig produziert und mit Herkunft sowie Nutzungsrechten dokumentiert.
