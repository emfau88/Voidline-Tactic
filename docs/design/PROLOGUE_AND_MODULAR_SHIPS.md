# Prolog und modulare Schiffe

Stand: 22. August 2026  
Status: verbindliche Produktrichtung, Umsetzung geplant

## Ziel

Der Einstieg beginnt nicht mit einer bereits ausgerüsteten Flotte und fünf gleichzeitig erklärten Kampfsystemen. Der Spieler stellt zuerst ein kleines persönliches Schiff zusammen, sieht jede Entscheidung direkt am Modell und beweist das Ergebnis in einem kurzen 1-gegen-1-Gefecht.

Das erste Erfolgserlebnis lautet damit:

> **Das ist mein Schiff. Ich habe diese Teile montiert. Im Kampf sehe und verstehe ich, was sie bewirken.**

## Die ersten sechs Minuten

| Zeitpunkt | Spielerhandlung | Neues Wissen |
|---|---|---|
| 0:00–0:30 | zwei kleine Starterhüllen ansehen und eine wählen | schnell/agil oder stabil/kontrolliert |
| 0:30–1:30 | eine Waffe und ein Support-Modul sichtbar montieren | Hardpoints, Reichweite, Schild oder Antrieb |
| 1:30–2:00 | kurzes Briefing und Start | Missionsziel und eine primäre Aktion |
| 2:00–4:30 | übersichtliches 1-gegen-1 gegen eine schwache Drohne | Joystick, Auto-Feuer, Ziel und ein defensiver Moment |
| 4:30–5:00 | Salvage und ein geborgenes Modul erhalten | Kampf erzeugt nachvollziehbaren Fortschritt |
| 5:00–6:00 | Modul im Dock testen, nächste Hüllen als Vorschau sehen | Vorfreude und nächste Entscheidung |

Mission 1 zeigt zunächst nur die wirklich benötigten Bedienelemente. Pause, Eskorte, Torpedo und weitere Systeme werden erst eingeblendet, wenn die jeweilige Mechanik eingeführt wird.

## Zwei Starterhüllen

Die Namen sind Arbeitstitel; Rollen und Lesbarkeit sind verbindlich.

### Needle — leichter Skirmisher

- hohe Dreh- und Beschleunigungsrate
- frontaler Waffen-Hardpoint
- kleiner Utility-Hardpoint
- niedrige Schild-/Hüllenreserve
- verständliche Wahl für Spieler, die aktiv steuern und Distanz kontrollieren möchten

### Bulwark — schwerer Cutter

- niedrigere Dreh- und Beschleunigungsrate
- seitlicher oder breiter Waffen-Hardpoint
- sichtbarer Shield-Emitter-Hardpoint
- höhere Fehlertoleranz
- verständliche Wahl für Spieler, die Position halten und Treffer abfangen möchten

Beide Schiffe müssen Mission 1 zuverlässig schaffen. Die Wahl verändert Spielgefühl und Bild, nicht den Schwierigkeitsgrad.

## Erste sichtbare Module

Vor Mission 1 werden genau zwei Slots bestückt:

1. **Waffe:** Auto Cannon oder Twin Rockets
2. **Support:** Pulse Engine oder Front Shield

Jedes Modul benötigt fünf zusammengehörige Bestandteile:

- sichtbares montiertes Bauteil am Hardpoint
- eigener Muzzle-, Projectile-, Engine- oder Shield-Effekt
- ein klarer taktischer Satz statt einer Zahlenwand
- höchstens zwei hervorgehobene Stat-Änderungen
- ein eigener Ton beziehungsweise später ein eigener Audio-Layer

Beispiel: „Twin Rockets: starke Frontsalve auf Distanz, aber lange Nachladezeit.“ Ein verstecktes `+5 % Schaden` erfüllt diese Regel nicht.

## Progression der ersten drei Missionen

### Mission 1 — Kalibrierungsflug

- 1-gegen-1 gegen eine einzelne, gut lesbare Drohne
- große sichere Arena und kurzer Erstkontakt
- Joystick, Ziel und die gewählte Waffe
- ein angekündigter gegnerischer Angriff als Einführung in Front Shield oder Ausweichen
- Belohnung: Salvage plus Wahl aus zwei geborgenen Modulen

### Mission 2 — Gebrochene Eskorte

- 1-gegen-2 mit zwei klar verschiedenen kleinen Gegnerrollen
- zweites manuelles System wird eingeführt
- ein leichtes Positionsziel statt bloß zusätzlicher Lebenspunkte
- Belohnung: zweiter Modulslot oder Qualitätsstufe; Vorschau auf die nächsten zwei bis drei Schiffe

### Mission 3 — Erstes Kommando

- erstes verbündetes Schiff und eine einzige Eskorte-Direktive
- kleiner Relais- oder Werftpunkt als verständliches Lane-Wars-Versprechen
- Produktion bleibt auf wenige schwache Drohnen begrenzt und ist noch kein dauerhaftes RTS-System
- Belohnung: erste neue Hülle freischalten oder das Startschiff weiter spezialisieren

Die derzeitigen Cruiser-/Frigate-Modelle sind damit keine anonymen Starter mehr. Sie werden zu begehrenswerten Tier-2-/Tier-3-Vorschauen und späteren Freischaltungen. Der bestehende Drei-Missionen-Content kann als Grundlage weiterverwendet, aber nach hinten verschoben und neu balanciert werden.

## Refit-Regeln

- Hüllenwechsel und Umbauten nur zwischen Missionen
- Module bleiben beim Hüllenwechsel im Inventar, sofern ein kompatibler Hardpoint existiert
- genau eine große Belohnungsentscheidung nach einer frühen Mission
- neue Hüllen zunächst als Silhouette, Rolle, Hardpoints und Freischaltbedingung zeigen
- kein zufälliger Shop und keine Loot-Seltenheit im Vertical Slice
- Rückbau ist kostenlos, damit Experimentieren nicht bestraft wird

## Technisches Schiffsmodell

```text
ShipHullDefinition
  baseSprite
  damageSprites[]
  hardpoints[]
  engineSockets[]
  shieldEmitterSockets[]
        ↓
ShipLoadout = hullId + mountedModules[]
        ↓
Presentation Layers
  hull → damage → weapons → engines → emissives → shield/VFX
```

Hardpoints speichern Position, Rotation, Kategorie, Größenklasse und erlaubte Feuerbögen. Module liefern Werte **und** Darstellung. Dadurch stammen Menü-Preview, Kampfschiff und Schadenszustände aus demselben Loadout; es gibt keine getrennte „Menü-Illusion“.

## Erkenntnisse aus der Foozle-Referenz

Das lokal geprüfte Paket **Void – Main Ship 1.0**, commissioned from Baldur und distributed by Foozle, ist laut beiliegender Readme unter **CC0** veröffentlicht. Es enthält:

- vier 48×48-Hullzustände von intakt bis stark beschädigt
- vier montierbare Engine-Varianten samt Idle-/Powering-Animation
- Auto Cannon, Big Space Gun, Rockets und Zapper als separate Waffen-Spritesheets
- Front-, Front-und-Seiten-, Rund- und Invincibility-Shields als animierte Bögen
- getrennte Projectile-Sprites und Aseprite-Quellen

Die Referenz beweist die gewünschte modulare Lesbarkeit, ist aber stilistisch deutlich pixeliger als die aktuelle Voidline-Bildsprache. Für den Produktionsbuild gilt deshalb:

- Schicht- und Socket-Prinzip übernehmen
- Schildbogen-Rhythmus, Engine-Zustände und Damage-Layer als VFX-Referenz nutzen
- originale hochauflösende Voidline-Hüllen und Module erstellen
- Foozle-Bitmaps höchstens in einem isolierten Technik-Prototyp verwenden, nicht unangekündigt mit der aktuellen Kunst mischen

## Abnahme des Prolog-Slices

- ein Erstspieler wählt ohne Erklärung eine Hülle und kann den Unterschied korrekt wiedergeben
- zwei Montageschritte verändern das Schiff im Dock und im Gefecht sichtbar
- Mission 1 startet innerhalb von 90 Sekunden und endet in 2–3 Minuten
- erster sinnvoller Steuerinput erfolgt in höchstens 15 Sekunden
- der Spieler kann nach dem Kampf Waffe, Support-Modul und Belohnung benennen
- auf 667×375 bleiben mindestens 68 % zusammenhängende freie Spielfeldhöhe erhalten
- Save, Unit-Tests, Mobile-E2E und reproduzierbare Screenshots decken Wahl, Montage, Kampf, Reward und Refit ab
