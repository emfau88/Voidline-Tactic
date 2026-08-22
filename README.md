# Voidline Tactics

[![Deploy GitHub Pages](https://github.com/emfau88/Voidline-Tactic/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/emfau88/Voidline-Tactic/actions/workflows/deploy-pages.yml)

Mobile-first 2D-Flottentaktik in langsamer Echtzeit mit taktischer Pause: Du steuerst den Sollkurs eines Flaggschiffs per virtuellem Joystick, markierst Feuerziele und löst entscheidende Systeme selbst aus. Die Eskorte handelt halbautonom, Standardbatterien feuern aus passenden Seitenbögen und gegnerische Spezialangriffe werden sichtbar angekündigt.

## [▶ Jetzt im Browser spielen](https://emfau88.github.io/Voidline-Tactic/)

Der aktuelle Stand ist ein spielbarer Drei-Missionen-Slice mit Startschiffwahl, einem verpflichtenden **sichtbaren Startmodul vor dem ersten Kampf**, direkter Joystick-Steuerung, eskalierenden Feindverbänden, einnehmbaren Kontrollpunkten, Werft-Drohnen, Salvage, vier persistenten Upgrades und Replay. Mission 1 ist ein echtes 1v1; Eskorte und größere Verbände beginnen erst danach. Auto-Breitseiten, aufladbare Rift Lance, physische Void Torpedoes und Shield Boost treffen deterministisch. **Pause**, **¼-Tempo** und **Live** können jederzeit gewechselt werden. Die frühere Kurszeichnung bleibt im Code erhalten, ist aber bewusst inaktiv.

Der Kampf ist für Mobile-Querformat ausgelegt und nutzt ein 2400×1400-World-Space-Schlachtfeld. Die Weltkamera läuft unter dem schwebenden HUD bis zum unteren Displayrand und belegt rund 90 % der Höhe unterhalb der 34-px-Topbar; es gibt keinen reservierten schwarzen Bottom-Streifen. Hülle, Schild und Energie stehen kompakt oben links, der Joystick frei unten links und vier getrennte, cooldownfähige Ability-Buttons unten rechts. Pinch zoomt stufenlos von 65–240 %, gleichzeitiges Zwei-Finger-Ziehen verschiebt die Karte und die Kamera kehrt danach sanft zur Formation zurück. Portrait zeigt eine klare Drehaufforderung. Browser-Vollbild wird verwendet, wenn die Plattform es erlaubt; das installierbare Web-App-Manifest bevorzugt Landscape-Fullscreen.

## Aktueller Mobile-Build

| Schiff und sichtbares Startmodul | Echtes 1v1-Kalibrierungsgefecht | Pause, Ziel und Lance-Telegraph |
|---|---|---|
| [<img src="docs/screenshots/mobile-fleet-selection.png" alt="Landscape-Auswahl mit sichtbar montiertem Aegis-Emitter vor Mission 1" width="260">](docs/screenshots/mobile-fleet-selection.png) | [<img src="docs/screenshots/mobile-combat-overview.png" alt="Echtes 1v1 mit vollflächiger Karte, Telemetrie oben links und getrennten Ability-Buttons" width="260">](docs/screenshots/mobile-combat-overview.png) | [<img src="docs/screenshots/mobile-target-preview.png" alt="Taktische Pause im 1v1 mit Zielerfassung, Lance-Telegraph und sichtbarem Cooldown" width="260">](docs/screenshots/mobile-target-preview.png) |

Die Galerie wird reproduzierbar mit `npm run capture:readme` gegen den lokalen Server oder über `CAPTURE_BASE_URL` gegen einen anderen Build aktualisiert.

## So funktioniert der Kampf

1. **Montieren:** Vor dem Start genau ein sichtbares Modul wählen. Aegis gibt +12 Schild; Vector gibt +10 Tempo und +12 % Drehrate. Der Start bleibt bis zur Montage gesperrt.
2. **Steuern:** Den linken Stick in die gewünschte Richtung ziehen. Das Schiff dreht entsprechend Masse und Drehrate auf den angezeigten Sollkurs; beim Loslassen bleibt dieser Kurs aktiv.
3. **Ziel:** Einen Gegner direkt antippen oder mit **ZIEL** wechseln. Vergrößerte unsichtbare Touch-Flächen helfen auch im Überblickzoom. Verfügbare Breitseiten feuern automatisch, sobald Entfernung und Seitenbogen passen.
4. **Spezialsysteme:** Lanze, Torpedo und Schild-Boost selbst auslösen. Die Lanze braucht eine stabile Feuerlösung; Torpedos existieren sichtbar im Raum und besitzen keinen Miss-Wurf.
5. **Zeit:** Mit PAUSE vollständig anhalten, in PLANEN auf ¼-Tempo beobachten oder mit LIVE normal weiterlaufen lassen. Alle Befehle bleiben in der Pause verfügbar.
6. **Steigerung:** Mission 1 ist nur dein gewähltes Schiff gegen einen Cinder Scout. Mission 2 führt Eskorte, weitere Gegner und den Relaispunkt ein. Mission 3 ergänzt eine eroberbare Drohnenwerft.

Die Kernidee ist bewusste Verantwortungsteilung: Der Spieler trifft wenige hochwertige Entscheidungen, während Navigation, Standardfeuer und Eskorte kontinuierlich weiterarbeiten. So bleibt der Kampf auf Touch-Geräten verständlich, ohne statisch oder zäh zu werden.

## Projektstatus

- ✅ Landscape-first Combat-Shell, Safe Areas, Fullscreen-Fallback, HiDPI und 65–240-%-Pinch-Zoom samt Zwei-Finger-Pan
- ✅ Full-field Mobile-HUD ohne reservierten Bottom-Streifen: 48-px-Telemetrie oben links, 64-px-Joystick und getrennte 46–68-px-Ability-Buttons mit Cooldown-Ringen
- ✅ Startmenü mit Cruiser-/Frigate-Wahl, verpflichtender sichtbarer Aegis-/Vector-Montage und drei freischaltbaren Missionen
- ✅ Mission 1 als echtes 1v1; Eskorte ist im Combat und HUD erst ab späteren Missionen aktiv
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
- ✅ 19 Unit-Tests und 24 Browser-Läufe auf 844×390, 667×375 und Desktop einschließlich Preflight-Montage, echtem 1v1, Ziel-Toleranz, Joystick, Multi-Touch und Kampagnenpersistenz
- ✅ automatisches, CI-geprüftes GitHub-Pages-Deployment
- 🚧 Combat-Feel-Pass: tiefere VFX, Trefferreaktionen, Kamera-Choreografie, Audio und Onboarding
- 🚧 zweiter sichtbarer Waffen-Slot, kleinere echte Starterhüllen, sichtbare Reward-Upgrades und vollständige Results-Metriken

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
| `npm run test:e2e` | acht Flows auf zwei Mobile-Landscape-Größen und Desktop-Chromium |
| `npm run capture:readme` | drei reproduzierbare Mobile-Screenshots |
| `npm run build` | statischer Production Build in `dist/` |
| `npm run check` | Typecheck, Unit Tests und Production Build |

## Kanonische Dokumente

- [Roadmap](ROADMAP.md) – aktueller, überprüfbarer Projektstatus
- [Changelog](CHANGELOG.md) – chronologische Änderungshistorie
- [Game Vision](docs/design/GAME_VISION.md) – verbindliche Echtzeit-Produktvision und Designleitplanken
- [Prolog und modulare Schiffe](docs/design/PROLOGUE_AND_MODULAR_SHIPS.md) – erster spielbarer Montage-/1v1-Stand und nächste Refit-Stufen
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
