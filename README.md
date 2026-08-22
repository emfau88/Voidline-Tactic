# Voidline Tactics

[![Deploy GitHub Pages](https://github.com/emfau88/Voidline-Tactic/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/emfau88/Voidline-Tactic/actions/workflows/deploy-pages.yml)

Mobile-first 2D-Flottenstrategie in langsamer Echtzeit: Du kommandierst autonome Schiffe über drei Raumkorridore, gibst Routengruppen eine Haltung, sicherst strategische Anlagen und setzt begrenzte Versorgung für Verstärkungen ein.

## [▶ Fleet Corridors im Browser spielen](https://emfau88.github.io/Voidline-Tactic/)

Der aktive Build ist ein einzelner spielbarer Proof of Concept für den neuen Kern. Er ersetzt direkte Joystick-Steuerung durch Makro-Management: Schiffe navigieren, wenden, suchen Ziele und feuern selbstständig. Der Spieler entscheidet, welche Routengruppe angreift, eine Breitseite aufbaut, Position hält, Abstand wahrt oder zurückfällt. Einzelne Schiffe werden nur für Informationen, einen optionalen Fokus, Spezialwaffen oder eine seltene Verlegung ausgewählt.

## Aktueller Mobile-Build

| Startflotte und sichtbares Modul | Ruhige Map-first-Kampfübersicht | Kontextbefehl für eine Routengruppe |
|---|---|---|
| [<img src="docs/screenshots/mobile-fleet-selection.png" alt="Mobile Startschiffwahl mit sichtbar montiertem Modul" width="260">](docs/screenshots/mobile-fleet-selection.png) | [<img src="docs/screenshots/mobile-combat-overview.png" alt="Ruhiges Fleet-Corridors-Gefecht mit drei feinen Routen und zwei Anlagen" width="260">](docs/screenshots/mobile-combat-overview.png) | [<img src="docs/screenshots/mobile-target-preview.png" alt="Kompaktes Kontext-Pod für den Befehl einer autonomen Routengruppe" width="260">](docs/screenshots/mobile-target-preview.png) |

Die Galerie wird reproduzierbar mit `npm run capture:readme` erstellt.

## So spielt es sich

1. **Vorbereiten:** Cruiser oder Frigate wählen und vor dem Start sichtbar Aegis-Emitter oder Vector-Drive montieren.
2. **Route führen:** Eine der drei dünn markierten Routen direkt auf der Karte antippen. Das kleine Kontext-Pod gibt allen eigenen Schiffen dort eine Haltung.
3. **Makro entscheiden:** Angriff erzeugt Druck, Breitseite sucht einen Seitenbogen, Halten verteidigt Raum, Abstand wahrt Reichweite, Rückzug löst einen geordneten Rückmarsch aus.
4. **Ziele nutzen:** Das obere Relais verbessert Versorgung. Die untere Werft beschleunigt Verstärkungen; der Nebel reduziert Schaden. Die Mitte ist der direkte, riskante Weg.
5. **Verstärken:** Das kompakte `+ Versorgung`-Pill öffnet die temporäre Auswahl für Route und Schiffstyp. Danach schließt es automatisch.
6. **Optional eingreifen:** Erst ein Schiff antippen, um seine drei Statusbalken sowie Fokus, Lanze, Torpedo und Schild-Boost einzublenden. Standardwaffen arbeiten autonom.
7. **Kamera kontrollieren:** Ein Finger beziehungsweise Maus-Drag verschiebt die Karte dauerhaft. Pinch oder Mausrad zoomt am Fokuspunkt; weitere Ansichtsoptionen liegen hinter `•••`.

Siegbedingung ist die Vernichtung des gegnerischen Command Ships. Pause und Live bleiben jederzeit als zwei kompakte Knöpfe verfügbar.

## Nachgewiesener Stand

- ✅ 3600×2000-Flottenraum mit drei feinen, direkt antippbaren Routen; Transfers nutzen weiterhin nachvollziehbare Junctions ohne technische Linienwände
- ✅ fünf Haltungen: Angriff, Breitseite, Halten, Abstand, Rückzug
- ✅ autonome Navigation, Zielwahl und Standardwaffen für 3–7 Schiffe pro Seite
- ✅ oberes Versorgungsrelais, untere Werft/Nebelzone und mittlerer Direktweg
- ✅ Versorgung, Deployment-Cooldown, Fregatte/Zerstörer und hartes 7-Schiff-Limit
- ✅ strategische Gegner-KI mit Objective-Reaktion und denselben Deployment-Regeln
- ✅ freie Full-bleed-Kamera, Buttons/Mausrad und echter Zwei-Finger-Zoom ohne Auto-Rücksprung
- ✅ Map-first-Mobile-HUD: unter 15 % persistente HUD-Fläche, maximal fünf Start-Controls und kontextuelle Route-/Schiff-/Deployment-Pods
- ✅ vier originale Schiffsdarstellungen, Hardpoints, Broadside-Bolts, Lance, Torpedos, Schild-/Treffer-/Explosions-VFX
- ✅ deterministischer 30-Hz-Combat-Core ohne Miss-/Intercept-Würfe
- ✅ 30 Unit-Tests, 18 Browser-Gates und 100-Match-Balance-Simulation
- ✅ GitHub-Pages-Deployment erst nach Typecheck, Unit-, Build- und Browser-Gate

Der 100-Match-Test endet zu 100 %, im Median nach 204 Sekunden. Mitteldruck ist mit 122 Sekunden deutlich schneller als Relais (215 s) und Werft (204 s). Die Spielersiegquote von 84 % ist noch zu hoch und steht als offenes Balanceproblem in der [kritischen Bewertung](docs/reviews/FLEET_CORRIDOR_VALIDATION.md).

## Projektstatus

Der Fleet-Corridors-PoC ist funktional und online testbar. Die vorherige visuelle Überladung von Karte und HUD ist grundlegend behoben. Er ist noch kein fertiger Vertical Slice: Audio fehlt, Center Push ist zu stark, Objective-Boni brauchen besseres Feedback, 7v7 benötigt mehr Rollenlesbarkeit und die aktuelle VFX-/Trefferchoreografie liegt noch klar unter dem Zielniveau.

Den verbindlichen Stand führt die [Roadmap](ROADMAP.md). Änderungen stehen im [Changelog](CHANGELOG.md); die nächsten Qualitätshebel sind in den [Top 20](docs/planning/TOP_20_LEVERS.md) priorisiert.

## Lokal entwickeln

Voraussetzung: Node.js 24 und npm.

```powershell
npm ci
npm run dev
```

```powershell
npm run check
npm run test:e2e
npm run balance:sim
```

| Befehl | Aufgabe |
|---|---|
| `npm run dev` | lokaler Entwicklungsserver |
| `npm run check` | Typecheck, 30 Unit-Tests und Production Build |
| `npm run test:e2e` | 18 Mobile-/Desktop-Browser-Gates |
| `npm run balance:sim` | 100 Matches mit drei Strategien und Guardrails |
| `npm run capture:readme` | drei reproduzierbare Mobile-Screenshots |
| `npm run build` | statischer Build in `dist/` |

## Kanonische Dokumente

- [Roadmap](ROADMAP.md) – überprüfbarer Projektstatus
- [Changelog](CHANGELOG.md) – chronologische Änderungshistorie
- [Game Vision](docs/design/GAME_VISION.md) – verbindliches Produkt- und Combat-Modell
- [Fleet-Corridor Audit](docs/reviews/FLEET_CORRIDOR_AUDIT.md) – Architekturentscheidungen vor dem Pivot
- [Pivot-Plan](docs/planning/FLEET_CORRIDOR_PIVOT_PLAN.md) – implementierte technische Zerlegung
- [Validierung](docs/reviews/FLEET_CORRIDOR_VALIDATION.md) – 100-Match-Test und kritische Bewertung
- [Production Plan](docs/planning/PRODUCTION_PLAN.md) – Weg zum hochwertigen Vertical Slice
- [Top-20-Hebel](docs/planning/TOP_20_LEVERS.md) – priorisierte nächste Qualitätsarbeit
- [Art- und VFX-Richtung](docs/design/ART_AND_VFX_DIRECTION.md) – visuelle Leitplanken
- [Asset Manifest](docs/assets/ASSET_MANIFEST.md) – Herkunft und Runtime-Pfade

## Struktur

```text
src/domain/combat/    deterministische Kinematik, Waffen und Schaden
src/domain/fleet/     Korridore, Haltungen, Navigation, Versorgung und Strategie-KI
src/game/             Fleet-Szene, freie Kamera, Lane-/Schiffsansicht und VFX
src/ui/               zugängliches DOM-Command-HUD
tests/unit/           Combat-/Fleet-Regeln
tests/simulation/     100-Match-Balance-Batch
tests/e2e/            Mobile-/Desktop-Flows und Layout-Gates
docs/                 Vision, Planung, Reviews, Assets und Screenshots
```

Die Konzeptbilder unter `docs/reference/mockups/` sind ausschließlich visuelle Referenzen. Neue Runtime-Kunst und Audio werden eigenständig produziert und im Asset Manifest dokumentiert.
