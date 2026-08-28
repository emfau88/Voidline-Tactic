# Voidline: Farhaven

[Spiel im Browser öffnen](https://emfau88.github.io/Voidline-Tactic/)

Mobile-first 2D-Space-Explorer im Browser: Mit einem eigenen Schiff erkundest du kalte Sektoren direkt auf der Karte, klassifizierst unbekannte Signale, sicherst Bergungsgut und baust damit den persistenten Außenposten Farhaven aus.

## Aktueller spielbarer Kern

```text
Rumpfwahl → erster Scan → Wrack bergen ───────────────→ Rückkehr
                         └→ Glutkutter stellen → Bonusbeute ↗
                              ↓
                Hangar → Frachtrücken → Zweite Schicht
                                      ├→ Archiv (sicher)
                                      ├→ Liturgie (riskant)
                                      └→ Liturgie-Räuber bekämpfen
                                             ↓
                          Minenlaser → Routenader → freie Bergung → Sternenwerk → Veloria
```

Der aktuelle spielbare Prototyp enthält:

- direkte Schiffssteuerung mit sanfter Trägheit, Ausrollverhalten und Antriebs-VFX – per Touchstick oder Maus; zwei Finger zoomen auf mobilen Karten frei hinein und heraus
- eine klar geschichtete Expeditionskarte: atmosphärischer Hintergrund, reduzierte unbekannte Echos und eindeutig beschriftete, antippbare Fundorte
- Scans mit Kurssetzen direkt auf einen bestätigten Fundort sowie allgemeine Richtungshinweise mit Ressource, Menge, Entfernung, Risiko und benötigtem Werkzeug
- ein sichtbares, sanft pulsierendes Xenogate: Nach Routenkern und Bau des funktionalen Sternenwerks freiwillig anfliegen und **Veloria Rift** erkunden
- sieben freigestellte ImageGen-Storyassets für den ersten Handlungsbogen: versiegeltes und aktiviertes Xenogate, Aschenplünderer, Routenreliquie, Mönchslaterne, Schneideliturgie und Routenader
- einen geführten ersten 10-Minuten-Loop mit früher echter Wahl: nahes Wrack sicher bergen und heimkehren oder den sichtbaren Glutkutter bereits im ersten Einsatz freiwillig stellen; danach Hangar errichten, Frachtrücken kaufen und in der zweiten Schicht zwischen sicherem Archiv, riskanter Anomalie und Kampfbeute wählen
- ein lebendiges Spielerschiff in Farhaven: sichtbarer Anflug, ruhiger Notdock-Schwebeflug, dezente Triebwerke, antippbarer Hangarzugang, echtes Andocken nach dem Hangarbau und sichtbare Entladung gesicherter Ressourcen
- eine zweite Expeditionsschicht mit echter Tempowahl: Mönchslaterne plus sicheres Wandererarchiv oder die schnellere Schneideliturgie gegen Hüllenschaden
- Schwarze Adern als klaren, aktiven Minenlaser-Fundort sowie einen optionalen, bewachten Plünderer-Cache
- Bergung, Abbau, Fracht und Rückkehr nach Farhaven: der kleine sichtbare Heimathafen am Startpunkt ist zugleich Rückkehrziel; Rückkehr richtet den Bug aus und fliegt schnell ein, Scans funktionieren auch während des manuellen Flugs
- einen optionalen, aktiven Aschenplünderer als ersten echten Gegner hinter einer Bonusbeute: Kampf bleibt vermeidbar; manuelle Salven funktionieren während des Flugs mit sichtbaren Waffen-VFX. Übungsdrohnen existieren nur noch im internen Test-Szenario, nicht im Spielsektor.
- wiederholbare freie Bergungsflüge mit erreichbaren Quellen für alle drei Ressourcen, einem flankierenden Glutkutter und einem schweren, umfliegbaren Reliquienwächter
- angekündigte Gegnerangriffe mit Aufladeanzeige, sichtbaren Feindprojektilen, Ausweichfenster und klarer Fluchtmöglichkeit; der nächste Gegner wird ohne zusätzlichen Tipp automatisch erfasst, während freies Feuern jederzeit möglich bleibt
- getrennte Waffenrhythmen für Breitseite, Rail-Lanze, Torpedo und Energiekugel mit sichtbaren Cooldowns, Hüllen- und Schadensanzeigen, eigenen VFX/SFX und Desktop-Hotkeys 1/2/3
- den optionalen Aschenkantor als besonderen Wächter: Kampf gegen Chorschild und Aschenchor oder eine kampflose Breitband-Scanlösung führen zum einzigartigen Kantorenherz
- Farhaven als direkte Stationsoberfläche vor einem ruhigen, warmen Weltraumhintergrund: Das gewählte Schiff liegt zunächst am sichtbaren Notdock des Kerns; der erste Hangar dockt später mit Bau- und Einflugmoment an die zusammenhängende Top-down-Station an
- klare Farhaven-Interaktion: Nur der nächste Ausbau erscheint als kühle Blaupause oder warme „baubereit“-Vorschau; gebaute Räume sind voll sichtbar, direkt antippbar und docken mit einer kurzen Bauanimation an
- drei dauerhafte Ressourcen mit eigenen ImageGen-Icons und vollständigen Namen: Legierungen, Daten und Relikte; dieselben Zeichen verbinden Fundorte, Fracht, Rückkehr und Ausbaupreise
- echte Funktionen für alle vier Level-1-Räume: Hangar erweitert Fracht, Scannerkapelle erhöht Reichweite, Reliktlabor dämpft Anomalieschaden und Sternenwerk öffnet Veloria
- eine Schiffswahl mit kleinen Startvorteilen sowie eine aufgeräumte Hangarwerkstatt: vier echte Einbauten (Frachtrücken, Minenlaser, Rail-Lanze, Torpedorack) stehen zuerst; Rumpfideen bleiben unveränderliche visuelle Studien
- getrennte, mobile Raumansichten für die Farhaven-Bereiche: Übersicht, kurzer Raumstatus, eine Hauptaktion
- persistente Ausbauten, Schiffsdaten, Fundprotokoll und laufende Expeditionen über `localStorage`; ein Reload setzt den Flug am letzten Ort fort
- strikte Frachtraumgrenzen und ein klarer Niederlagenzustand: Bei Hülle 0 wird das Schiff geborgen, ungesicherte Fracht geht verloren
- einen bestätigten **TEST**-Reset in der Kopfzeile, der den lokalen Entwicklerstand vollständig auf die Rumpfwahl zurücksetzt
- Touch-freundliche Querformat-PWA und taktische Pause

Der erste Sektor erzählt die **verlorene Versorgungsroute**: Reliquie, Pilgerlaterne, Archive und Routenader sind Teile derselben Spur; der Aschenplünderer bewacht optionale gestohlene Routenplatten. Exploration ist bewusst der Kern; Kampf ist kein Dauercombat-Loop. Flug kostet keine Energie: die sich schnell regenerierende **Systemladung** begrenzt nur Scanner, Minenlaser und Waffen. Veloria Rift besitzt inzwischen sechs fremde Funde, einen friedlichen Pilger, zwei optionale Wächter und drei eigene transparente Spielassets. Eine umfangreichere Fraktion und verzweigte Sektorhandlung bleiben der nächste Content-Ausbau.

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
src/domain/resources/    Gemeinsame Namen, Icons, Quellen und Verwendungshinweise
src/app/                 Save-Migration bis Profil v5 und Spielablauf
src/game/scenes/         Farhaven- und Expeditionsdarstellung
docs/planning/           Produkt- und Produktionsplanung
```
