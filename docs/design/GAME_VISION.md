# Voidline Tactics – Game Vision

Stand: 22. August 2026  
Primärplattform: Mobile Browser im Querformat  
Combat-Modell: indirekte Flottenstrategie in langsamer Echtzeit mit Pause

## High Concept

**Voidline Tactics ist ein lesbares 2D-Flottenstrategiespiel, in dem der Spieler autonome Schiffsgruppen über drei Raumkorridore führt, strategische Infrastruktur kontrolliert und mit begrenzter Versorgung eine eskalierende Schlacht entscheidet.**

Der Spieler ist Flottenkommandant, nicht Pilot. Er setzt Absicht, Schwerpunkt und Ressourcen; Schiffe übernehmen Kursdetails, Zielsuche, Wenden und Standardfeuer.

## Produktversprechen

Ein neuer Spieler versteht innerhalb der ersten Minute:

1. Jede Route ist eine Front mit eigenen Chancen.
2. Eine Haltung gilt für alle eigenen Schiffe der gewählten Routengruppe.
3. Meine Schiffe kämpfen autonom; Einzelbefehle sind optional.
4. Relais und Werft verbessern meinen Nachschub.
5. Das gegnerische Command Ship ist das Endziel.
6. Pause, Zoom und freie Kamera kosten nichts.

Nach einem Match soll er erklären können, ob Routendruck, ein Objective, Versorgung, ein Rückzug oder der Verlust einer Schlüsselklasse die Schlacht entschieden hat.

## Designpfeiler

### Makro vor Mikro

Primärentscheidungen sind Routengruppe, Haltung, Versorgung und strategischer Schwerpunkt. Fokus und Spezialwaffen verfeinern einen Plan, ersetzen ihn aber nicht.

### Autonomie mit nachvollziehbaren Regeln

Schiffe verhalten sich abhängig von Rolle, Route und Haltung. Ihre Bewegung muss erklärbar bleiben: Korridorwechsel laufen über Junctions; Breitseite, Abstand und Rückzug erzeugen sichtbare Manöver.

### Drei unterschiedliche Routen

- **Oben:** längerer Weg, Relais verbessert Versorgung.
- **Mitte:** kürzester, offener und riskanter Weg zum Command Ship.
- **Unten:** Werft, Nebel und defensiver Flankenraum.

### Wenige starke Zustände

Angriff, Breitseite, Halten, Abstand und Rückzug müssen visuell und spielerisch klar unterscheidbar sein. Tiefe entsteht aus Wechselwirkung, nicht aus vielen kleinen Fähigkeiten.

### Spektakel dient Information

Waffen, Treffer, Schilde und Explosionen zeigen Reichweite, Richtung, Klasse und Wirkung. VFX darf wichtige Schiffe, Routendruck oder Objectives nicht verdecken.

### Mobile-first

Die Karte bleibt vollflächig. Große schwebende Command-Pods, klare deutsche Sprache, Pinch-Zoom, freies Pan und taktische Pause ermöglichen Tiefe ohne kleine Desktop-Menüs.

## Kern-Loop

```text
Startschiff und sichtbares Modul wählen
        ↓
Routengruppen und ersten Schwerpunkt festlegen
        ↓
3–6 Minuten autonome Flottenschlacht
        ↓
Objectives sichern und Versorgung investieren
        ↓
gegnerisches Command Ship ausschalten
        ↓
Nachkampfbericht, Reward und sichtbarer Refit
        ↓
nächster eskalierender Einsatz
```

Der aktive Proof of Concept deckt Vorbereitung, Schlacht, Objectives, Deployment und Ergebnis ab. Reward→Refit und drei Missionen sind die nächste Inhaltsstufe nach Combat-Polish und externem Playtest.

## Verantwortung

| System | Spieler | Automation |
|---|---|---|
| Routengruppe/Haltung | primär | setzt Absicht in Bewegung um |
| Objective-Priorität | durch Route und Verstärkung | Capture im Radius |
| Versorgung/Deployment | primär | Regeneration und Limits |
| Kurs/Wenden/Separation | – | vollständig |
| Standardziel und -feuer | optionaler Fokus | vollständig |
| Lanze/Torpedo/Schild | optional manuell | Gegner autonom |
| Kamera/Zeit | vollständig | kein Auto-Rücksprung |

## Kampfregeln des Slice

- 3–7 Schiffe pro Seite
- Command Ship plus Rollenklassen
- fünf Haltungen
- zwei gleichzeitig aktive Objectives
- eine Versorgung mit maximal 100
- maximal sieben lebende Schiffe pro Team
- garantierte Treffer bei gültiger Reichweite/Bogenlösung
- keine versteckten Miss-, Crit- oder Intercept-Würfe
- Sieg durch gegnerisches Command Ship; Niederlage beim eigenen Verlust

## Visuelle Richtung

Die Welt verbindet dunkle Navy-Instrumente, klare holografische Routen und glaubwürdige Schiffsmasse. Spieler-Cyan, Gegner-Rot und Objective-Gold bleiben semantisch stabil. Schiffe benötigen eigenständige Silhouetten, sichtbare Hardpoints, Engines, Schildkontakte und beschädigte Zustände.

## Scope-Grenzen

Vor einem bewiesenen Drei-Missionen-Vertical-Slice entstehen kein Multiplayer, kein 3D, keine Höhenebenen, keine Open World und kein komplexer Task-Force-Editor. Neue Systeme müssen mindestens eine bestehende Makroentscheidung verbessern.

## Qualitätsziele

- Erstaktion ohne externe Erklärung in höchstens 20 Sekunden
- erster Verlust median zwischen 25 und 50 Sekunden
- Match-Median 3–6 Minuten, P90 unter 7 Minuten
- Siegquote nach Onboarding 55–65 %
- stabile 60 FPS auf Pixel-7-Klasse bei 7v7
- alle Hauptaktionen mindestens 44×44 CSS-Pixel
- keine HUD-Überlagerung bei 844×390 und 667×375
- jede Niederlage durch Nachkampf- und Spielfeldsignale erklärbar
