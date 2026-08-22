# Fleet Corridors – Pivot-Plan

Stand: 22. August 2026  
Status: ✅ implementiert und validiert; Messergebnisse in [Fleet-Corridors-Validierung](../reviews/FLEET_CORRIDOR_VALIDATION.md)

## Ziel des Schnitts

Ein einzelnes, vollständig spielbares 3–6-Minuten-Match mit drei breiten Korridoren, zwei Schiffen pro Seite, indirekten Stances, Lane-Wechseln über Junctions, Upper-Relay, Lower-Shipyard/Nebula, einer Supply-Ressource und begrenztem Deployment. Siegbedingung ist das gegnerische Command Ship.

Der Spieler steuert Absichten, nicht Heading-Winkel.

## Was erhalten bleibt

- Combat-/Ship-/Weapon-State und Fixed-Step
- vorhandene vier Schiffsklassenpräsentationen
- Masse, Beschleunigung, Turn Rate und Separation
- Auto-Broadside, Lance, Torpedo, Shield und Telegraphs
- Nebelreduktion, Capture-Grundlogik und Reinforcement-Erfahrung
- Pause, ¼-Speed, Live, Zoom, Fullscreen und Result-Dialog
- Startschiff-/Startmodulwahl als persönliche Flottenvorbereitung
- Legacy-Campaign und Direct-Steering-Code als nicht aktiver Referenzpfad

## Was im aktiven Modus ersetzt wird

| Alt | Neu |
|---|---|
| Joystick-Sollkurs | ADVANCE, BROADSIDE, HOLD, KEEP RANGE, RETREAT |
| Flaggschiff-Followkamera | freie Pan-/Zoom-Kamera plus FLEET-Fokus |
| genau eine Eskorte | einzeln auswählbare Schiffe mit Fleet-Direktive |
| eine freie Arena ohne Routengrammatik | Upper, Center, Lower und zwei Junction-Transferrouten |
| genau ein Objective | Upper Relay und Lower Shipyard gleichzeitig |
| Missionssequenz als aktiver Start | ein hochwertiger Fleet-Corridor-PoC |
| automatische Werft-Drohnen allein | Supply und begrenztes Lane-Deployment |

## Neue Domain-Dateien

```text
src/domain/fleet/
  types.ts              Fleet-State, Stances, Lane- und Deployment-Typen
  lanes.ts              Corridor-Geometrie, Junctions und Routenabfrage
  fleetCommands.ts      Lane-, Stance-, Fokus- und Deployment-Commands
  navigation.ts         lokale Intent→Course-/Facing-Planung
  tacticalAi.ts         Rollen-Zielwahl und strategische Gegnerreaktion
  fleetBattle.ts        PoC-Fabrik, Supply/Objectives und Step-Orchestrierung
```

## Neue Präsentations-/UI-Dateien

```text
src/game/presentation/FleetLaneView.ts
src/game/controllers/StrategicCameraController.ts
src/ui/FleetCommandHud.ts
```

Der aktive Modus lebt in `FleetCombatScene.ts`; Lane-Zeichnung, Kamera-Gesten und Fleet-HUD-Logik bleiben außerhalb der Szene. Die frühere `CombatScene.ts` ist ein inaktiver Legacy-Referenzpfad.

## Bestehende Dateien mit gezielter Änderung

- `src/domain/combat/types.ts`: expliziter `controlMode`, keine Fleet-Details
- `src/domain/combat/combatEngine.ts`: öffentliche Ship-State-Fabrik und Legacy-AI-Gate
- `src/game/scenes/FleetCombatScene.ts`: aktiver Fleet-State, Auswahl, Commands und neue Controller
- `src/game/presentation/ShipView.ts`: Lane-/Stance-Readability nur wenn nötig
- `index.html`, `src/styles.css`: Command-, Lane-, Supply- und Deploy-UI statt Joystick
- `src/main.ts`: PoC-Titel/Startstatus statt Missionsauswahl
- Tests, Screenshot-Skript, README, Roadmap, Changelog, Vision und Produktionsplan

## Matchstruktur

### Karte

- Upper Vector: längere Route, Relay bei Kartenmitte
- Center Voidline: kürzeste und offenste Route
- Lower Drift: Nebel plus Shipyard, längere sichere Flanke
- Junction West und Junction East verbinden die Korridore
- Korridorbreite erlaubt Formation, Separation und Broadside-Manöver

### Startflotten

- Spieler: Sovereign's Fury (Cruiser) und Aster Vale (Frigate)
- Gegner: Ashen Crown (Cruiser/Command) und Red Wake (Destroyer)
- persönliche Startwahl bestimmt ausgewähltes Command Ship und sichtbares Modul

### Entscheidungen

- Tap eigenes Schiff: Auswahl
- Tap Gegner: Fokusziel für Auswahl
- Stance: fünf Absichten
- Lane: Upper, Center oder Lower; Wechsel läuft über Junction
- Ability: Lance, Torpedo oder Shield des ausgewählten Schiffs
- Deploy: Frigate 30 Supply oder Destroyer 55 Supply in die gewählte Lane

## Autopilot-Regeln

- ADVANCE gewinnt Raum entlang der Lane und nähert sich einem Lane-Ziel
- BROADSIDE sucht seitlichen Orbitpunkt in Broadside-Reichweite
- HOLD merkt eine Position und verteidigt deren Umgebung
- KEEP RANGE hält klassenspezifische optimale Distanz
- RETREAT läuft geordnet über Lane/Junction zur eigenen Basis
- Frigate priorisiert Objectives und beschädigte Ziele
- Destroyer priorisiert große Ziele und Torpedodistanz
- Cruiser bindet schwere Gegner und hält Fronten
- Separation und Beschleunigung bleiben im Combat-Core

## Supply und Deployment

- eine Ressource, Maximum 100
- automatische Regeneration
- Relay beschleunigt Regeneration
- Shipyard reduziert Deployment-Cooldown und stärkt Regeneration
- maximal sieben lebende Schiffe pro Seite
- Gegner-KI deployt mit denselben Kosten und Limits

## Kamera

- One-finger Pan nur auf freiem Kartenbereich
- Pinch-Zoom 60–220 %
- Mausrad-Zoom und Drag-to-Pan auf Desktop
- kein automatisches Zurückziehen nach Spielereingabe
- FLEET-Button zentriert die lebende eigene Flotte explizit

## Testplan

### Unit/Simulation

- Lane Assignment und Junction-Routing
- Lane Switching
- fünf Stances
- Broadside-Positionierung und Keep Range
- rollenbasierte Zielpriorität
- Objective Capture
- Supply-Regeneration und Deployment-Limits
- strategische AI-Lane-Reaktion
- 100 Headless-Matches mit Dauer-, Sieg-, Capture-, Deployment- und First-Kill-Metriken

### E2E

- 844×390, 667×375 und Desktop
- Auswahl, Stance, Lane-Wechsel und Fokusziel
- Supply/Deploy
- Ability, Pause, One-finger Pan und Pinch-Zoom
- keine HUD-Überlagerung
- drei komplette Strategieruns: Center Push, Upper Relay, Lower Shipyard/Nebula

## Risiken und Gates

| Risiko | Gate |
|---|---|
| Förderbandbewegung | Schiffe weichen sichtbar von Centerline ab und Broadside erzeugt Querbewegung |
| UI-Überlast | auf 667×375 kein überlappender Touch-Target; max. zwei kontextuelle Command-Reihen |
| Unit-Spam | harte Grenze sieben lebende Schiffe je Seite |
| belanglose Objectives | Relay/Shipyard ändern messbar Supply oder Deployment |
| endlose Matches | Headless-Median 3–6 Minuten; P90 unter 7 Minuten |
| unverständliche Niederlage | Command Ship, Lane-Druck und Objective-Owner permanent lesbar |
| Scene-Monolith | neue Logik liegt in Fleet-Domain/Controller/View/HUD, nicht in weiteren Scene-Blöcken |

## Implementierungsreihenfolge

1. Fleet-Typen, Lane-Graph und Pure Commands
2. Fleet-Battle-State, Autopilot, Objectives, Supply und AI
3. Unit- und Headless-Gates
4. Lane-/Objective-Präsentation und freie Kamera
5. Auswahl und kontextuelles Mobile-HUD
6. ✅ E2E, drei Strategieruns und kritische Bewertung
7. 🚧 Dokumentation, Screenshots, Commits, Push und Live-Test

## Abnahmeergebnis

- 30 Unit-Tests grün
- 18 Browser-Gates auf zwei Mobilegrößen und Desktop grün
- 100/100 Matches abgeschlossen; Median 204 s, P90 297 s
- Center Push 122 s, Upper Relay 215 s, Lower Shipyard 204 s
- offene Balancebefunde: 84 % Spielersiege und zu effizienter Mitteldruck
