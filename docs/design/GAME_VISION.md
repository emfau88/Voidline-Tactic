# Voidline Tactics — Game Vision

Status: verbindliche Produktvision ab 22. August 2026

Primärplattform: Mobile Browser, Landscape-Combat

Sekundärplattform: Desktop Browser

Combat-Modell: langsame Echtzeit mit taktischer Pause

## 1. High Concept

**Voidline Tactics ist ein lesbares, optisch hochwertiges 2D-Flottentaktikspiel, in dem der Spieler ein Flaggschiff direkt steuert, einer kleinen Eskorte Absichten vorgibt und wenige entscheidende Schiffssysteme im richtigen Moment auslöst.**

Der Spieler soll sich wie ein Captain fühlen, nicht wie ein Buchhalter für vier Aktionsleisten. Die Flotte bewegt und verteidigt sich kontinuierlich; der Spieler setzt den gewünschten Kurs, den Fokus und übernimmt die dramatischen Entscheidungen.

Die taktische Pause ist kein Ausnahmezustand, sondern ein gleichwertiges Werkzeug. Sie lässt das Gefecht vollständig ruhen, ohne Aktionen zu sperren. ¼-Tempo erlaubt Beobachtung und Korrektur; Live sorgt für Fluss und Wirkung.

## 2. Produktversprechen

Ein neuer Spieler soll innerhalb der ersten Minute verstehen:

1. Ich steuere das hervorgehobene Flaggschiff.
2. Der Joystick setzt einen dauerhaften Sollkurs; das Schiff dreht und beschleunigt träge dorthin.
3. Standardbatterien arbeiten automatisch.
4. Lanze, Torpedo und Schild-Boost sind meine bewussten Entscheidungen.
5. Pause ist jederzeit erlaubt und kostet nichts.
6. Rote Telegraphs bedeuten: Jetzt kann ich noch reagieren.

Nach einem Kampf soll er sagen können, **warum** er gewonnen oder verloren hat: falscher Seitenbogen, gebrochene Lance-Lösung, zu früher Shield-Boost, schlechte Formation oder ignoriertes Terrain.

## 3. Designpfeiler

### 3.1 Fluss statt Rundenverwaltung

Schiffe bewegen, drehen, regenerieren Energie und kämpfen kontinuierlich. Es gibt keine AP, Turns, Command Beats oder verpflichtende Bestätigungsphase.

### 3.2 Wenige hochwertige Entscheidungen

Direkt kontrolliert werden:

- der Kurs des Flaggschiffs
- ein gemeinsames Fokusziel
- eine grobe Eskorte-Direktive
- Rift Lance
- Void Torpedo
- Shield Boost
- Simulationsgeschwindigkeit

Standardbreitseiten, Formationsnavigation und grundlegende Zielverfolgung laufen automatisch.

### 3.3 Position muss laufend Bedeutung haben

Entfernung allein genügt nicht. Relevante Größen sind:

- Front- und Seitenbogen
- begrenzte Drehrate und Beschleunigung
- sichere beziehungsweise gefährliche Telegraph-Zonen
- Formation und gegenseitige Deckung
- Nebel- und spätere Terrain-Effekte
- physische Flugbahn von Torpedos

Nach dem ersten Kontakt müssen weitere Kursentscheidungen lohnend bleiben.

### 3.4 Telegraph vor Bestrafung

Starke Effekte werden früh, einheitlich und farblich eindeutig angekündigt. Ein Spieler bekommt eine faire Reaktionsfrist und versteht, ob Kurs, Pause, Shield oder Zielwechsel helfen kann.

### 3.5 Mobile-first, nicht mobile-simplistisch

Touch-Ziele sind groß, Status ist hierarchisch, Text knapp und Gesten kollisionsfrei. Taktische Tiefe entsteht aus Geometrie, Timing und Verantwortungsteilung, nicht aus vielen kleinen Buttons.

### 3.6 Originale, glaubwürdige Welt

Die Bildsprache verbindet Navy-Instrumente, gotische Schiffskultur und klare holografische Taktik. Jede Schiffsklasse hat eine unverwechselbare Silhouette, sichtbare Waffenorte, Thruster und Schadenszustände.

## 4. Kern-Loop

```text
eine von zwei kleinen Starterhüllen wählen
        ↓
eine Waffe und ein Support-Modul sichtbar montieren
        ↓
kurzes Missionsbriefing
        ↓
2–5 Minuten Echtzeitkampf, beginnend mit einem 1-gegen-1
        ↓
Resultat, Credits und Salvage
        ↓
sichtbares Trade-off-Upgrade wählen
        ↓
nächster Encounter oder Replay
```

Der aktuelle Slice schließt Resultat, einmaliges Salvage, Upgrade-Wahl und Missionsfreischaltung bereits funktional. Die erste Prologstufe ist spielbar: ein verpflichtendes sichtbares Support-Modul und ein echtes 1-gegen-1. Kleine Hüllen, die zweite Waffenmontage und Reward→Refit sind die nächsten verbindlichen Produktionsschritte. Details stehen in [Prolog und modulare Schiffe](PROLOGUE_AND_MODULAR_SHIPS.md).

## 5. Combat-Verantwortung

| System | Spieler | Automation |
|---|---|---|
| Flaggschiff-Kurs | setzt Sollrichtung per Joystick | dreht und beschleunigt träge auf den Sollkurs |
| Fokusziel | markiert Gegner | Standardbatterien priorisieren ihn |
| Eskorte | wählt Folgen/Flanke/Schutz | navigiert, hält Formation, nutzt Standardwaffen |
| Broadside | stellt Kurs und Seitenbogen her | feuert bei gültiger Lösung |
| Rift Lance | löst Ladephase aus | feuert nach Telegraph bei stabiler Lösung |
| Void Torpedo | löst Start aus | verfolgt Ziel physisch |
| Shield Boost | löst Timing aus | reduziert Schaden für kurze Zeit |
| Zeit | Pause/¼/Live | Simulation bleibt deterministisch |

Diese Trennung ist verbindlich. Weitere Systeme dürfen nur dann einen eigenen Button erhalten, wenn ihre Entscheidung wichtiger ist als die dadurch erzeugte HUD-Last.

## 6. Steuerung

### Touch

- linken Richtungs-Joystick ziehen: Sollkurs setzen; Loslassen hält die Richtung
- Tap auf Gegner: Fokusziel setzen
- Tap auf Fähigkeit: sofort auslösen oder Zielauswahl anfordern
- Tap auf Eskorte: Direktive zyklisch wechseln
- Zwei-Finger-Pinch: Kamera um Mittelpunkt zoomen
- Zeitbuttons: Pause, ¼-Tempo, Live

### Desktop

Die gleichen Regeln gelten für Maus. Mausrad und Zoom-Buttons ergänzen Pinch. Tastaturkürzel sind optional und dürfen kein exklusives Feature sein.

### Offene Control-Entscheidung

Der Joystick ist nach direktem Nutzerfeedback die aktive Primärsteuerung. Die frühere geglättete Kurszeichnung bleibt technisch erhalten, ist im aktuellen Build jedoch inaktiv. Sie kann später ausschließlich als Pausenwerkzeug zurückkehren, falls Mission-Playtests einen Bedarf für längere vorausgeplante Manöver zeigen.

## 7. Combat-Systeme

### 7.1 Kinematik

Jedes Schiff besitzt maximale Geschwindigkeit, Beschleunigung, Drehrate und Radius. Ein Sollkurs ist eine gewünschte Ausrichtung, kein Teleport oder Sofortdrehen. Große Schiffe wenden sichtbar langsamer als kleine. Eine spätere Pausenroute muss dieselben kinematischen Regeln verwenden.

### 7.2 Energie und Cooldowns

Energie regeneriert kontinuierlich. Fähigkeiten besitzen transparente Kosten und Cooldowns. Energie soll Timing-Entscheidungen erzeugen, aber den Spieler nicht lange untätig lassen.

### 7.3 Standardbatterien

Breitseiten sind automatisch, deterministisch und an Seitenbögen gebunden. Ihre Kadenz erzeugt Grunddruck; der Spieler verantwortet die Geometrie.

### 7.4 Rift Lance

- Frontbogen
- klarer Lade-Telegraph
- hoher Schilddruck
- Feuerlösung kann während der Ladezeit gebrochen werden
- deutliche Audio-/Licht-Eskalation bis zum Schuss

### 7.5 Void Torpedo

- Frontbogen beim Start
- physisches, sichtbares Projektil
- begrenzte Drehgeschwindigkeit und Lebenszeit
- kein versteckter Miss- oder Intercept-Wurf
- später durch sichtbare Point Defense oder Gelände konterbar, niemals durch unsichtbare Prozentchance

### 7.6 Shield Boost

- sofortige Teilwiederherstellung
- kurze sichtbare Schadensreduktion
- hoher Cooldown
- klare Start-, Aktiv- und Endzustände

### 7.7 Terrain

Der aktuelle Nebel reduziert eingehenden Schaden um 25 %. Weitere Terrain-Typen müssen auf einen Blick verständlich sein und Bewegung provozieren, etwa Sensorstörung, Energiegewinn, gefährliche Trümmer oder Line-of-Sight-Blocker.

## 8. Encounter-Ziele

Der erste Encounter wird ein 1-gegen-1-Kalibrierungsflug. Er soll:

- innerhalb von 20–35 Sekunden einen ersten lesbaren Waffeneffekt zeigen
- mindestens einen sinnvollen Kurswechsel nach Kontakt verlangen
- die gewählte Waffe und ein defensives Manöver demonstrieren
- in 2–3 Minuten enden
- ohne externe Erklärung lösbar sein

Der zweite Encounter führt einen zweiten Gegnertyp und ein einfaches Positionsziel ein. Das erste verbündete Schiff erscheint erst in Mission 3; damit wachsen HUD und Verantwortung gemeinsam mit dem Verständnis.

Der aktuelle Drei-Missionen-Slice ist eine funktionale Content-Basis und wird in die neue Kurve eingeordnet:

1. **Kalibrierungsflug:** neues 1-gegen-1, zwei vorher sichtbar montierte Module und erste Upgrade-Wahl.
2. **Gebrochene Eskorte:** 1-gegen-2 und ein leichtes Positionsziel.
3. **Erstes Kommando:** erste Eskorte sowie ein begrenzter Relais-/Werftmechanismus.

Der frühere 2-gegen-2-„Erste Kontakt“ ist bereits auf das echte 1-gegen-1 reduziert. Relaisknoten und gebrochene Werft bleiben verwertbar, müssen aber noch in die neue Kurve 1v1 → 1v2 → erstes Kommando eingeordnet werden.

## 9. Informationshierarchie

Priorität auf dem Kampfbild:

1. gefährlicher gegnerischer Telegraph
2. aktueller Fokus und Feuerlösung
3. Kurs des Flaggschiffs
4. Hull/Shield des Flaggschiffs
5. Cooldown-/Energiezustand manueller Systeme
6. Eskorte-Direktive
7. sekundäre Detailwerte

Effekte dürfen diese Reihenfolge kurzfristig verstärken, aber nicht verdecken. Farbe allein ist nie der einzige Statusindikator.

## 10. Art-, VFX- und Audio-Ziel

### Schiffe

- true top-down und silhouette-first
- sichtbare Hardpoints und Waffenvarianten
- getrennte Thruster-/Emissive-Ebenen
- mindestens intakt, beschädigt und kritisch lesbar

### VFX

- Warm-up → Release → Travel → Impact → Aftermath
- klassenspezifische Mündungsbilder und Impacts
- begrenzte Bildschirmhelligkeit auf OLED
- gepoolte Effekte ohne Performance-Wachstum

### Audio

- UI, Engine/Ambience, Weapon und Impact als getrennte Busse
- 3–5 Varianten für häufige Schüsse/Impacts
- klares Lance-Warm-up als Gameplay-Telegraph
- Mobile-Unlock, Suspend/Resume und Mute/Volume

## 11. Progression und sichtbare Ausrüstung

Der Einstieg folgt einer festen Reihenfolge: kleine Hülle wählen, genau eine Waffe und ein Support-Modul montieren, 1-gegen-1 fliegen, Salvage erhalten und erneut umrüsten. Die derzeitigen großen Cruiser-/Frigate-Schiffe werden zu sichtbaren späteren Freischaltungen statt sofort verfügbarer Starter.

Upgrades sollen Verhalten verändern und am Schiff sichtbar werden. Beispiele:

- breite Mass-Driver-Batterie: langsamer, härter, größere Salve
- schnelle Coil-Broadside: geringerer Schaden, höherer Druck
- Twin Torpedo Rack: zwei sichtbare Projektile, längerer Cooldown
- Overcharged Lance: längerer Telegraph, größerer Shield-Burst
- reinforced shield projector: stärkerer Boost, geringere Geschwindigkeit

Reine `+5 % Schaden`-Knoten sind nur als Nebenwert erlaubt. Der Spieler soll im Menü erkennen, welche Hardpoints und taktischen Möglichkeiten ein Schiff besitzt.

## 12. Vertical-Slice-Scope

### Enthalten

- zwei wählbare kleine Starterhüllen mit sichtbaren Modul-Sockets
- ein 1-gegen-1-Prolog und danach eine halbautonome Eskorte
- zwei normale Gegner und ein Elite-/zweiter Encounter
- Broadside, Lance, Torpedo und Shield Boost
- ein regelrelevantes Terrain-System
- Results, Salvage, vier Trade-off-Upgrades und Replay
- drei Missionen mit Relay-/Shipyard-Objective und begrenzten Verstärkungen
- vollständiger Mobile-Flow mit Audio, VFX und Onboarding

### Nicht enthalten

- Boarding
- Officers/Crew-Management
- große Kampagne
- Multiplayer
- 3D-Raum, Höhenebenen oder ballistische Physiksimulation
- prozedurale Galaxie

## 13. Technische Leitplanken

- pure TypeScript-Domäne ohne Phaser-/DOM-Abhängigkeit
- deterministischer Fixed-Step; Rendering-Delta beeinflusst keine Regeln
- Daten statt Scene-Hardcoding für Schiffe, Waffen, Encounter und Upgrades
- DOM-HUD für Accessibility, Canvas für Welt und VFX
- Projektile und Effekte werden gepoolt, sobald die Zahl regelmäßig wächst
- Savegame ist versioniert und migrierbar
- jedes zentrale System erhält Unit- und Mobile-E2E-Abdeckung
- Produktionsbuild bleibt statisch auf GitHub Pages ausführbar

## 14. Qualitätsmetriken

| Metrik | Ziel Vertical Slice |
|---|---|
| Erstaktion ohne Hilfe | ≤ 20 Sekunden |
| erster klarer Waffeneffekt | ≤ 35 Sekunden |
| Median-Kampfzeit | 3–5 Minuten |
| relevante Kurswechsel | ≥ 3 pro Kampf |
| Mobile Performance | stabile 60 FPS im Pixel-7-Profil |
| kritische Console Errors | 0 |
| Neustarts ohne Objektwachstum | 3 vollständige Runs |
| zentrale Flows | Mobile + Desktop automatisiert |
| Verständlichkeit | 4 von 5 Erstspielern erklären Sieg/Niederlage korrekt |

## 15. Entscheidungsregel

Wenn ein neues Feature vorgeschlagen wird, muss es mindestens eines verbessern:

- Kursentscheidung
- Timingentscheidung
- Lesbarkeit
- Flottenidentität
- Replay-Loop

Erhöht es nur die Anzahl der Knöpfe oder Werte, ohne eines dieser Ziele messbar zu verbessern, gehört es nicht in den Vertical Slice.
