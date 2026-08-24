# Voidline: Farhaven – Pivot- und Produktionsplan

Stand: 24. August 2026
Status: ⏳ geplant
Arbeitstitel: **Voidline: Farhaven**
Primärplattform: Mobile Browser/PWA im Querformat
Produktmodell: Singleplayer-Exploration mit persistentem Außenposten

## Verbindliche Pivot-Entscheidung

`Voidline: Farhaven` ersetzt `Voidline Tactics` als aktiven Produktpfad im bestehenden Repository. Es entsteht kein zweiter auswählbarer Spielmodus und keine dauerhaft parallel gepflegte Spielversion.

Der Fleet-Corridors-Proof-of-Concept wird vor dem Umbau durch die Git-Historie und einen eindeutig benannten Tag konserviert. Nützliche Technik wird in den neuen Produktpfad übernommen; Korridor-, Flotten- und Deployment-Systeme werden anschließend aus dem aktiven Build entfernt. Legacy-Code bleibt nur so lange im Arbeitsbaum, wie er für die Extraktion nachweislich gebraucht wird.

## High Concept

**Voidline: Farhaven ist ein mobile-first 2D-Space-Explorer, in dem der Spieler mit einem kleinen, aufrüstbaren Schiff unbekannte Sektoren untersucht, Signale entschlüsselt, Wracks birgt und wertvolle Funde zu einem wachsenden Außenposten zurückbringt.**

Der Spieler ist kein Flottenkommandant. Er steuert das Explorerschiff direkt, untersucht Möglichkeiten, verwaltet begrenzte Reserven und entscheidet, wann das Risiko einer weiteren Entdeckung größer als der mögliche Gewinn wird.

## Produktversprechen

Ein neuer Spieler versteht innerhalb der ersten Expedition:

1. Ein Scan macht unbekannte Signale schrittweise verständlich.
2. Jedes weitere Ziel kostet Reserven und erhöht das Rückkehrrisiko.
3. Nicht jedes Signal ist ein Kampf; Beobachtung und Vorbereitung zählen.
4. Nur sicher zurückgebrachte Fracht verbessert Schiff und Außenposten dauerhaft.
5. Neue Ausbauten eröffnen neue Handlungen, Signaltypen und Sektoren.
6. Farhaven ist ein warmer, sichtbarer Zufluchtsort zwischen kalten Expeditionen.

## Designpfeiler

### Neugier vor Kampf

Scannen, Annähern, Interpretieren, Bergen und freiwilliges Umkehren tragen den Hauptloop. Combat ist eine gelegentliche, meist erkennbare Gefahr und darf nicht zur zuverlässigsten Quelle aller wichtigen Ressourcen werden.

### Risiko ist eine informierte Entscheidung

Gefahr entsteht durch verbleibende Energie, Treibstoff, Hüllenzustand, Frachtraum, Umweltrisiken und unvollständige Informationen. Der Spieler soll vor einer riskanten Handlung Hinweise erhalten und nach einer Niederlage erklären können, welche Entscheidung dazu geführt hat.

### Heimkehr hat emotionales Gewicht

Der Außenposten ist keine abstrakte Shop-Liste. Neue Räume, Beleuchtung, Maschinen, Bewohner und kleine Alltagsdetails werden sichtbar. Eine erfolgreiche Rückkehr soll sich sicher, warm und erleichternd anfühlen.

### Ausbauten eröffnen Möglichkeiten

Progression besteht primär aus neuen Verben und Zugängen, nicht aus vielen kleinen Prozentboni. Ein besserer Scanner identifiziert neue Spuren; ein Bergungsmodul öffnet Wracks; ein verbesserter Sprungantrieb erreicht neue Sektoren.

### Mobile Tiefe durch klare Absichten

Der Spieler steuert die Reisebewegung direkt über einen großen Flugstick; Scan, Interaktion und Rückkehr liegen als klare Kontextaktionen daneben. Große Touch-Ziele, taktische Pause und konsequentes Autosave halten diese Steuerung mobil lesbar.

## Kernloop

```text
Außenposten besuchen und Schiff ausrüsten
        ↓
erreichbaren Sektor und Expeditionsziel wählen
        ↓
springen, navigieren und aktiv scannen
        ↓
Signale einschätzen und gezielt untersuchen
        ↓
bergen, abbauen, helfen, umgehen oder kämpfen
        ↓
weitermachen oder freiwillig zurückkehren
        ↓
Fracht sichern, Funde analysieren und Schäden reparieren
        ↓
Außenposten/Schiff ausbauen und weiter hinauskommen
```

## Zielstruktur einer Expedition

- Zieldauer: 8–12 Minuten
- mindestens 70 % der durchschnittlichen Spielzeit außerhalb von Combat
- drei bis sechs untersuchbare Signale pro Expedition
- mindestens eine relevante Entscheidung über Weiterflug oder Rückkehr
- vollständiges Autosave nach Sprung, Signalabschluss und Rückkehr
- jederzeitige Pause; Fortsetzung nach Browser-Unterbrechung
- Niederlage verliert überwiegend ungesicherte Fracht, nicht den dauerhaften Gesamtfortschritt

### Navigation

- Der linke oder rechte Flugstick steuert Richtung und Schub direkt; er ist die Primärsteuerung im Sektor.
- Die Kamera folgt dem Schiff weich und lässt Signale im umgebenden Raum lesbar.
- Das Schiff reagiert unmittelbar, aber mit sichtbarer Masse und klarer Schubrichtung.
- Ein expliziter Schiff-fokussieren-Button stellt die Orientierung wieder her.
- Gefahrenzonen, Scanreichweite und geschätzter Rückweg sind visuell lesbar.

### Scan- und Informationsmodell

Signale besitzen gestufte Information:

1. **Echo:** Position und Signalstärke sind grob bekannt.
2. **Klassifiziert:** Kategorie und wahrscheinliches Risiko werden sichtbar.
3. **Analysiert:** konkrete Handlungsmöglichkeiten und erwartbare Kosten sind bekannt.
4. **Untersucht:** Ergebnis, Fund und gegebenenfalls neue Folgeinformation werden ausgelöst.

Scanner-Upgrades verbessern nicht nur Reichweite, sondern Genauigkeit, Kategorien und neue Analysemöglichkeiten.

### Risiko und Rückkehr

Die erste Version verwendet vier gut lesbare Expeditionsgrenzen:

- Sprung-/Antriebsenergie
- Hüllenzustand
- Frachtraum
- Systembelastung durch Gefahren oder Schäden

Eine Rückkehr bleibt grundsätzlich möglich, kann bei kritischem Zustand aber teurer oder unsicherer werden. Ein Totalschaden führt zu Bergung des Schiffs, Verlust eines großen Teils der ungesicherten Fracht und Reparaturkosten. Bereits gesicherte Außenpostenfortschritte bleiben erhalten.

## Inhalte des ersten Vertical Slice

### Außenposten

Fünf sichtbare Einrichtungen mit je zwei Ausbaustufen:

| Einrichtung | Grundfunktion | Erste neue Möglichkeit |
|---|---|---|
| Hangar | Reparatur und Loadout | größerer Frachtraum oder zweiter Utility-Slot |
| Scanner | Signalauflösung | Risiken früher klassifizieren |
| Labor | Daten und Relikte analysieren | neue Technologien/Signalantworten |
| Raffinerie | Rohfunde verarbeiten | seltene Legierungen herstellen |
| Navigation | Sektorkarte und Sprungziele | zweiten, gefährlicheren Sektor öffnen |

### Ressourcen

Der Slice beschränkt sich auf drei dauerhafte Ressourcenfamilien:

- **Legierungen:** Reparatur, Konstruktion und robuste Schiffssysteme
- **Daten:** Forschung, Scanner und Navigation
- **Relikte:** seltene Systeme und große Freischaltungen

Energie und Frachtraum sind Expeditionsgrenzen, keine zusätzlichen Meta-Währungen. Weitere Währungen entstehen erst, wenn sie eine klar neue Entscheidung tragen.

### Sektoren und Signale

- zwei kompakte, halb-handgebaute Sektoren
- acht wiederverwendbare Signalereignisse
- zwei Wracktypen
- zwei Ressourcenfundstellen
- mindestens eine Anomalie mit mehreren Auflösungen
- zwei Gegnertypen mit vermeidbaren Begegnungen
- ein besonderes Fundstück, das sichtbar am Außenposten erscheint

### Schiff und Module

- ein aktives Explorerschiff mit klarer Silhouette
- sechs funktional unterschiedliche Module
- maximal drei gleichzeitig relevante Aktivaktionen
- sichtbare Modulmontage am Schiff, wenn die Darstellung lesbar bleibt
- kein Flottenmanagement im Vertical Slice

Beispielmodule:

- Breitbandscanner
- Bergungsgreifer
- verstärkter Frachtraum
- Aegis-Emitter
- Vector-Antrieb
- Täuschkörper-/Signaturmodul

## Combat-Modell

Der bestehende deterministische Combat-Core wird als Subsystem übernommen, aber auf Einzelship-Exploration zugeschnitten.

### Spielerentscheidungen

- Konfrontation annehmen oder ausweichen
- Abstand halten, durchbrechen oder Rückzug einleiten
- Energie auf Schild, Antrieb oder Waffen priorisieren
- eine begrenzte Spezialfähigkeit einsetzen
- im Notfall Fracht aufgeben, um Masse oder Signatur zu reduzieren

### Autonomie

- Standardwaffen feuern bei gültiger, nachvollziehbarer Lösung automatisch.
- Standardbewegung ist direkt steuerbar; spätere Autopilot-Module sind optionale Komfortsysteme.
- Gegner verwenden erkennbare Zustände und Telegraphs.
- Pause bleibt jederzeit verfügbar.
- Keine versteckten Miss-, Crit- oder Intercept-Würfe im ersten Slice.

### Combat-Gates

- erster Sektor kann vollständig ohne erzwungenen Kampf abgeschlossen werden
- feindliche Kontakte sind vor Kampfbeginn erkennbar
- mindestens eine Fluchtoption ist in normalen Begegnungen zuverlässig
- Combat liefert nicht exklusiv alle seltenen Progressionsressourcen
- durchschnittlicher Combat-Anteil bleibt unter 30 %

## Visuelle und emotionale Richtung

Arbeitsthese: **eine niedliche gotische Weltraumkapelle aus Schrott, Kerzenlicht und zu großen Maschinen.**

### Weltraum

- kaltes Navy, Cyan und Violett
- große ruhige Flächen und sparsame, bedeutungsvolle Signale
- alte sakrale Strukturen, Wracks und unverständliche Maschinen
- Gefahr durch Form, Bewegung und Ton statt permanenter roter Warnflächen

### Farhaven

- warmes Amber, Messing, Elfenbein und gedämpftes Cyan
- kleine Wartungsdrohnen, Lampen, Pflanzen und persönliche Gegenstände
- sichtbare Reparaturen und neue Anbauten nach Upgrades
- gemütliche Geräuschkulisse aus Generatorbrummen, Werkzeug und Funk
- verniedlichte, klare Formen ohne Slapstick oder Parodie

### Mobile-Lesbarkeit

- große Silhouetten vor Detailtexturen
- mindestens 44 × 44 CSS-Pixel pro Hauptaktion
- maximal vier persistente Hauptcontrols während der Expedition
- Detailinformationen erscheinen kontextuell und schließen nach einer Entscheidung
- keine Shipyard-Tabelle im Desktop-Stil; der Außenposten ist ein antippbares Diorama

## Technische Zielarchitektur

### Neue Domain-Bereiche

```text
src/domain/exploration/
  types.ts              Expedition, Signal, Cargo, Hazard und Result-Typen
  sectorContent.ts      handgebaute Sektoren und Content-Tabellen
  sectorGenerator.ts    reproduzierbare Verteilung aus einem Seed
  expeditionEngine.ts   Navigation, Reserven, Scan und Zustandsübergänge
  signalEngine.ts       Klassifikation, Untersuchung und Outcomes
  salvage.ts            Cargo, Bergung und Ressourcenfunde

src/domain/outpost/
  types.ts              Einrichtungen, Level, Freischaltungen und Kosten
  progression.ts        Ausbauvoraussetzungen und Technologiezugänge
  outpostEngine.ts      Reparatur, Verarbeitung und Ausbau-Commands

src/app/
  saveGame.ts           versionierter Save, Validierung und Autosave
  gameFlow.ts           Außenposten ↔ Expedition ↔ Auswertung
```

### Neue Szenen und UI

```text
src/game/scenes/OutpostScene.ts
src/game/scenes/ExpeditionScene.ts
src/game/controllers/ExpeditionCameraController.ts
src/game/presentation/SignalView.ts
src/game/presentation/OutpostView.ts
src/ui/ExpeditionHud.ts
src/ui/OutpostHud.ts
```

`BootScene` bleibt für Asset-Laden und Startvorbereitung zuständig. Reine Regeln bleiben außerhalb von Phaser und DOM, damit Expeditionen deterministisch getestet und simuliert werden können.

## Übernahme- und Rückbauplan

| Bestehender Bereich | Entscheidung | Bedingung |
|---|---|---|
| Phaser/Vite/PWA/CI | übernehmen | Baseline bleibt grün |
| Fixed-Step und Combat-Events | übernehmen/refaktorieren | keine Fleet-Abhängigkeiten in Exploration |
| ShipView und Schiffstexturen | zunächst übernehmen | späterer Art-Pass erlaubt Austausch |
| StrategicCameraController | nur als Grundlage für weiche Follow-Kamera nutzen | direkter Flugstick ist die aktive Steuerung |
| `campaign.ts` | durch Save v2 ersetzen | alter Storage-Key bleibt unangetastet |
| `FleetCombatScene` | aus aktivem Build entfernen | ExpeditionScene erreicht spielbaren Greybox-Stand |
| `src/domain/fleet/` | löschen nach Extraktion | keine aktiven Imports oder Tests mehr |
| FleetCommandHud/LaneView | löschen | neue Expedition-UI deckt aktive Flows ab |
| Fleet-Balance-Simulation | archivieren/entfernen | neuer Expeditions-Simulationsgate vorhanden |
| alte Screenshots/Reviews | als historische Dokumente markieren | nicht als aktueller Produktstand verlinken |

## Save-Strategie

Der neue Save verwendet einen neuen Key und eine neue Version. Der alte `voidline-campaign-v1`-Eintrag wird nicht überschrieben oder semantisch zwangsmigriert.

```text
FarhavenSaveV2
  resources
  outpostLevels
  unlockedTech
  installedModules
  discoveredSectors
  signalCodex
  currentExpedition?
  statistics
```

Save-Daten werden beim Laden validiert und mit sicheren Defaults ergänzt. Autosave erfolgt mindestens:

- vor und nach einem Sektorsprung
- nach einem abgeschlossenen Signalereignis
- nach Loadout-, Reparatur- oder Ausbauänderung
- bei erfolgreicher oder erzwungener Rückkehr
- beim Wechsel in den Hintergrund, soweit der Browser dies zuverlässig erlaubt

## Implementierungsphasen

### F0 – Bestand sichern und Produktpfad umstellen

- ⏳ aktuellen PoC mit Git-Tag `fleet-corridors-poc-2026-08-24` sichern
- ⏳ sichtbaren Titel auf `Voidline: Farhaven` umstellen
- ⏳ README, Vision, Roadmap und Changelog auf den neuen aktiven Pfad ausrichten
- ⏳ alten PoC in historischen Dokumenten eindeutig kennzeichnen
- ⏳ bestehende Unit- und Build-Baseline vor dem Umbau protokollieren

**Gate:** Der alte Build ist über den Tag reproduzierbar; Hauptbranch und App kommunizieren eindeutig Farhaven.

### F1 – Expeditions-Greybox ohne Combat

- ⏳ Pure-Domain-Typen und deterministischen Expedition-State erstellen
- ⏳ einen handgebauten Testsektor mit reproduzierbarer Signalverteilung anlegen
- ✅ direkter Flugstick, Schiffsfokus, Scanimpuls und erste Signalstufen implementieren
- ⏳ Energie, Hülle, Frachtraum und freiwillige Rückkehr abbilden
- ⏳ mindestens vier Signalereignisse mit unterschiedlichen Entscheidungen bauen
- ⏳ Unit-Tests für Scan, Kosten, Cargo, Rückkehr und Seed-Reproduzierbarkeit

**Gate:** Eine vollständige 5–8-Minuten-Expedition macht ohne Kampf verständlich Spaß und erzeugt mindestens eine echte Umkehrentscheidung.

### F2 – Persistenter Außenposten

- ⏳ Save v2 mit Validierung und Autosave einführen
- ⏳ OutpostScene als antippbares Diorama umsetzen
- ⏳ Hangar, Scanner, Labor, Raffinerie und Navigation funktional anbinden
- ⏳ Rückkehrauswertung, Reparatur und Ressourcensicherung integrieren
- ⏳ erste Upgrades öffnen neue Handlungen im nächsten Flug

**Gate:** `Außenposten → Expedition → Rückkehr → Ausbau → verbesserte Expedition` funktioniert nach Reload ohne verlorenen Fortschritt.

### F3 – Vollständiger Exploration-Content-Loop

- ⏳ zweiten Sektor und weitere vier Signalereignisse ergänzen
- ⏳ Wrackbergung, Ressourcenabbau, Anomalie und Hilferuf differenzieren
- ⏳ Scanqualität und Risikoindikatoren verständlich machen
- ⏳ Cargo-Entscheidungen und besondere sichtbare Fundstücke einführen
- ⏳ Progression auf 30–45 Minuten abstimmen

**Gate:** Testspieler können Signale unterscheiden, eine bewusste Route planen und den Wert eines Außenposten-Upgrades im nächsten Flug benennen.

### F4 – Gelegentlichen Combat integrieren

- ⏳ Combat-Core von Fleet-Annahmen entkoppeln
- ⏳ zwei Gegnertypen, Telegraphs, Flucht und Energiepriorisierung integrieren
- ⏳ Aegis-/Vector-Modul als Exploration-/Combat-Hybride ausarbeiten
- ⏳ Kampfbeute gegen friedliche/technische Fundwege balancieren
- ⏳ Niederlage, Bergung und Reparaturkosten implementieren

**Gate:** Der erste Sektor bleibt ohne Zwangskampf abschließbar; Combat beansprucht im Median weniger als 30 % einer Expedition.

### F5 – Eigenständiger Art-, Audio- und Cozy-Pass

- ⏳ Farhaven-Diorama mit zwei sichtbaren Ausbauzuständen pro Einrichtung
- ⏳ vereinfachte grimdark-gothic Schiffs- und Wracksilhouetten
- ⏳ Scan-, Bergungs-, Abbau- und Anomalie-VFX
- ⏳ getrennte Audioidentität für kalte Expedition und warme Heimkehr
- ⏳ UI-Dichte, Typografie und Farben auf kleine Mobile-Displays abstimmen
- ⏳ Performance-Pooling und Drei-Expeditionen-Memory-Soak

**Gate:** Außenposten und Weltraum sind ohne Text emotional unterscheidbar; 60 FPS bleiben auf Pixel-7-Klasse stabil.

### F6 – Vertical-Slice-Validierung

- ⏳ fünf externe Mobile-Erstspieler mit Zeit-, Fehler- und Verständnisprotokoll
- ⏳ 844 × 390, 667 × 375 und Desktop als E2E-Matrix
- ⏳ Save/Reload, Hintergrundwechsel und PWA-Start testen
- ⏳ Expeditionsdauer, Combat-Anteil, Rückkehrrate und Upgrade-Nutzung messen
- ⏳ README-Screenshots, Changelog, Credits und Asset-Manifest aktualisieren

**Gate:** Der komplette Slice ist verständlich, technisch stabil und zeigt den angestrebten Loop ohne Erklärung von außen.

## Messbare Qualitätsziele

- erster Scan innerhalb von 20 Sekunden
- erstes klassifiziertes Signal innerhalb von 60 Sekunden
- erste freiwillige Rückkehr innerhalb von 12 Minuten
- 70–85 % der Expeditionszeit außerhalb von Combat
- mindestens 80 % der Testspieler verstehen ungesicherte versus gesicherte Fracht
- mindestens 70 % können ihre Rückkehrentscheidung konkret begründen
- keine Hauptaktion kleiner als 44 × 44 CSS-Pixel
- keine HUD-Überlagerung bei 844 × 390 und 667 × 375
- Reload setzt die letzte sichere Spielsituation korrekt fort
- stabile 60 FPS bei allen Vertical-Slice-Inhalten auf Pixel-7-Klasse

## Teststrategie

### Unit-Tests

- deterministische Sektorgenerierung
- Scanreichweite und Informationsstufen
- Energie-/Reisekosten und sichere Rückkehrprognose
- Cargo-Limits und Fundpriorisierung
- Signal-Outcomes und Voraussetzungen
- Ausbaukosten und Unlock-Abhängigkeiten
- Save-Validierung und Default-Ergänzung
- Combat-Flucht, Schaden und Bergungsfolgen

### Simulation

- 100 Expeditionen pro Sektor-Seed-Gruppe
- Abschluss-, Rückkehr- und Verlustquote
- Ressourcen pro Minute nach Fundkategorie
- Anteil friedlicher, riskanter und feindlicher Begegnungen
- Sackgassenprüfung: kein Save darf durch Ressourcenmangel unspielbar werden
- Progressionszeit bis Scanner-, Hangar- und Navigationsausbau

### E2E

- neuer Spielstand bis erste Rückkehr
- Ausbau und nachweisbare Wirkung in Folgeexpedition
- freiwilliger Rückzug mit gesicherter Fracht
- Niederlage mit teilweisem Frachtverlust
- Pause, direkter Flugstick, Scan, Interaktion und Fokus
- Reload während Außenposten und Expedition
- Mobile-Safe-Areas, Fullscreen und PWA-Start

## Hauptrisiken und Gegenmaßnahmen

| Risiko | Gegenmaßnahme/Gate |
|---|---|
| Exploration fühlt sich wie leeres Fliegen an | kurze Abstände, gestufte Information und mindestens eine Entscheidung pro Signal |
| Scan wird zum wiederholten Pflichtknopf | Scan verändert Information, Position oder Kosten; kein bedeutungsloses Dauer-Pulsieren |
| Combat verdrängt Exploration | erster Greybox-Gate ausdrücklich ohne Combat; Zeitanteil später messen |
| Meta-Progression wird zur Zahlenwand | maximal drei Ressourcen und fünf Einrichtungen im Slice |
| Zufall wirkt unfair | Seed-Reproduzierbarkeit, Risikoindikatoren und keine harten Ergebnisse ohne Vorzeichen |
| Cozy zerstört die Bedrohung | Wärme auf Farhaven konzentrieren; Sektoren bleiben still und fremd |
| Grimdark wird unlesbar oder monoton | klare Silhouetten, warme Akzente und sparsame Detaildichte |
| Legacy-Code erzeugt zwei Architekturen | Fleet-Code nach abgeschlossener Extraktion konsequent aus dem aktiven Baum entfernen |
| Mobile-Unterbrechung verliert Fortschritt | transaktionale Autosaves an jedem relevanten Zustandsübergang |
| Scene-Monolith entsteht erneut | Regeln in Pure-Domain, Darstellung/Controller/HUD getrennt halten |

## Bewusste Scope-Grenzen

Vor einem validierten Vertical Slice entstehen nicht:

- Multiplayer oder Onlinekonten
- offene/prozedurale Galaxie ohne handgebautes Content-Gerüst
- Flotten- oder Crewmanagement
- Boarding als eigenes Minispiel
- komplexe Twin-Stick-Shooter-Steuerung mit separatem Zielen
- mehr als ein aktives Spielerschiff
- komplexe Crafting-Ketten oder mehr als drei Meta-Ressourcen
- tägliche Aufgaben, Wartezeiten, Premium-Währungen oder Live-Service-Systeme
- Portrait-Modus; der erste Slice bleibt `landscape-primary`

## Definition of Done für den Pivot

Der Pivot ist abgeschlossen, wenn:

1. der aktive Build ausschließlich den Farhaven-Loop präsentiert,
2. der Fleet-Corridors-PoC über Git reproduzierbar, aber nicht mehr Teil des Runtime-Pfads ist,
3. eine vollständige Expedition mit freiwilliger Rückkehr spielbar ist,
4. ein gesicherter Fund einen sichtbaren Außenposten- oder Schiffsausbau ermöglicht,
5. dieser Ausbau die nächste Expedition funktional verändert,
6. Exploration messbar wichtiger als Combat bleibt,
7. Save/Reload, Mobile-Layout, Tests und Production-Build grün sind,
8. README, Vision, Roadmap, Changelog und Asset-Manifest den tatsächlichen Stand wiedergeben.

## Nächster konkreter Arbeitsschritt

Mit **F0** beginnen: PoC taggen, Produktname und kanonische Dokumente umstellen und danach eine minimale `ExpeditionState`-Domain samt erstem Greybox-Sektor bauen. Combat bleibt bis zum bestandenen F1-Gate bewusst aus dem neuen aktiven Loop heraus.
