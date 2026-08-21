# Turn-Based Gothic Fleet Tactics — Game Vision & Implementation Specification

## 1. Zweck dieses Dokuments

Dieses Dokument beschreibt die **verbindliche Produktvision, Gameplay-Architektur, visuellen Leitplanken, Scope-Grenzen und Umsetzungsreihenfolge** für ein neues HTML5-Spiel.

Es soll von einem Coding Agenten als **Master-Spezifikation** verwendet werden.

Wichtig:

- Nicht versuchen, sofort das komplette Endspiel zu bauen.
- Zuerst einen **spielbaren Vertical Slice** erstellen.
- Die Mockups dienen als **Zielvision für Stil, Lesbarkeit und UX**, nicht als Aufforderung, jedes dekorative Detail 1:1 nachzubauen.
- Technische Entscheidungen müssen die spätere Erweiterbarkeit unterstützen.
- Kein unnötiges 3D.
- Keine Single-File-Monolithen.
- Keine Systeme implementieren, die für die erste spielbare Version keinen klaren Gameplay-Nutzen haben.

---

# 2. High-Level Vision

Das Spiel ist ein:

> **hochwertiges, rundenbasiertes 2D-Top-Down-Weltraum-Taktikspiel mit kleiner persistenter Flotte, individueller Schiffsausrüstung, Positionierung, Feuerwinkeln, Energie-/Aktionspunkt-Management, Subsystemschäden, Torpedos und Boarding.**

Der Spieler kommandiert keine riesige Armada.

Stattdessen führt er eine kleine Flotte aus ungefähr:

- 1–4 eigenen Schiffen
- gegen 1–5 gegnerische Schiffe

Jedes Schiff soll sich wie ein wertvolles individuelles Asset anfühlen.

Schiffe werden:

- verbessert
- spezialisiert
- beschädigt
- repariert
- mit Modulen ausgestattet
- von Offizieren und Crew beeinflusst

Das Spiel soll die taktische Klarheit eines Brettspiels mit dem visuellen Eindruck einer hochwertigen Weltraumschlacht verbinden.

---

# 3. Kernfantasie

Der Spieler soll das Gefühl haben:

> „Ich kommandiere wenige mächtige Kriegsschiffe und gewinne Gefechte nicht durch hektisches Klicken, sondern durch Positionierung, Feuerwinkel, Energieverwaltung, gezielten Systemschaden und kluge Nutzung meiner Flotte.“

Wichtige emotionale Säulen:

1. **Schiffe fühlen sich mächtig an**
2. **Jede Bewegung ist relevant**
3. **Facing und Broadside sind taktisch wichtig**
4. **Treffer haben sichtbare Konsequenzen**
5. **Schiffe entwickeln Identität**
6. **Upgrades verändern Spielweisen**
7. **Boarding ist eine echte Alternative zu bloßem Schaden**

---

# 4. Technische Grundentscheidung

## 4.1 Rendering

Das Spiel soll primär als:

> **2D Top-Down HTML5 Game**

umgesetzt werden.

Empfohlene Technologien:

- TypeScript
- Phaser 3 oder PixiJS
- Vite
- HTML/CSS für komplexere Meta-UI optional
- Canvas/WebGL Rendering
- JSON-basierte Game Data

Kein echtes 3D für die Kernversion.

## 4.2 Warum kein 3D?

3D würde unnötig erhöhen:

- Asset-Aufwand
- Modellierung
- UV-Mapping
- Materialpflege
- Kamera-Probleme
- Lighting
- Performance-Risiko
- Browser-Komplexität
- Perspektivfehler
- Produktionszeit

Die Kernmechanik profitiert kaum davon.

Die visuelle Illusion soll stattdessen entstehen durch:

- hochwertige Top-Down-Sprites
- Rotation
- Parallax-Hintergründe
- Shader/VFX
- Schild-Effekte
- Partikel
- Projektiltrails
- Einschläge
- Lighting Overlays

---

# 5. Visuelle Zielrichtung

## 5.1 Perspektive

Strikt:

> **True Top-Down / orthografische Draufsicht**

Keine isometrische Kamera.

Keine 3D-Schrägansicht.

Keine perspektivisch verzerrten Schiffe.

Alle taktischen Informationen müssen aus der Draufsicht klar lesbar sein.

## 5.2 Schiffsdarstellung

Die Mockups zeigen ein visuelles Ideal.

Für die tatsächliche Implementierung:

> ungefähr **60–70 % des Mockup-Detaillevels**

verwenden.

Wichtiger als Mikrodetails sind:

- Silhouette
- Größe
- Orientierung
- Fraktionszugehörigkeit
- Feuerwinkel
- Schadenszustand

Schiffe sollen auf dem Spielfeld sofort unterscheidbar sein.

## 5.3 Stil

Visuelle Richtung:

- dunkler Weltraum
- hochwertige Nebula-Hintergründe
- zurückhaltende Sterne
- vereinzelte Asteroiden
- dunkles Metall
- Gold-/Messingakzente
- gedämpfte blaue UI-Effekte
- Rot für gegnerische Bedrohungen
- Violett/Magenta für Energie-Lanzen
- Orange/Gelb für konventionelle Geschosse

Keine übertriebene Neonoptik.

Keine überfüllte Partikelwand.

Lesbarkeit geht vor Spektakel.

---

# 6. Core Gameplay Loop

Der grundlegende Loop:

1. Mission auswählen
2. Flotte vorbereiten
3. Schiffe ausrüsten
4. Gefecht starten
5. Rundenbasiert kämpfen
6. Mission abschließen
7. Credits / Salvage / Tech erhalten
8. Reparieren
9. Upgrades kaufen
10. Crew / Offiziere verbessern
11. Neue Mission starten

---

# 7. Kampfsystem

## 7.1 Grundprinzip

Das Spiel ist **turn-based**.

Jedes Schiff hat pro eigener Aktivierung:

- Aktionspunkte
- Energie
- Bewegung
- Feueroptionen

Beispiel:

```text
AP: 3
Energy: 60 / 80
```

Aktionen können AP und/oder Energie kosten.

---

# 8. Bewegung

## 8.1 Kein Grid als primäre Darstellung

Die Bewegung soll zunächst **frei innerhalb eines Radius** funktionieren.

Das Spielfeld hat keine sichtbaren Hexfelder.

## 8.2 Move Action

Beim Klick auf:

`MOVE`

wird um das ausgewählte Schiff ein:

> **Movement Range Circle**

angezeigt.

Der Spieler wählt darin eine Zielposition.

## 8.3 Bewegungsplanung

Darstellung:

- aktuelles Schiff
- transparenter Bewegungsradius
- gestrichelter oder gebogener Pfad
- Ghost-Silhouette am Ziel
- geplante Position
- geplante Ausrichtung

Beispiel:

```text
Current Ship
     |
     | curved route
     v
Ghost Ship
+ Facing Arrow
```

---

# 9. Facing / Ausrichtung

Facing ist ein Kernsystem.

Der Spieler soll nach einer Bewegung bestimmen können, in welche Richtung das Schiff zeigt.

Das ermöglicht:

- Front zum Gegner
- Flanke/Broadside zum Gegner
- Rückzug
- Schutz beschädigter Seiten

Die UI muss das möglichst einfach lösen.

Empfohlener Ablauf:

1. MOVE anklicken
2. Zielposition wählen
3. Ghost Ship erscheint
4. Spieler zieht oder dreht einen Facing-Arrow
5. Bewegung bestätigen

Keine komplizierte Winkel-Eingabe.

---

# 10. Feuerwinkel

Schiffe besitzen mindestens:

## Front Arc

Geeignet für:

- Lance
- Torpedos
- bestimmte Spezialwaffen

## Port Broadside

Linke Seite.

## Starboard Broadside

Rechte Seite.

## 10.1 Broadside als zentrales System

Große Kriegsschiffe sollen bewusst davon profitieren, Gegner seitlich anzuvisieren.

Broadside:

- hoher Schaden
- guter Mehrfachtreffer
- benötigt passende Ausrichtung
- macht Positionierung bedeutend

Damit unterscheidet sich das Spiel von einfachem „anklicken und feuern“.

---

# 11. Aktionssystem

Vorläufige Aktionen:

| Aktion | AP-Kosten | Zweck |
|---|---:|---|
| Move | 1 | Position verändern |
| Rotate | 1 | Ausrichtung ändern |
| Broadside | 2 | Seitenbatterie feuern |
| Lance | 2 | Präziser Energieangriff |
| Torpedo | 2 | Projektilangriff |
| Board | 3 | Boarding-Angriff |
| Shield | 1 | Schild verstärken |
| Repair | 1 | System reparieren |

AP-Werte sind Startwerte und später zu balancen.

---

# 12. Waffenklassen

## 12.1 Broadside Cannons

Eigenschaften:

- starker Hull-Schaden
- mittlere Reichweite
- benötigt Side Arc
- mehrere Geschosse
- leicht ungenau

## 12.2 Lance

Eigenschaften:

- präzise
- starke Schildpenetration
- hohe Energie-Kosten
- Front Arc
- lange Reichweite

## 12.3 Torpedos

Eigenschaften:

- hohe Einzelschadensspitze
- sichtbares Projektil
- können abgefangen werden
- benötigen Front Arc
- verzögerte Wirkung möglich

## 12.4 Point Defense

Eigenschaften:

- automatisch oder reaktiv
- zerstört Torpedos
- schützt gegen kleine Ziele
- verbraucht ggf. Energie

## 12.5 Boarding Torpedos

Eigenschaften:

- wenig direkter Hull-Schaden
- transportieren Marines
- können abgefangen werden
- ermöglichen interne Angriffe

Boarding soll später ein wichtiges Alleinstellungsmerkmal werden.

---

# 13. Schildsystem

Schiffe besitzen:

- Hull
- Shield
- Armor
- Energy
- Crew

Standardreihenfolge:

```text
Attack
→ Shield
→ Armor mitigation
→ Hull
→ possible subsystem damage
```

Schilde können:

- regenerieren
- verstärkt werden
- überlastet werden
- durch bestimmte Waffen besonders effektiv gebrochen werden

---

# 14. Subsystem Damage

Dieses System ist wichtig für taktische Tiefe.

Mögliche Subsysteme:

- Engines
- Reactor
- Shield Generator
- Lance Battery
- Broadside Battery
- Torpedo Bay
- Point Defense
- Bridge
- Boarding Bay

## 14.1 Beispiele

### Engine Damaged

- reduzierte Movement Range

### Shield Generator Damaged

- reduzierte Regeneration

### Reactor Damaged

- reduzierte maximale Energie

### Weapon Battery Damaged

- entsprechende Waffe eingeschränkt oder deaktiviert

### Bridge Damaged

- weniger AP oder schlechtere Genauigkeit

---

# 15. Boarding

Boarding ist **nicht Teil des ersten Minimal-Prototyps**, soll aber architektonisch vorgesehen werden.

Ablauf:

1. Schild teilweise oder vollständig brechen
2. Boarding Torpedo starten
3. Point Defense versucht Abfang
4. Torpedo trifft
5. Boarding Status wird erzeugt
6. Boarding-Teams greifen interne Systeme an

Mögliche Ziele:

- Bridge
- Reactor
- Engine Room
- Shield Generator
- Weapons
- vollständige Eroberung

Boarding kann über mehrere Runden laufen.

---

# 16. Schiffsstatistiken

Jedes Schiff benötigt mindestens:

```text
id
name
class
level

maxHull
currentHull

maxShield
currentShield
shieldRegen

armor

maxEnergy
currentEnergy
energyRegen

maxAP
currentAP

speed
movementRange

crew
maxCrew

turnRate
```

---

# 17. Schiffsklassen

Für die erste vollständige Version maximal:

## Frigate

- schnell
- fragil
- günstig
- Torpedos
- Flanking

## Destroyer

- Point Defense
- Eskorte
- Anti-Torpedo

## Cruiser

- Allrounder
- Broadside
- Lance
- Boarding

## Battlecruiser

- langsam
- starke Feuerkraft
- starke Schilde
- hoher Energiebedarf

---

# 18. Persistente Flotte

Der Spieler besitzt langfristig mehrere Schiffe.

Maximal gleichzeitig im Gefecht:

> 3–4 eigene Schiffe

Der Spieler soll eine emotionale Bindung zu einzelnen Schiffen entwickeln.

Jedes Schiff hat:

- Name
- Level
- XP
- Module
- Crew
- Captain
- Schadenshistorie
- eventuell Veteranenboni

---

# 19. Upgrade-System

Upgrades dürfen nicht nur lineare Prozentwerte sein.

Gute Upgrades verändern Builds.

Beispiele:

## Overcharged Reactor

+ mehr Energie

aber:

- höhere Überlastungsgefahr

## Reinforced Armor

+ Hull / Armor

aber:

- geringere Geschwindigkeit

## Advanced Lance Battery

+ Reichweite
+ Damage

aber:

- höherer Energieverbrauch

## Assault Barracks

+ Boarding Strength

aber:

- benötigt Module Slot

---

# 20. Module Slots

Schiffe besitzen begrenzte Slots.

Beispiel Cruiser:

```text
Weapons:
- 2 Broadside slots
- 1 Lance slot
- 1 Torpedo slot

Systems:
- 1 Shield
- 1 Reactor
- 2 Utility
- 1 Boarding
```

Dadurch entstehen Builds.

---

# 21. Power Budget

Module verbrauchen Power.

Beispiel:

```text
Reactor Power: 100

Lance Battery: 22
Shield Generator: 25
Torpedo Bay: 14
Point Defense: 8
Boarding Bay: 12
```

Übersteigt der Verbrauch das Limit:

- Module können nicht aktiviert werden
- oder Loadout ist ungültig

Für MVP genügt zunächst:

> Loadout darf Reactor Capacity nicht überschreiten.

---

# 22. Upgrade Screen

Der Upgrade-Screen soll ungefähr folgende Struktur haben:

## Links

kleine Flottenübersicht:

- Frigate
- Cruiser
- Battlecruiser

mit:

- Name
- Level
- Zustand

## Mitte

ausgewähltes Schiff groß

daneben:

### Weapons

- Lance Battery
- Torpedo Bay
- Broadside Cannons
- Point Defense

### Systems

- Void Shield
- Reinforced Armor
- Reactor
- Targeting System
- Boarding Bay

## Rechts

Stats:

- Hull
- Shield
- Armor
- Energy
- Speed
- Crew

darunter:

### Available Upgrades

mit:

- Name
- Preis
- kurzer Effekt

---

# 23. Offiziere

Offiziere sind ein späteres Meta-System.

Nicht im ersten Vertical Slice implementieren.

Geplante Rollen:

## Captain

beeinflusst:

- AP
- Moral
- Gesamtkoordination

## Gunnery Officer

beeinflusst:

- Broadside
- Lance
- Crit Chance

## Chief Engineer

beeinflusst:

- Reparaturen
- Reactor
- Shield Regen

## Boarding Officer

beeinflusst:

- Boarding Strength
- Marines
- feindliche Moral

---

# 24. Beispiel-Offiziersboni

```text
+10% Lance Accuracy
+5% Critical Chance
+1 AP on first turn
+10 Shield Regen
+1 Repair Efficiency
+1 Boarding Action Die
+20% Boarding Strength
```

Offiziere können:

- XP erhalten
- Level steigen
- Traits freischalten

---

# 25. Crew

Crew kann langfristig in Kategorien unterteilt werden:

- Marines
- Armsmen
- Engineers
- Medicae
- Void Crew

Für MVP reicht:

```text
Crew = single numerical stat
```

Keine unnötige Simulation zu Beginn.

---

# 26. Kampagnenstruktur

Ziel für Version 1:

> 10–15 Missionen

Nicht sofort eine riesige Kampagne bauen.

## 26.1 Missionsarten

Beispiele:

### Elimination

Alle Gegner zerstören.

### Protect

Verbündetes Schiff schützen.

### Survive

X Runden überstehen.

### Capture

bestimmtes Schiff boarden.

### Disable

Subsystem eines Gegners zerstören.

### Escort

Konvoi schützen.

### Ambush

Gegner startet in taktisch günstiger Position.

---

# 27. Story

Die Story soll einfach bleiben.

Mögliche Struktur:

```text
Mission Briefing
→ 2–5 kurze Textabsätze
→ optional Portrait
→ Battle
→ Result
→ Reward
```

Keine aufwendigen Cutscenes nötig.

---

# 28. Missionsfortschritt

Beispiel:

```text
Mission 1
Tutorial Patrol

Mission 2
Broken Convoy

Mission 3
Hostile Contact

Mission 4
Boarding Action

Mission 5
The Lost Cruiser

...

Final Mission
Fleet Engagement
```

---

# 29. HUD im Gefecht

## Top Bar

Enthält:

- Mission
- Turn
- Objective
- ggf. kleine Ressourcen-/Statuswerte

## Left Panel

Selected Ship:

```text
Hull
Shield
Energy
AP
Crew

Status
```

Keine überfüllte Statistikliste.

## Right Panel

Selected Enemy:

```text
Hull
Shield

Subsystem Status:
Engine Damaged
Shields Low
Weapon Battery Online
```

## Bottom Action Bar

Große klare Buttons:

```text
MOVE
ROTATE
BROADSIDE
LANCE
TORPEDO
BOARD
SHIELD
END TURN
```

Buttons sollen:

- große Hit Areas
- Icon
- Name
- AP Cost

anzeigen.

---

# 30. Steuerung

Desktop zuerst.

## Maus

### Linksklick

- Schiff auswählen
- Ziel wählen
- Aktion bestätigen

### Rechtsklick

- Aktion abbrechen

### Mouse Wheel

- Zoom optional

## Mobile später

Mobile Support soll architektonisch möglich bleiben.

Aber:

> **erste Entwicklung auf Desktop konzentrieren.**

Touch Targets dennoch nicht winzig gestalten.

---

# 31. Movement UX

Ziel:

maximal wenige Interaktionsschritte.

Ideal:

### Move

1. MOVE klicken
2. Ziel innerhalb Radius klicken
3. Ghost Ship erscheint
4. Facing über Drehgriff einstellen
5. Confirm

Optional:

Doppelklick / Confirm Button.

---

# 32. Attack UX

Beispiel Broadside:

1. Broadside auswählen
2. gültige Targets leuchten
3. Hover zeigt Preview:

```text
Hit Chance: 78%
Shield Damage: 20–35
Hull Damage: 35–60
Possible subsystem hit
```

4. Klick feuert

---

# 33. Visuelle Effekte

Notwendig:

- Laser/Lance Beam
- Cannon Tracer
- Torpedo Trail
- Shield Impact
- Hull Explosion
- small debris
- engine glow
- selection outline
- targeting reticle

Nicht notwendig:

- tausende Partikel
- komplexe volumetrische Effekte
- 3D-Lichtsimulation

---

# 34. Audio

Später erforderlich.

Mindestens:

- UI hover
- UI click
- ship select
- move confirm
- cannon
- lance
- torpedo launch
- shield hit
- hull hit
- explosion
- boarding launch
- victory
- defeat

Musik:

ruhig, dunkel, militärisch, aber nicht permanent bombastisch.

---

# 35. Architektur

Empfohlene Struktur:

```text
src/
  core/
    Game.ts
    GameState.ts
    EventBus.ts

  combat/
    CombatScene.ts
    TurnManager.ts
    ActionManager.ts
    MovementSystem.ts
    TargetingSystem.ts
    DamageSystem.ts
    WeaponSystem.ts
    StatusSystem.ts

  entities/
    Ship.ts
    Weapon.ts
    Module.ts
    Projectile.ts

  data/
    ships.json
    weapons.json
    modules.json
    missions.json

  ui/
    CombatHUD.ts
    ShipPanel.ts
    TargetPanel.ts
    ActionBar.ts
    UpgradeScreen.ts

  meta/
    FleetManager.ts
    UpgradeManager.ts
    SaveManager.ts

  effects/
    VFXManager.ts
    AudioManager.ts
```

---

# 36. Datengetrieben entwickeln

Keine Waffenwerte hart im Scene-Code verteilen.

Beispiel:

```json
{
  "id": "lance_mk1",
  "name": "Lance Battery Mk I",
  "damage": 40,
  "shieldMultiplier": 1.5,
  "range": 900,
  "apCost": 2,
  "energyCost": 20,
  "arc": "front"
}
```

Dasselbe Prinzip für:

- Schiffe
- Module
- Missionen
- Offiziere

---

# 37. Save System

Für Browser:

- LocalStorage oder IndexedDB

Speichern:

```text
campaign progress
credits
salvage
tech
owned ships
ship upgrades
ship XP
officers
settings
```

Für den Vertical Slice reicht zunächst LocalStorage.

---

# 38. KI

Erste KI bewusst simpel.

Prioritäten:

1. gültiges Ziel suchen
2. optimalen Feuerwinkel herstellen
3. Waffen verwenden
4. beschädigtes Schiff schützen
5. keine offensichtlichen Selbstmordbewegungen

Keine komplexe strategische KI für MVP.

---

# 39. Scope-Grenzen

Folgende Dinge NICHT im ersten Schritt bauen:

- 3D
- Multiplayer
- prozedurale Galaxie
- riesige Tech Trees
- komplexe Crew-Simulation
- komplexes Boarding-Minispiel
- 20 Schiffsklassen
- hunderte Waffen
- individuelle Deckpläne
- diplomatisches System
- Handelssystem
- Crafting
- Open World

Diese Systeme würden das Projekt zerstören, bevor der Core Loop bewiesen ist.

---

# 40. Vertical Slice — verbindlicher erster Entwicklungsumfang

Der erste spielbare Build soll enthalten:

## Combat

- 1 Player Cruiser
- 1 Player Frigate
- 2 Enemy Ships
- Turn System
- AP
- Energy
- Movement Radius
- Destination Preview
- Facing Selection
- Broadside Arc
- Front Arc
- Broadside Attack
- Lance Attack
- Torpedo Attack
- Shield
- basic hull damage
- basic shield damage
- win/lose condition

## UI

- Top HUD
- Selected Ship panel
- Target panel
- Action bar
- Movement/firing overlays

## Meta

- einfacher Upgrade Screen
- 3–5 Upgrades
- Credits
- Mission Restart
- Local Save optional

Noch NICHT:

- Boarding
- Officers
- full campaign
- crew management

---

# 41. Vertical Slice Mission

Eine einzige Testmission.

Beispiel:

## Mission: First Contact

Player:

- Cruiser
- Frigate

Enemy:

- Cruiser
- Destroyer

Objective:

> Destroy all enemy ships.

Battlefield:

- Nebula background
- wenige Asteroiden
- keine komplexen Hindernisse

Der Slice muss zeigen:

- Bewegung
- Facing
- Broadside
- Lance
- Torpedo
- Shield
- Damage
- Turn Flow

---

# 42. Upgrade Slice

Nach dem Kampf:

Reward:

```text
Credits: +1000
Salvage: +200
```

Upgrade Screen:

### Option 1

Improved Lance

### Option 2

Reinforced Shield

### Option 3

Reactor Upgrade

Der Spieler kauft eine Verbesserung.

Danach Mission erneut starten.

Ziel:

> beweisen, dass Combat + Meta Progression Spaß machen.

---

# 43. Entwicklungsphasen

## Phase 0 — Setup

- Projektstruktur
- TypeScript
- Phaser/Pixi
- Asset Loader
- responsive canvas
- basic state management

## Phase 1 — Combat Prototype

- Schiffe
- Auswahl
- Turns
- Movement
- Facing
- AP

## Phase 2 — Weapons

- arcs
- targeting
- broadside
- lance
- torpedo
- damage

## Phase 3 — UX / VFX

- overlays
- path preview
- ghost ship
- targeting previews
- shield effect
- hit effects

## Phase 4 — Basic Meta

- credits
- upgrade screen
- ship stats
- persistent upgrades

## Phase 5 — Product Slice

- balancing
- sound
- polished UI
- tutorial
- one complete mission flow

## Phase 6 — Expansion

Erst wenn Phase 5 funktioniert:

- subsystem damage
- boarding
- officers
- campaign
- additional ships

---

# 44. Acceptance Criteria für den ersten brauchbaren Build

Der Build ist erst dann erfolgreich, wenn:

## Gameplay

- Spieler versteht ohne Erklärung, welches Schiff ausgewählt ist
- Bewegung ist visuell klar
- Facing kann einfach gesetzt werden
- Broadside-Arcs sind verständlich
- Frontwaffen funktionieren anders als Side Weapons
- AP-Verbrauch ist sichtbar
- Gegner reagiert sinnvoll
- Runde kann sauber beendet werden

## UX

- keine überlappenden Panels
- keine winzigen Buttons
- keine unlesbaren Texte
- keine unnötigen Popups
- keine verschachtelten Menüs im Kampf

## Visuals

- Schiffe sind klar unterscheidbar
- Rotation sieht sauber aus
- Hintergrund überstrahlt Schiffe nicht
- VFX verdecken Gameplay nicht
- HUD fühlt sich hochwertig, aber nicht überladen an

## Technik

- stabile 60 FPS auf normalem Desktop
- keine Console Errors
- kein Memory Leak bei Neustart
- State Reset funktioniert
- Build läuft lokal und als statische Website

---

# 45. Designregel: Lesbarkeit vor Simulation

Bei jeder neuen Mechanik fragen:

> Macht das die taktische Entscheidung interessanter?

Wenn nein:

nicht implementieren.

Nicht simulieren um der Simulation willen.

---

# 46. Designregel: Kein System ohne Gegenentscheidung

Beispiele:

Schlechtes Upgrade:

```text
+5% Damage
```

Besser:

```text
+20% Damage
+15 Energy Cost
```

Schlechtes Movement:

```text
move anywhere in radius
```

Besser:

```text
move within range
choose facing
side weapons depend on orientation
```

---

# 47. Designregel: Schiffe als Charaktere

Ein Schiff soll über mehrere Missionen Identität entwickeln.

Beispiel:

```text
Sovereign's Fury
Cruiser
Level 7

Role:
Long-Range Lance Cruiser

Traits:
Veteran Gun Crews
Reinforced Reactor

Battle History:
7 Missions
3 Critical Hits
1 Near Destruction
```

Das System kann später erweitert werden.

---

# 48. Langfristiges Zielbild

Die finale Vision:

- 10–15 Missionen
- 4 Schiffsklassen
- 3–4 eigene Schiffe gleichzeitig
- 5 Hauptwaffentypen
- 10–20 sinnvolle Module
- Subsystem Damage
- Boarding
- Officers
- Crew
- persistent fleet progression
- hochwertige 2D-Top-Down-Präsentation

---

# 49. Prioritäten

Priorität 1:

> Combat Feel

Priorität 2:

> Movement + Facing

Priorität 3:

> Broadside / Weapon Identity

Priorität 4:

> UI Clarity

Priorität 5:

> Upgrade Loop

Priorität 6:

> Subsystems

Priorität 7:

> Boarding

Priorität 8:

> Officers / Crew

Priorität 9:

> Campaign Content

---

# 50. Nicht verhandelbare Grundsätze

1. 2D Top-Down
2. Turn-based
3. kleine Flotten
4. Facing ist relevant
5. Broadside ist relevant
6. Waffen spielen sich unterschiedlich
7. AP und Energie sind klar sichtbar
8. Schiffe sind persistent
9. Upgrades verändern Builds
10. UI bleibt lesbar
11. kein unnötiges 3D
12. Scope wird stufenweise erweitert

---

# 51. Kurzfassung für den Coding Agenten

Baue **nicht sofort das gesamte Spiel**.

Baue zuerst einen qualitativ hochwertigen Vertical Slice mit:

- 2 Player Ships
- 2 Enemy Ships
- Turn-based Combat
- Movement Radius
- Destination Preview
- Facing
- Broadside Arc
- Front Arc
- AP
- Energy
- Lance
- Broadside Cannons
- Torpedo
- Shield
- Damage
- simple enemy AI
- polished HUD
- one upgrade screen

Erst wenn dieser Slice:

- verständlich
- visuell überzeugend
- stabil
- spielerisch interessant

ist, weitere Systeme ergänzen.

Die Mockups sind die visuelle Zielrichtung.

Sie sollen **nicht pixelgenau repliziert** werden.

Die finale Implementierung muss glaubwürdig wie ein echtes, hochwertiges HTML5-Spiel aussehen und gleichzeitig technisch realistisch bleiben.
