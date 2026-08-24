# Roadmap

Stand: 24. August 2026
Aktiver Produktpfad: **Voidline: Farhaven – Singleplayer-Space-Explorer**

## Legende

- ✅ abgeschlossen
- 🚧 in Arbeit
- ⏳ geplant

## F0 – Pivot und Baseline ✅

- Fleet-Corridors-PoC lokal mit `fleet-corridors-poc-2026-08-24` getaggt
- sichtbarer Produktname, PWA-Metadaten und Einstieg auf `Voidline: Farhaven` umgestellt
- kanonische Vision, Roadmap, README und Produktionsplan auf Farhaven ausgerichtet
- alter v1-Campaign-Save wird nicht überschrieben

## F1 – Explorations-Greybox 🚧

- ✅ versionierter Farhaven-Save v2
- ✅ Farhaven-Außenposten mit vier ersten Einrichtungen
- ✅ Aschsaum I mit direkter Flugstick-Steuerung, Scan, Klassifikation und Rückkehr
- ✅ mehrbildschirmiger 4200×2600-Sektor mit Follow-Kamera, Trägheit und Triebwerks-VFX
- ✅ map-first Expeditions-HUD: schmale Statusleiste oben, Flugstick links, Aktionen rechts
- ✅ erster vermeidbarer Kontakt mit Feuerreichweite und sichtbarer Breitseitensalve
- ✅ kompakte Top-down-Bauplatte statt großflächiger Stationsillustration: vier eindeutige Andockplätze, Baugerüste und nach Bau sichtbare Modulräume
- ✅ Cargo und drei sichere Ressourcenfamilien
- ✅ Hangar- und Scanner-Ausbau verändern Folgeexpeditionen
- ✅ einmalige Startwahl zwischen Erkundungskutter und Bergungsschlepper
- ✅ Hangar-Testwerft mit zehn dauerhaft sichtbaren Komponenten-Prototypen
- ✅ erster geschlossener Prolog: Wrack scannen und bergen → Fracht sichern → Hangar → echter Frachtrücken
- ✅ zweite Prologschicht: sichere Mönchslaterne oder riskante Schneideliturgie → Daten/Relikt → echter Minenlaser
- ✅ erste aktive Ressourcenschleife: Minenlaser → Schwarze Ader → Legierungen
- ✅ optionaler Aschenplünderer bewacht einen Bergungs-Cache; er ist kein Pflichtkampf
- ✅ Xenogate erst nach drei Rückkehren und aktivem Minenlaser freigeschaltet
- ✅ mobile Farhaven-Navigation in getrennte Raumansicht mit genau einer Hauptaktion pro Bereich überführt
- ✅ Flug ohne Reichweiten-/Treibstoffdruck; regenerierende Systemladung nur für aktive Systeme
- ✅ bestätigter lokaler Entwickler-Reset zurück zur Rumpfwahl
- ⏳ mehrteilige Signalentscheidungen und reproduzierbare Sektor-Seeds
- ⏳ Unit-Tests für Scan, Cargo, Rückkehr und Save-Validierung

## F2 – Vollständiger Exploration-Loop ⏳

- zweiter vollwertiger Sektor und acht weitere Signalereignisse
- Wracks, Rohstoffe, Anomalien und Notsignale mit unterschiedlichen Resultaten
- sichtbare, modulare Außenposten-Ausbaustufen und atmosphärische Detailräume
- Progression für 30–45 Minuten
- Autosave während Expeditionen und nach Browser-Unterbrechung

## F3 – Gelegentlicher Combat ⏳

- Combat-Core von Fleet-Abhängigkeiten lösen
- zwei telegraphierte, vermeidbare Gegnertypen
- Flucht, Energiepriorisierung und Bergungsfolgen
- Breitseiten, Rail-Lanze, Torpedos und Relikt-Ordnanz als positionsgebundene Spielerentscheidungen
- Combat-Anteil unter 30 % einer durchschnittlichen Expedition

## F4 – Art, Audio und Validierung ⏳

- eigenständiger cozy-grimdark Art-Pass
- Scan-, Bergungs-, Anomalie- und Rückkehr-Audio
- Mobile-/PWA-/Save-E2E-Matrix
- externe Erstspieler-Tests und Performance-Soak

Die ausführlichen Abnahme-Gates, Risiken und Architekturentscheidungen stehen im [Farhaven Pivot-Plan](docs/planning/FARHAVEN_PIVOT_PLAN.md).
Der konkrete Außenposten-Aufbau ist im [modularen Farhaven-Plan](docs/planning/FARHAVEN_MODULAR_OUTPOST_PLAN.md) festgehalten.
Die sichtbare Entwicklung der Spielerschiffe ist im [Schiffswerft-Plan](docs/planning/SHIP_MODULARITY_PLAN.md) beschrieben.
Die Kampfsysteme, ihre Scope-Grenzen und Abnahme-Gates stehen im [Combat-Plan](docs/planning/FARHAVEN_OPTIONAL_COMBAT_PLAN.md).
