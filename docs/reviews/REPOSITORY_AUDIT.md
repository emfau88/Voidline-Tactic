# Repository Audit

Stand: 21. August 2026  
Analysierter Ausgangs-Commit: `f2571b3` (`Add files via upload`)

> Historische Bestandsaufnahme des Ausgangsrepos. Die damaligen Empfehlungen zu Desktop, Rundenfluss und Prototypstruktur sind durch die aktuelle [Game Vision](../design/GAME_VISION.md), [Roadmap](../../ROADMAP.md) und den Tactical-Real-Time-Build ersetzt. Der Audit bleibt als nachvollziehbarer Vorher-Zustand erhalten.

## Kurzurteil

Die Spielidee ist klar und als kleiner taktischer Browser-Titel grundsätzlich tragfähig. Der bessere HTML-Prototyp beweist bereits, dass Movement, Facing und unterschiedliche Feuerwinkel zusammen verständliche Entscheidungen erzeugen können. Das Repository ist dennoch noch kein Entwicklungsprojekt, sondern eine Sammlung aus Vision, drei Mockups und zwei Single-File-Spikes.

Die richtige nächste Maßnahme ist keine weitere Erweiterung des HTML-Prototyps, sondern eine saubere Neuimplementierung des Vertical Slice mit getrenntem Simulationskern, Rendering, UI, Content und Tests.

## Geprüfter Bestand

| Bereich | Befund |
|---|---|
| Vision | 1.667 Zeilen; starke Produktvision, klare Scope-Grenzen und sinnvolle Vertical-Slice-Definition |
| Prototyp v2 | 1.185 Zeilen / ca. 52 KB; eigenständiges Canvas-Spiel ohne externe Abhängigkeiten |
| Prototyp v1 | 714 Zeilen / ca. 37 KB; älterer und deutlich einfacherer Stand |
| Mockups | 3 flache PNG-Kompositionen, jeweils 1672×941; keine separierten Produktionsassets |
| Projektsetup | kein `package.json`, kein TypeScript, keine Engine, keine Tests, keine CI, kein Build |
| Rechtliches | keine Lizenzdatei und keine Asset-Provenienz im Repository |

## Live-Test des Prototyps v2

Getestet wurden der Desktop-Stand bei ungefähr 1423×800 sowie eine schmale Mobile-Ansicht. Es traten keine Console-Fehler auf.

Funktioniert:

- Auswahl von Spieler- und Gegnerschiffen
- Movement-Radius, Zielposition, Ghost Ship, Facing-Griff und Bestätigung
- Live-Vorschau von Front- und Broadside-Arcs
- gültige/ungültige Zielprüfung nach Winkel und Reichweite
- zweistufige Treffervorschau mit Hit Chance und Schadensband
- Broadside-Schaden, Energie-/AP-Verbrauch und visuelles Feedback
- Gegnerbewegung, Gegnerangriffe und sauberer Rundenwechsel
- Sieg, Niederlage, Reward-Screen und drei temporäre Upgrades

## Stärken

1. **Die Kernfantasie ist fokussiert.** Kleine Flotten, Facing, Breitseiten und individuelle Schiffe ergeben ein erkennbares Profil.
2. **Die Vision setzt sinnvolle Grenzen.** Kein unnötiges 3D, kein Multiplayer und keine übergroßen Meta-Systeme vor dem Vertical Slice.
3. **Die UX-Grundidee funktioniert.** Aktionsmodus, Reichweiten-Overlay, Ghost/Facing und zweiter Klick zum Feuern sind auch im Rohzustand nachvollziehbar.
4. **Waffen besitzen erste Identität.** Breitseiten, Front-Lance und Torpedo verlangen unterschiedliche Positionierung.
5. **Die Mockups zeigen eine konsistente Zielqualität.** Combat, Shipyard und Crew verwenden dieselbe visuelle Grammatik.

## Kritische Produktionsrisiken

### P0 – Architektur und Testbarkeit

Der aktuelle v2-Stand vereint HTML, CSS, Zustandsmodell, Input, Regeln, KI, Animation und Rendering in einer Datei. Das widerspricht der eigenen Vision und verhindert belastbare Tests, Content-Erweiterung und parallele Arbeit. Der Spike darf als Referenz bleiben, sollte aber nicht refaktoriert werden; die Produktionsbasis wird neu aufgesetzt.

### P0 – Spielregeln hängen von der Viewportgröße ab

Schiffspositionen sind normalisiert, aber Bewegung, Waffenreichweiten und Kollisionsradien werden in festen CSS-Pixeln berechnet. Dadurch ändern Desktop- und Mobile-Viewport die tatsächliche taktische Distanz und das Balancing. Die Produktionsversion braucht feste World Units und eine davon unabhängige Kamera-/Layouttransformation.

### P0 – Keine produktionsfähigen Assets

Die vier Schiffe werden aus primitiven Canvas-Polygonen gezeichnet. Die Konzeptbilder sind flache Kompositionen und können keine Sprite-, Emissive-, Damage-, Icon- oder UI-Pipeline ersetzen. Zusätzlich fehlt jede Dokumentation zu Herkunft, Nutzungsrechten und Bearbeitungsquellen.

### P0 – Keine Persistenz oder Content-Pipeline

Upgrades leben nur im aktuellen Seitenprozess. Schiffe, Waffen, Missionen und Module sind hart im JavaScript verdrahtet. Ein persistenter Flotten-Loop ist so nicht belastbar erweiterbar.

### P1 – Mobile Layout ist nicht fertig

Auf schmaler Breite überlappen beziehungsweise beschneiden sich Aktionsleiste und End-Turn-Button; die horizontale Aktionsleiste vermittelt nicht klar, dass weitere Aktionen scrollbar sind. Die Vision priorisiert Desktop, daher sollte der Vertical Slice zunächst Desktop vollständig lösen und Mobile als bewusstes, getestetes Layout behandeln.

### P1 – Kampfregeln sind inkonsistent

- Gegnerangriffe verwenden nicht dieselbe Hit-/Intercept-Logik wie Spielerangriffe und treffen derzeit garantiert.
- Die Gegner-KI prüft Energie vor dem Feuern nicht und kann den Wert unter null ziehen.
- Schadensvorschau und tatsächlich ausgewürfelter Schaden stammen nicht aus genau derselben Berechnung.
- `Shield Boost` erhöht den Schild sofort, reduziert danach aber die normale Regeneration von 8 auf 4; die Benennung suggeriert das Gegenteil.
- Zufall ist nicht seedbar, wodurch Replays und reproduzierbare Tests fehlen.

### P1 – Presentation Gap

Der Prototyp besitzt funktionale, aber sehr einfache VFX: Linien, Kreise, Partikelpunkte und Screen Shake. Audio fehlt vollständig. Es gibt keine originalen Schiffe, Texturdetails, Schadenszustände, Muzzle-Hardpoints, Schildverformung, Debris, dynamische Beleuchtung oder musikalische Dramaturgie.

### P2 – UX, Sprache und Barrierefreiheit

- Dokument `lang="de"`, Oberfläche aber fast vollständig Englisch.
- `user-scalable=no` verhindert Browser-Zoom.
- Canvas-Schiffe sind nicht per Tastatur erreichbar; ikonische Buttons benötigen bessere zugängliche Namen und Fokuszustände.
- Toasts verschwinden zeitgesteuert und sind nicht als Live-Region ausgezeichnet.
- Animationen haben keine Reduced-Motion- oder Fast-Forward-Option.
- Der getestete Gegnerzug mit zwei Schiffen dauerte rund acht Sekunden und sollte deutlich straffer beziehungsweise überspringbar sein.

### P2 – Frame-abhängige Effekte

Partikelwahrscheinlichkeiten und Lebensdauer werden pro Frame statt mit Delta Time aktualisiert. Darstellung und Last variieren dadurch mit der Bildrate.

## Produktentscheidung

Der aktuelle Prototyp wird als **Interaction Spike** eingefroren. Die Produktionsversion übernimmt Verhalten und Erkenntnisse, aber keinen monolithischen Code. Zuerst wird ein deterministischer, renderer-unabhängiger Combat Core erstellt; anschließend werden Phaser-Szenen, HUD, Assets und Effekte darum aufgebaut.

Die vollständige Vision bleibt gültig, aber Boarding, Officers, komplexe Crew und die 10–15-Missionen-Kampagne beginnen erst nach einem erfolgreichen, extern getesteten Vertical Slice.
