# Voidline Tactics

[![Deploy GitHub Pages](https://github.com/emfau88/Voidline-Tactic/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/emfau88/Voidline-Tactic/actions/workflows/deploy-pages.yml)

Mobile-first 2D-Flottentaktik in langsamer Echtzeit mit taktischer Pause: Du steuerst den Sollkurs eines Flaggschiffs per virtuellem Joystick, markierst Feuerziele und löst entscheidende Systeme selbst aus. Die Eskorte handelt halbautonom, Standardbatterien feuern aus passenden Seitenbögen und gegnerische Spezialangriffe werden sichtbar angekündigt.

## [▶ Jetzt im Browser spielen](https://emfau88.github.io/Voidline-Tactic/)

Der aktuelle Stand ist ein spielbarer Drei-Missionen-Slice mit Startschiffwahl, direkter Joystick-Steuerung, eskalierenden Feindverbänden, einnehmbaren Kontrollpunkten, Werft-Drohnen, Salvage, vier persistenten Upgrades und Replay. Auto-Breitseiten, aufladbare Rift Lance, physische Void Torpedoes und Shield Boost treffen deterministisch. **Pause**, **¼-Tempo** und **Live** können jederzeit gewechselt werden. Die frühere Kurszeichnung bleibt im Code erhalten, ist aber bewusst inaktiv.

Der Kampf ist für Mobile-Querformat ausgelegt und nutzt ein 2400×1400-World-Space-Schlachtfeld. Pinch zoomt stufenlos von 65–240 %, gleichzeitiges Zwei-Finger-Ziehen verschiebt die Karte und die Kamera kehrt danach sanft zur Formation zurück. Portrait zeigt eine klare Drehaufforderung. Browser-Vollbild wird verwendet, wenn die Plattform es erlaubt; das installierbare Web-App-Manifest bevorzugt Landscape-Fullscreen.

## Aktueller Mobile-Build

| Flotten- und Missionsauswahl | Landscape-Flottengefecht | Pause, Ziel und Lance-Telegraph |
|---|---|---|
| [<img src="docs/screenshots/mobile-fleet-selection.png" alt="Landscape-Auswahl von Startschiff und drei Kampagnenmissionen" width="260">](docs/screenshots/mobile-fleet-selection.png) | [<img src="docs/screenshots/mobile-combat-overview.png" alt="Landscape-Flottengefecht mit Joystick, großer Karte und Zwei-Daumen-HUD" width="260">](docs/screenshots/mobile-combat-overview.png) | [<img src="docs/screenshots/mobile-target-preview.png" alt="Taktische Pause mit Zielkarte, Sollkurs und Lance-Telegraph" width="260">](docs/screenshots/mobile-target-preview.png) |

Die Galerie wird reproduzierbar mit `npm run capture:readme` gegen den lokalen Server oder über `CAPTURE_BASE_URL` gegen einen anderen Build aktualisiert.

## So funktioniert der Kampf

1. **Steuern:** Den linken Stick in die gewünschte Richtung ziehen. Das Schiff dreht entsprechend Masse und Drehrate auf den angezeigten Sollkurs; beim Loslassen bleibt dieser Kurs aktiv.
2. **Ziel:** Einen Gegner antippen. Verfügbare Breitseiten feuern automatisch, sobald Entfernung und Seitenbogen passen.
3. **Spezialsysteme:** Lanze, Torpedo und Schild-Boost selbst auslösen. Die Lanze braucht eine stabile Feuerlösung; Torpedos existieren sichtbar im Raum und besitzen keinen Miss-Wurf.
4. **Zeit:** Mit PAUSE vollständig anhalten, in PLANEN auf ¼-Tempo beobachten oder mit LIVE normal weiterlaufen lassen. Alle Befehle bleiben in der Pause verfügbar.
5. **Formation:** Die Eskorte zwischen Folgen, linker/rechter Flanke und Schutz wechseln lassen. Der cyanfarbene Nebel reduziert eingehenden Schaden um 25 %.
6. **Kampagne:** Mission 2 führt einen Relaispunkt ein. Mission 3 ergänzt eine Werft, die nach Eroberung höchstens drei schwache Drohnen produziert. Siege bringen einmalig Salvage und eine Upgrade-Wahl.

Die Kernidee ist bewusste Verantwortungsteilung: Der Spieler trifft wenige hochwertige Entscheidungen, während Navigation, Standardfeuer und Eskorte kontinuierlich weiterarbeiten. So bleibt der Kampf auf Touch-Geräten verständlich, ohne statisch oder zäh zu werden.

## Projektstatus

- ✅ Landscape-first Combat-Shell, Safe Areas, Fullscreen-Fallback, HiDPI und 65–240-%-Pinch-Zoom samt Zwei-Finger-Pan
- ✅ Startmenü mit Cruiser-/Frigate-Wahl, Loadouts und drei freischaltbaren Missionen
- ✅ 2400×1400-Schlachtfeld mit längeren Waffenreichweiten und sanftem Formation-Follow
- ✅ deterministische 30-Hz-Fixed-Step-Simulation ohne versteckte Treffer- oder Abfangwürfe
- ✅ direkte träge Flaggschiff-Kinematik mit persistentem Joystick-Sollkurs und sichtbarer Kursanzeige
- 🧪 Kurszeichnung als reversible Alternative erhalten, aber im aktuellen Build bewusst inaktiv
- ✅ halbautonome Eskorte mit vier Direktiven und gegnerische Echtzeit-KI
- ✅ gestaffelte Hardpoint-Breitseiten mit sichtbaren Bolts, Mündungsblitzen, Rückstoß, Schildwellen und Hull-Splittern
- ✅ manuelle Lanze/Torpedo/Schild-Systeme, Cooldowns und Energie
- ✅ physische Homing-Torpedos, Lance-Telegraph, Hardpoint-VFX, Nebel-Cover und Sieg/Niederlage
- ✅ Pause, ¼-Tempo und Live während jeder Kampfaktion
- ✅ drei eskalierende Missionen, Relay-/Shipyard-Capture, begrenzte Drohnenproduktion, Salvage und vier persistente Upgrades
- ✅ 18 Unit-Tests und 16 Mobile-/Desktop-Browser-Läufe einschließlich Missionszielen, Kampagnenpersistenz, Joystick, Multi-Touch und Pause
- ✅ automatisches, CI-geprüftes GitHub-Pages-Deployment
- 🚧 Combat-Feel-Pass: tiefere VFX, Trefferreaktionen, Kamera-Choreografie, Audio und Onboarding
- 🚧 Upgrade-Darstellung an sichtbaren Hardpoints, vollständige Results-Metriken und zusätzliche Waffenvarianten

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
| `npm run test:e2e` | acht Flows auf Mobile- und Desktop-Chromium |
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
