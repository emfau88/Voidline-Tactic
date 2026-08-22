# Fleet-Corridor Repository Audit

Stand: 22. August 2026  
Baseline: `23389be`  
Baseline-Gate: 19 Unit-Tests, Typecheck und Production-Build grün

## Kurzurteil

Der Pivot zu indirektem Flottenkommando ist technisch sinnvoll und kann auf dem vorhandenen Combat-Core aufbauen. Die größte Schwäche ist nicht Rendering oder Fixed-Step, sondern die aktuelle Entscheidungsarchitektur: Das Flaggschiff ist als direkt gesteuerte Sonderrolle modelliert, autonome Navigation kennt nur Eskorte oder Gegner, die Kamera kehrt zum Flaggschiff zurück und das HUD priorisiert Steering. Für Fleet Corridors müssen deshalb Navigation, strategische KI, Auswahl und Kamera oberhalb des bestehenden Combat-Cores neu geordnet werden.

## Geprüfte Bereiche

| Bereich | Aktueller Befund | Konsequenz für den Pivot |
|---|---|---|
| Combat-Domain | deterministischer 30-Hz-State mit reinen Command-/Step-Funktionen | erhalten und um einen Fleet-Orchestrator ergänzen |
| Kinematik | Beschleunigung, begrenzte Drehrate, Course-Waypoints und Separation funktionieren | als lokaler Autopilot weiterverwenden |
| Navigation | Flaggschiff direkt; Eskorte folgt Formation; Gegner nutzt einfache Approach-/Orbit-Ziele | aus dem Core heraus durch Stance-/Corridor-Planung speisen |
| Waffen | Auto-Broadside, manuelle Lance/Torpedo/Shield, physische Torpedos | unverändert als taktische Eingriffe nutzen |
| Zielwahl | globaler Fokus des Flaggschiffs wird an genau eine Eskorte vererbt | auf ausgewähltes Schiff/Task Force und rollenbasierte Auto-Ziele umstellen |
| Objectives | genau ein Relay oder eine Shipyard im `CombatState` | Fleet-Layer mit gleichzeitigem Upper-Relay und Lower-Shipyard ergänzen |
| Verstärkung | Objective erzeugt automatisch schwache Drohnen | Supply-basiertes Deployment pro Korridor ergänzen; Werft bleibt Bonus |
| Missionen | drei sequenzielle Encounter, aktuell Mission 1 als 1v1 | im Repository erhalten; aktiver Start wird ein einzelner PoC-Encounter |
| Kamera | Pinch/Pan vorhanden, danach automatische Rückkehr zum Flaggschiff | permanentes Follow entfernen; freie Kamera plus expliziter FLEET-Fokus |
| HUD | kompakt und touch-sicher, aber um Joystick/Flaggschiff gebaut | Joystick durch kontextuelles Command-/Lane-/Deploy-Panel ersetzen |
| Darstellung | vier lesbare Schiffe, Hardpoints, Telegraphs und VFX | weiterverwenden; Corridors/Objectives als code-native Layer ergänzen |
| Tests | 19 Unit- und 24 Browserläufe; keine Balance-Simulation | Fleet-Domain-, Headless- und neue E2E-Gates ergänzen |

## Wiederverwendbare Substanz

- `CombatState`, `ShipState`, `ShipDefinition` und deterministisches Fixed-Step
- Beschleunigung, Turn Rate, Kollisionsseparation und Map Bounds
- Hull, Shield, Energy, Cooldowns, Damage und Nebelreduktion
- Auto-Broadside, Rift Lance, Void Torpedo und Shield Boost
- Phaser-`ShipView`, Hardpoints, Projektile, Telegraphs und Treffer-VFX
- Pause, ¼-Speed, Live, HiDPI, Fullscreen und Responsive Shell
- Relay-/Capture- sowie Shipyard-/Reinforcement-Erfahrung
- reproduzierbare Screenshots, CI und GitHub Pages

## Zu ersetzende aktive Produktlogik

- Joystick als primärer Input
- `flagship` versus genau eine `escort` als einzige Spielerkommandostruktur
- permanente Kamera-Rückführung
- ein einzelnes Objective pro Match
- Mission-1-1v1 als aktiver Einstieg
- globales Ziel und vier zyklische Escort-Direktiven

Die alte Direct-Steering- und Campaign-Logik bleibt intern erhalten, wird aber nicht parallel als zweites aktives Spiel gepflegt.

## Architektur- und Produktrisiken

### P0 – `CombatScene.ts` ist bereits zu groß

Die Szene enthält Input, Kamera, Match-Orchestrierung, VFX, Missionsfortschritt und UI-Brücken. Corridors, strategische KI und Deployment dürfen dort nicht zusätzlich implementiert werden. Neue Fleet-Domain, Lane-Renderer und Kamera-Controller werden getrennt.

### P0 – Legacy-AI überschreibt neue Flottenabsichten

Der aktuelle Step plant alle nicht als `flagship` markierten Schiffe alle 650 ms neu. Fleet Mode benötigt einen expliziten Control Mode, damit nur der neue Fleet-Planer Courses setzt.

### P0 – Command-Ship-Sieg ist nicht gleich Team-Elimination

Der aktuelle Match-Ende-Code wartet auf die Vernichtung des gesamten Teams und maximal ein Objective. Fleet Corridors braucht einen eigenen Match-Orchestrator, der den Tod des Command Ships auswertet.

### P1 – Taktische Tiefe darf nicht zu fünf permanenten Buttonreihen werden

Stances, Lanes, Deployments und Abilities müssen kontextabhängig bleiben. Der PoC nutzt Einzelwahl, fünf Stances, drei Lane-Ziele und zwei Deployment-Klassen; Task-Force-UI folgt erst nach bewiesenem Loop.

### P1 – Korridore dürfen weder unsichtbar noch Schienen sein

Die Lane ist eine breite strategische Route. Der Autopilot darf lokal Abstand, Broadside, Formation und Zielverfolgung priorisieren. Junctions sind nur für strategische Lane-Wechsel verbindlich.

### P1 – 3–6 Minuten müssen simuliert, nicht geraten werden

Supply, Verstärkung und Command-Ship-TTK können Matches leicht endlos oder trivial machen. Eine Headless-Batch-Simulation wird Teil des Qualitätsgates.

## Produktverbesserungen gegenüber dem Auftrag

1. **Keine klassische Minimap im PoC.** Der 60-%-Gesamtzoom bildet das komplette Netz ab; ein zusätzlicher Informationskanal wäre vorerst Last statt Entscheidung.
2. **Kein Task-Force-Editor im ersten Schnitt.** Einzelwahl plus automatisch kohärente Lane-Gruppen beweist den Loop schneller. Datenstrukturen bleiben gruppenfähig.
3. **Shipyard stärkt Supply und Deployment statt unkontrolliert zu spammen.** So bleibt die Grenze von drei bis sieben relevanten Schiffen pro Seite belastbar.
4. **Lane-Wechsel verwenden Junction-Waypoints.** Das erzeugt sichtbare Vorlaufzeit, ohne Schiffe an eine exakte Linie zu kleben.
5. **Spezialwaffen werden für das ausgewählte Schiff ausgelöst.** Die KI hält dafür eine brauchbare Lösung, normale Waffen bleiben automatisch.

