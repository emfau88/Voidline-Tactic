# Voidline: Farhaven

[Spiel im Browser öffnen](https://emfau88.github.io/Voidline-Tactic/)

Mobile-first 2D-Space-Explorer im Browser: Mit einem eigenen Schiff erkundest du kalte Sektoren direkt auf der Karte, klassifizierst unbekannte Signale, sicherst Bergungsgut und baust damit den persistenten Außenposten Farhaven aus.

## Aktueller spielbarer Kern

```text
Rumpfwahl → erstes Wrack → Hangar → Frachtrücken → Zweite Schicht
                                                  ├→ Notsignal (sicher) / Anomalie (riskant)
                                                  └→ Minenlaser → Schwarze Ader → Xenogate
```

Der aktuelle spielbare Prototyp enthält:

- direkte Schiffssteuerung mit sanfter Trägheit, Ausrollverhalten und Antriebs-VFX – per Touchstick oder Maus; zwei Finger zoomen auf mobilen Karten frei hinein und heraus
- eine klar geschichtete Expeditionskarte: atmosphärischer Hintergrund, reduzierte unbekannte Echos und eindeutig beschriftete, antippbare Fundorte
- Scans mit Kurssetzen direkt auf einen bestätigten Fundort
- ein sichtbares, sanft pulsierendes Xenogate: Nach drei sicheren Rückkehren und dem Minenlaser freiwillig anfliegen, durchqueren und die separate Platzhalterkarte **Veloria Rift** erkunden
- einen geführten ersten 10-Minuten-Loop mit kontextuellem Expeditionsdock: nahes Wrack scannen, drei Legierungen bergen, Fracht sichern, Hangar errichten, Frachtrücken kaufen, zwei kontrastierende Signale untersuchen und Minenlaser bauen
- eine zweite Expeditionsschicht mit sicherer Mönchslaterne (Relikt) und riskanter Schneideliturgie (Daten gegen Hüllenschaden)
- Schwarze Adern als klaren, aktiven Minenlaser-Fundort sowie einen optionalen, bewachten Plünderer-Cache
- Bergung, Abbau, Fracht und Rückkehr nach Farhaven
- drei passive, direkt antippbare Übungsdummies mit großen Zielzonen und einen optionalen, aktiven Aschenplünderer für freiwillige Kampf-Tests, manuelle Salven auch während des Flugs und sichtbare Waffen-VFX
- Farhaven als direkte, nahezu vollflächige Stationsoberfläche: Kernmodul, vier unmittelbar antippbare Andockplätze und vier klar als spätere Erweiterungen erkennbare Steckplätze
- drei dauerhafte Ressourcen: Legierungen, Daten und Relikte
- eine Schiffswahl mit kleinen Startvorteilen sowie eine aufgeräumte Hangarwerkstatt: echte Einbauten stehen zuerst; Rumpfideen bleiben unveränderliche visuelle Studien
- getrennte, mobile Raumansichten für die Farhaven-Bereiche: Übersicht, kurzer Raumstatus, eine Hauptaktion
- persistente Ausbauten, Schiffsdaten und laufende Expeditionen über `localStorage`; ein Reload setzt den Flug am letzten Ort fort
- strikte Frachtraumgrenzen und ein klarer Niederlagenzustand: Bei Hülle 0 wird das Schiff geborgen, ungesicherte Fracht geht verloren
- einen bestätigten **TEST**-Reset in der Kopfzeile, der den lokalen Entwicklerstand vollständig auf die Rumpfwahl zurücksetzt
- Touch-freundliche Querformat-PWA und taktische Pause

Exploration ist bewusst der Kern; Kampf ist derzeit ein optionaler, risikofreier Testbereich und kein Dauercombat-Loop. Flug kostet keine Energie: die sich schnell regenerierende **Systemladung** ist ausschließlich eine weiche Begrenzung für Scanner, Minenlaser und Waffen. Veloria Rift ist bewusst als Kartensonde markiert: eigene Atmosphäre und Signale sind vorhanden, Fraktion, Gefahren und Progression folgen erst mit dem Content-Ausbau.

## Entwicklungsstand

Der frühere Fleet-Corridors-PoC wurde lokal mit `fleet-corridors-poc-2026-08-24` getaggt und ist nicht mehr der aktive Runtime-Pfad. Der [GitHub-Pages-Link](https://emfau88.github.io/Voidline-Tactic/) zeigt die aktuelle Farhaven-Version; die frühere Fassung bleibt ausschließlich in der Git-Historie dokumentiert.

Die verbindliche Produktionsreihenfolge steht im [Farhaven Pivot-Plan](docs/planning/FARHAVEN_PIVOT_PLAN.md). Die aktuelle Produktvision steht in [Game Vision](docs/design/GAME_VISION.md), der überprüfbare Status in der [Roadmap](ROADMAP.md).

## Lokal entwickeln

Voraussetzung: Node.js 24 und npm.

```powershell
npm ci
npm run dev
```

```powershell
npm run typecheck
npm test
npm run build
```

## Struktur

```text
src/domain/exploration/  Scan-, Signal-, Cargo- und Expeditionsregeln
src/domain/outpost/      Einrichtungen, Ressourcen und Ausbauten
src/app/                 Save v2 und Spielablauf
src/game/scenes/         Farhaven- und Expeditionsdarstellung
docs/planning/           Produkt- und Produktionsplanung
```
