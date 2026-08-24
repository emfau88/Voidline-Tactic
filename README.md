# Voidline: Farhaven

[Spiel im Browser öffnen](https://emfau88.github.io/Voidline-Tactic/)

Mobile-first 2D-Space-Explorer im Browser: Mit einem eigenen Schiff erkundest du kalte Sektoren direkt auf der Karte, klassifizierst unbekannte Signale, sicherst Bergungsgut und baust damit den persistenten Außenposten Farhaven aus.

## Aktueller spielbarer Kern

```text
Farhaven → Aschsaum I → Scannen → Anfliegen → Untersuchen → Rückkehr → Ausbau
```

Der aktuelle spielbare Prototyp enthält:

- direkte Schiffssteuerung mit sanfter Trägheit, Ausrollverhalten und Antriebs-VFX – per Touchstick oder Maus
- eine klar geschichtete Expeditionskarte: atmosphärischer Hintergrund, reduzierte unbekannte Echos und eindeutig beschriftete, antippbare Fundorte
- Scans mit Kurssetzen direkt auf einen bestätigten Fundort
- Bergung, Abbau, Fracht und Rückkehr nach Farhaven
- drei passive Übungsdummies für freiwillige Kampf-Tests, manuelle Salven und sichtbare Waffen-VFX
- einen modularen Außenposten mit Hangar, Scannerkapelle, Reliktlabor und Sternenwerk
- drei dauerhafte Ressourcen: Legierungen, Daten und Relikte
- eine Schiffswahl und Testwerft mit zehn sichtbaren Upgrade-Modulen
- persistente Ausbauten und Schiffsdaten über `localStorage` mit dem Save-Key `voidline-farhaven-save-v2`
- Touch-freundliche Querformat-PWA und taktische Pause

Exploration ist bewusst der Kern; Kampf ist derzeit ein optionaler, risikofreier Testbereich und kein Dauercombat-Loop.

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
