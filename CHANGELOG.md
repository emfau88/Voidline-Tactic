# Changelog

Alle nachvollziehbaren Änderungen an Voidline: Farhaven werden hier chronologisch dokumentiert. Das Format orientiert sich an Keep a Changelog; Commit-IDs werden nach dem jeweiligen Meilenstein ergänzt.

## [Unreleased]

### Farhaven Pivot – 2026-08-24

#### Added

- geschlossener erster Spielbogen: Rumpfwahl → erstes Wrack → sichtbare Frachtübergabe → Hangar → erspielbarer Frachtrücken
- bestätigter TEST-Reset für den vollständigen lokalen Entwicklerstand
- freiwilliges Xenogate mit ruhiger Loop-Animation und eigener Veloria-Rift-Kartensonde mit drei fremden Signalen
- neuer aktiver Singleplayer-Loop: Außenposten → Expedition → Rückkehr → Ausbau
- Farhaven-Save v2 mit getrenntem Storage-Key
- erste Explorationsdomain für Energie, Frachtraum, Signale, Scan und Bergung
- antippbarer Greybox-Sektor Aschsaum I mit vier Echos
- sichtbarer Außenposten und erste Ausbauten für Hangar und Scanner
- direkter Flugstick links, Beschleunigung, Ausrollen und Triebwerks-VFX
- mehrbildschirmiger Sektor mit Follow-Kamera und erster Aschenpatrouille
- erster Feuerbutton mit Breitseitensalve in Reichweite
- zweite Expeditionsschicht nach dem Frachtrücken: Mönchslaterne als sicheres Relikt-Signal und Schneideliturgie als riskante Daten-Anomalie
- echter Minenlaser-Einbau, Schwarze Adern zum Abbauen und optionaler, bewachter Plünderer-Cache
- aktiver Aschenplünderer mit telegraphiertem Nahbereichsfeuer; alle bisherigen Dummies bleiben passiv
- Xenogate-Freischaltung nach drei Rückkehren und installiertem Minenlaser
- getrennte, kompakte Raumansichten für Farhaven-Bereiche und eine einklappbare Prototypen-Schublade in der Hangarwerkstatt
- direkte Dummy-Zielerfassung auf der Karte mit großen Zielzonen und klarer „Tippe zum Zielen“-Kennzeichnung
- Zwei-Finger-Pinch-Zoom für Expeditionen, mit begrenztem Zoom-Bereich für Mobile
- markierte Übungsdummies geben unabhängig von Manöverwinkel sofort Feuer frei; Positionswinkel bleiben eine Regel für echte Gegner
- kompakte Top-down-Farhaven-Bauplatte mit vier antippbaren Andockplätzen und einem transparenten, originalen Modul-Asset-Kit für Hangar, Scanner, Labor und Sternenwerk
- echte Alpha-Bereinigung für das Farhaven-Modul-Kit statt eingebranntem Checkerboard; Hangarwerkstatt erhält eine belastbare Schiffsvorschau als Fallback
- Feueraktionen lösen beim Drücken aus, damit der zweite Daumen während eines gehaltenen Flugsticks salven kann

#### Changed

- Fliegen und Kurssetzen verbrauchen keine Energie mehr; Systemladung regeneriert sich zügig und begrenzt nur aktive Systeme
- Aster Vale erhält beim Start zusätzliche Scanreichweite, Bramble einen zusätzlichen Frachtslot
- Schiffswerkstatt trennt den ersten echten, kostenpflichtigen Frachtrücken klar von den übrigen Komponenten-Prototypen
- sichtbarer Produktname von `Voidline Tactics` zu `Voidline: Farhaven`
- aktiver Runtime-Pfad von Fleet Corridors zu Farhaven umgestellt
- frühere Fleet-Corridors-Version lokal als `fleet-corridors-poc-2026-08-24` getaggt
- README, Roadmap und Game Vision auf den neuen Produktpfad ausgerichtet
- Expeditions-HUD auf eine schmale Kartenanzeige oben reduziert; Aktionen liegen im rechten Daumenbereich
- Farhaven-Raumdialoge auf Status plus eine Hauptaktion reduziert; das große Hangarbild ist aus dem Baufluss entfernt
- Werkstatt von `TESTWERFT` zu `WERKSTATT` umbenannt; echte Einbauten stehen vor rein visuellen Prototypen
- Expeditions-Startzoom von 0,95 auf 1,10 angehoben, damit echte Mobile-Viewports nicht unnötig weit herausgezoomt wirken
- die große statische Farhaven-Station wird nicht mehr geladen; gebaute Räume werden als konkrete Module direkt an die Kernplatte gesetzt

#### Deferred

- Combat bleibt bis zum bestandenen Explorations-Greybox-Gate außerhalb des aktiven Loops

### Map-first Mobile Battlefield — 2026-08-22

#### Added

- eigener 3600×2000-Flottenraum mit unverändertem Legacy-Combat-Space
- direktes Antippen einer Route zum Öffnen eines kompakten Gruppenbefehls
- temporäre Popover für Verstärkungen und Ansichtsoptionen
- E2E-Flächengate: weniger als 15 % persistentes HUD und maximal fünf sichtbare Start-Controls

#### Changed

- breite Korridorbänder, Junction-Wände, Segmentstriche und technische Großkreise durch drei feine Routenlinien ersetzt
- Objectives zu kleinen Anlagenmarkern reduziert; Capture-Bogen erscheint nur bei tatsächlichem Fortschritt
- Routengruppen-Pod nach dem Befehl auf ein 220×38-px-Status-Pill minimiert
- Schiffstelemetrie und Spezialfähigkeiten vollständig kontextuell gemacht
- Topbar auf Zeit, Versorgung und ein Ansichtsmenü reduziert; Pause/Live schweben separat
- Tutorial von einem großen Panel auf ein automatisch verschwindendes Ein-Zeilen-Pill reduziert

#### Validation

- 30 Unit-Tests, 18 Browser-Gates und Production Build grün
- 667×375 und 844×390 mit vollflächigem Canvas, getrennten Touchflächen und Pinch-Zoom geprüft
- neue README-Screenshots aus dem Map-first-Build reproduzierbar erfasst

### Small-mobile CI Layout Stabilization — 2026-08-22

- 667×375-Command-Pod gegen abweichende Linux-Fontmetriken auf ein festes, einzeiliges Kompaktraster begrenzt
- Höhen-Gate von unter 35 % auf unter 30 % des Viewports verschärft, statt den CI-Grenzwert an den Fehler anzupassen
- verborgenes Transfer-Control am kleinen Landscape-Breakpoint explizit aus dem Layoutfluss entfernt

### Fleet Corridors – Indirect Fleet Command — 2026-08-22

Meilenstein-Commits:

- `f79f605` – Fleet-Corridor-Audit und Pivot-Architektur
- `3656354` – Korridore, Haltungen, Navigation, Versorgung, Deployment und Strategie-KI
- `025cbc7` – aktive Mobile-Fleet-Szene, freie Kamera und Routengruppen-HUD
- `adbd6b2` – Validierung, Roadmap, aktuelle Screenshots und kanonische Produktdokumente

#### Added

- drei natürliche Raumkorridore mit zwei Junctions, Lane-Bindung und sichtbaren Routenflächen
- fünf indirekte Haltungen: Angriff, Breitseite, Halten, Abstand und Rückzug
- Upper Relay, Lower Shipyard/Nebel, Versorgung, Deploy-Cooldown und 7-Schiff-Limit
- rollenbasierte autonome Navigation/Zielwahl sowie strategische Gegnerreaktion
- freie persistente Kamera mit One-Finger-/Maus-Pan, Pinch-/Mausrad-Zoom und explizitem Flottenfokus
- kompaktes deutsches Mobile-HUD für autonome Routengruppen plus optionale Einzelschiff-Systeme
- kontextuelle Vier-Schritt-Einführung und makroorientierte Hilfe
- 11 Fleet-Unit-Tests, 100-Match-Balance-Batch und neue 18-Läufe-E2E-Suite
- kritische Strategie-/Balancebewertung mit Center-, Relay- und Shipyard-Runs

#### Changed

- aktiver Produktpfad von direkter Joystick-Steuerung auf indirektes Makro-Management umgestellt
- Haltungen gelten für alle eigenen Schiffe der gewählten Route; Einzelwahl ist sekundär
- Startmenü, Telemetrie und Begriffe auf Fleet Corridors und verständliche deutsche Sprache reduziert
- Weltkamera belegt den gesamten Viewport und kehrt nach Spielereingabe nicht automatisch zurück
- Command-Ship-Telemetrie zeigt Prozentwerte statt technisch wirkender vierstelliger Rohwerte
- README, Roadmap, Game Vision, Production Plan und Top-20-Hebel vollständig auf den Pivot aktualisiert

#### Validation

- 30 Unit-Tests, 18 Browser-Gates und Production Build grün
- 100/100 Simulationen abgeschlossen; Median 204 s, P90 297 s, erster Verlust 37 s
- dokumentierte offene Risiken: 84 % Spielersiege, zu effizienter Center Push und noch fehlendes Audio/VFX-Polish

### Full-field Mobile Combat HUD — 2026-08-22

#### Added

- getrennte runde Ability-Buttons mit klarer Größenhierarchie, dauerhaft sichtbaren Kosten/Cooldowns und radialem Cooldown-Fortschritt
- Layout-Regression gegen überlappende Ability-Touchflächen sowie für die maximal 50 px hohe Telemetrie

#### Changed

- die Weltkamera nutzt im Landscape die volle Höhe bis zum unteren Rand; es gibt keinen reservierten schwarzen Bottom-HUD-Streifen mehr
- Hülle, Schild und Energie aus der großen unteren Schiffskachel in ein 48-px-Telemetriepanel oben links verschoben
- Joystick und Kampfsysteme schweben getrennt über der Welt, ohne das Schlachtfeld zu verkleinern oder sich gegenseitig zu überdecken
- Aegis- und Vector-Layer ohne massive dunkle Verbindungsplatte neu gezeichnet; die Schiffshülle bleibt unter den getrennten Modulbauteilen sichtbar
- alle drei README-Screenshots erneut aus dem geprüften Mobile-Build erzeugt

### Visible Preflight Module and True 1v1 — 2026-08-22

#### Added

- verpflichtende Modulmontage vor dem ersten Kampf; Start bleibt vorher gesperrt
- Aegis-Emitter mit +12 Schild und Vector-Drive mit +10 Tempo sowie +12 % Drehrate
- eigenständige transparente SVG-Module mit identischer Darstellung in Starterkarte und Phaser-Schiffscontainer
- Combat-/DOM-Diagnose für Startermodul und tatsächliche Schiffszahl
- Unit-Regression für beide Startermodule sowie Mobile-/Desktop-E2E für Montage und sichtbaren Layer

#### Changed

- „Erster Kontakt“ von 2v2 auf echtes 1v1 reduziert: nur gewähltes Schiff gegen den schwächeren Cinder Scout
- Eskorte samt fünfter HUD-Aktion aus Mission 1 entfernt; das Solo-Layout nutzt vier getrennte Kampfsysteme
- Missionsbriefing, Startstatus, Hilfe, Screenshots, README und Roadmap an den echten Prologstand angepasst
- Unit-Suite von 18 auf 19 Tests erweitert; weiterhin 24 Browserläufe auf zwei Mobilegrößen und Desktop

### Prologue-first Product Direction — 2026-08-22

#### Designed

- Einstieg als Wahl aus zwei kleinen Starterhüllen statt sofortiger großer Flotte
- genau zwei sichtbare Montageschritte vor Mission 1: Waffe und Support-Modul
- 1-gegen-1-Kalibrierungsflug, danach Salvage, Modulbelohnung und erneuter Refit
- schrittweise Einführung von HUD, Eskorte und Objectives über die ersten drei Missionen
- bestehende Cruiser-/Frigate-Schiffe als spätere sichtbare Freischaltungen eingeordnet
- datengetriebenes Layer-/Socket-Modell für Hull, Damage, Weapons, Engines, Emissives und Shields festgelegt
- Foozle „Void – Main Ship 1.0“ samt CC0-Readme und modularen 48×48-/Spritesheet-Assets als Struktur- und Animationsreferenz geprüft; Produktionsstil bleibt original
- Roadmap, Game Vision, Production Plan und Top-20-Hebel auf den persönlichen Prolog-Loop ausgerichtet

### Mobile Battlefield-first HUD — 2026-08-22

Meilenstein-Commit:

- `17218da` – kompakter Mobile-HUD, tolerante Zielerfassung und kamerareservierte Spielfläche

#### Added

- 667×375 als zweites verbindliches Mobile-Landscape-Profil neben 844×390
- Layout-Gate für mindestens 68 % freie Spielfeldhöhe, 64-px-Joystick und 44-px-Aktionsziele
- mindestens 34 CSS-Pixel großer Ziel-Trefferradius unabhängig von Weltzoom und Schiffsklasse
- ZIEL-Button zum direkten Durchschalten aller lebenden Gegner zusätzlich zum Tap auf das Schiff
- visueller Kamera-Overscan für zentrierten Überblick ohne schwarze Randflächen

#### Changed

- Mobile-Topbar auf 34 px und Bottom-Dock auf 78 px verdichtet
- kontinuierlich freie Spielfeldhöhe von zuvor 43–47 % auf 69–72 % erhöht
- dormant ROUTE auf kleinen Landscape-Geräten aus dem sichtbaren Dock entfernt, technisch aber erhalten
- Kamera reserviert den HUD-Bereich und rahmt ohne markiertes Ziel automatisch den nächsten Gegner ein
- Qualitätsgate von 16 auf 24 Mobile-/Desktop-E2E-Läufe erweitert
- README-Screenshots vollständig mit dem Battlefield-first-HUD neu aufgenommen

### Landscape Campaign Slice — 2026-08-22

Meilenstein-Commits:

- `fb12d6e` – Landscape-Combat, größere Arena und erweiterte Touch-Kamera
- `60029d1` – gestaffelte filmische Broadside-Choreografie
- `a5bb610` – spielbarer Drei-Missionen-/Upgrade-Loop
- `06079b2` – strategische Capture-Ziele als verpflichtende Siegbedingung

#### Added

- 2400×1400-Schlachtfeld mit zwei unverzerrt komponierten Nebula-Hälften
- Landscape-first Mobile-Combat samt Portrait-Drehaufforderung
- Zwei-Finger-Zoom von 65–240 % mit gleichzeitiger Kartenverschiebung und verzögerter Rückkehr zum Formation-Follow
- einzelne Broadside-Bolts aus sichtbaren Hardpoints, Mündungsblitze, Rückstoß, Mikrotreffer, Schildringe und Hull-Splitter
- drei freischaltbare Missionen mit eskalierenden Verbänden und Elite-Cruiser
- einnehmbarer Relaispunkt und Werftpunkt mit begrenzter automatischer Drohnenproduktion für beide Teams
- Mission Results, einmaliges Salvage, Continue/Replay und vier persistente Upgrade-Entscheidungen
- versionierter Kampagnenstand in LocalStorage
- drei neue Unit-Tests für Mission/Upgrade-Skalierung, Capture/Reinforcement und siegrelevante strategische Ziele
- neuer Mobile-/Desktop-E2E-Flow für freigeschaltete Missionswahl und persistentes Loadout

#### Changed

- Mobile-Referenzviewport von 390×844 Portrait auf 844×390 Landscape umgestellt
- Waffenreichweiten, Torpedogeschwindigkeit, Feindabstände und Orbit-Radien auf die größere Arena abgestimmt
- Relay-/Shipyard-Missionen enden erst nach gegnerischer Ausschaltung und Sicherung des Missionsziels; verwaiste Feindwerften produzieren keine Verstärkung
- README-Galerie vollständig als Landscape-Abnahme neu aufgenommen
- Qualitätsgate auf 18 Unit-Tests und 16 Mobile-/Desktop-E2E-Läufe erweitert

### Mobile Joystick Experiment — 2026-08-22

Meilenstein-Commit:

- `06f9b51` – mobile Flaggschiff-Steuerung per persistentem Richtungs-Joystick

#### Added

- absoluter Touch-/Pointer-Joystick für den gewünschten Flaggschiff-Kurs
- persistenter Sollkurs, der nach dem Loslassen des Sticks aktiv bleibt
- Zwei-Daumen-Control-Deck mit Navigation links und Kampfsystemen rechts
- sichtbarer Sollkurs-Vektor und Anzeige von aktueller zu gewünschter Ausrichtung
- sanfte Vorhalte-Kamera mit näherem 135-%-Startzoom
- Diagnosekoordinaten für kameraunabhängige Mobile-/Desktop-Browsertests
- Unit-Test für Kurswechsel, Kursablösung und kontinuierliches Eindrehen nach dem Loslassen

#### Changed

- Mobile-HUD, Hilfe und Einstiegshinweis auf die experimentelle Joystick-Steuerung umgestellt
- README-Kampfscreenshots mit dem neuen Control-Deck, näherer Kamera und Zielzustand aktualisiert
- Qualitätsgate auf 15 Unit-Tests und 14 Mobile-/Desktop-E2E-Läufe erweitert

#### Dormant

- geglättete Kurszeichnung, Routendaten und Resolver bleiben im Projekt erhalten
- direkte Kurszeichnung ist im aktuellen Build gegen Eingaben gesperrt; der Routenbutton kennzeichnet den A/B-Test sichtbar als inaktiv

### Tactical Real-Time Pivot — 2026-08-22

Meilenstein-Commit:

- `e0bc84a` – langsame Echtzeit, taktische Pause und direkte Flaggschiff-Kontrolle

#### Added

- deterministische 30-Hz-Fixed-Step-Simulation mit kontinuierlicher Geschwindigkeit, Beschleunigung und begrenzter Drehrate
- geglättete direkte Kurszeichnung für das Flaggschiff auf Touch und Maus
- jederzeit verfügbare taktische Pause, ¼-Tempo und Live-Geschwindigkeit
- gemeinsames Fokusziel sowie vier Eskorte-Direktiven: Folgen, linke/rechte Flanke und Schutz
- halbautonome Eskorte und gegnerische Approach-/Orbit-KI
- automatische Mass-Driver-Breitseiten bei gültigem Seitenbogen
- manuelle Rift Lance mit sichtbarer Ladephase und brechbarer Feuerlösung
- physische Homing-Torpedos mit Position, Drehgeschwindigkeit, Lebenszeit und sichtbarer Reise
- manueller Shield Boost mit Sofortwiederherstellung, Schadensreduktion und Cooldown
- Diagnosezustände für reproduzierbare Browser-Tests von Zeit, Kurs und Projectiles
- sieben neue E2E-Szenarien auf Mobile und Desktop für Pause, Kurs, Ziel/Lance, Torpedo/Eskorte, Hilfe, Pinch und HiDPI
- neue Unit-Abdeckung für Echtzeit-Kinematik, Determinismus, Direktiven, Telegraph, Projectiles, Boost und Cover

#### Changed

- Kampf von WEGO/Command Beats auf langsame Echtzeit mit taktischer Pause umgestellt
- direkte Kontrolle auf ein Flaggschiff reduziert; Eskorte übernimmt Navigation und Standardkampf halbautonom
- Mobile-HUD auf sechs klare Aktionen und drei permanente Zeitsteuerungen umgebaut
- Kampfstartdistanzen verkürzt, damit der erste relevante Waffenkontakt schneller entsteht
- gegnerische Konturen und Marker für den dunklen Battlefield-Hintergrund verstärkt
- Schiffsschilde zeigen den aktiven Boost als helle zusätzliche Fläche
- README-Screenshots auf Live-Kampf und Tactical-Pause-/Telegraph-Zustand aktualisiert
- Game Vision, Roadmap, Production Plan und Top-20-Hebel vollständig auf Tactical Real-Time ausgerichtet

#### Removed

- AP, Turns, Command Beats, Plan-/Confirm-Phase und erzwungene Vorwärtsdrift
- separater Command-Beat-Gegnerresolver
- seedbarer Treffer-RNG; gültige Waffenlösungen bleiben deterministisch

### Command-Beat-Iteration — 2026-08-21 (historisch)

Meilenstein-Commit:

- `39e9513` – Command Beats, deterministisches Tempo-Balancing und Mobile-Pinch/HiDPI

### Added

- gemeinsamer Command-Beat-Resolver mit genau einem Befehl pro Schiff, projiziertem Board und reproduzierbaren Events
- vorab sichtbare Gegnerabsichten als rote Intent-Chips, Bewegungsrouten und Zielvektoren
- permanente Vorwärtsdrift aller überlebenden Schiffe nach jedem Beat
- regelrelevante Nebelzone mit 25 % Schadensreduktion und sichtbarer exakter Schadensprognose
- echte Zwei-Finger-Pinch-Geste um den Gestenmittelpunkt mit 80–180-%-Grenzen und Schutz vor Fehlkommandos
- bis zu 2× HiDPI-Canvas-Backbuffer samt automatischer Resize-Behandlung
- vier neue Unit-Tests für sichere Torpedos, Command-Drift, gebrochene Feuerlösungen und Nebel-Cover
- zwei zusätzliche Mobile-/Desktop-E2E-Szenarien für Command-Beat-Ausführung und Multi-Pointer-Pinch
- Vollbreiten-Mobile-Shell mit Safe-Area-Behandlung und dynamischem Phaser-Resize
- Browser-Fullscreen-Steuerung samt erklärtem Fallback für Plattformen ohne Web-Fullscreen
- fullscreen-fähiges Web-App-Manifest, Portrait-Ausrichtung, iOS-Standalone-Metadaten und originales App-Icon
- taktische 80–140-%-Zoomsteuerung über Touch-Buttons und Mausrad
- Startmenü mit Cruiser-/Frigate-Auswahl, Loadout-Darstellung und Refit-Vorschau
- spielwirksame Bulwark- und Vector-Drive-Flaggschiff-Module samt Unit-Test
- originale SVG-Aktionsicons und sichtbare Mount-Marker für vorhandene Schiffwaffen
- neuer README-Screenshot der Startschiff- und Refit-Oberfläche
- drei reproduzierbare 390×844-Mobile-Screenshots für Startschiffwahl, Gefechtsübersicht und gültige Zielprognose
- Capture-Skript und npm-Befehl zur konsistenten Aktualisierung der README-Galerie
- priorisierte Top-20-Gap-Analyse mit messbaren Abnahmekriterien für den Weg zum Mockup-Niveau
- Asset-Manifest mit Herkunfts-, Rechte-, Versions- und Abnahmestatus
- reproduzierbare Generationsspezifikation für den originalen Spieler-Cruiser-Art-Proof
- transparenter, originaler True-Top-down-Spieler-Cruiser als hochauflösende Quelle und optimierter Runtime-Export
- datenbezogene Engine-, Lance-, Torpedo- und Port-/Starboard-Broadside-Hardpoints
- zwei Unit Tests für rotierte und zielseitenabhängige Hardpoint-Transformationen
- reproduzierbare Asset-Spezifikationen für Spieler-Frigate, Gegner-Cruiser und Gegner-Destroyer
- originale True-Top-down-Source- und Runtime-Assets für Spieler-Frigate, Gegner-Cruiser und Gegner-Destroyer
- vollständige Presentation-Definitionen für alle vier Schiffe mit klassenspezifischen Größen und Hardpoints
- Unit-Test-Gate, das Runtime-Art, Engine- und Weapon-Ursprünge für die gesamte Flotte absichert
- reproduzierbare Generationsspezifikation für einen kontrastarmen 2:3-Nebula-Environment-Layer
- originaler Nebula-Source-Layer und 25-KB-Runtime-Export mit ruhigem taktischem Zentrum
- zwei deterministische, langsam driftende Sternlayer mit Reduced-Motion-Fallback
- sichtbarer und zugänglicher Game-Ready-Ladezustand für die wachsende Asset-Pipeline

### Changed

- Kampfablauf von vollständigen Wechselphasen auf kurze Planung plus gemeinsame Command-Beat-Ausführung umgestellt
- alle Waffen treffen deterministisch; Reichweite verändert den exakten Schaden statt einer versteckten Trefferchance
- Torpedos können weder zufällig verfehlen noch über einen unsichtbaren 18-%-Wurf abgefangen werden
- Effective Health um rund 30–40 % gesenkt, Waffenschaden angehoben, Waffen auf einen AP vereinheitlicht und passive Schildregeneration entfernt
- Gegner bleiben durch helle rote Outline, zusätzlichen Formmarker, Intent-Chip und aufgehellten Battlefield-Grade erkennbar
- taktischer Zoom von maximal 140 % auf 180 % erweitert und auf gestenfokussierte Kameraänderung umgestellt
- Nebula-Runtime von 512×768/25 KB auf 1024×1536/rund 100 KB aktualisiert; die niedrig aufgelöste Runtime 1 wurde entfernt
- README-Galerie, Spielanleitung, Status, Roadmap, Top-20-Analyse und Asset-Manifest auf den Command-Beat-Build aktualisiert
- Mobile-Shell nutzt die gesamte verfügbare Phone-Breite statt das 390:844-Verhältnis als CSS-Maximum zu erzwingen
- Combat-Kamera berechnet Viewport und Basiszoom aus der realen Gerätegröße
- HUD besitzt größere Typografie, deutlichere Zustände und vollständig sichtbare AP-/Energiekosten
- Startschiffwahl legt das initial aktive Flaggschiff und ein klassenspezifisches Modul fest
- README um aktuelle Spielbilder, verifizierten Live-Link und die Mockup-Gap-Analyse erweitert
- M4-Roadmap in grundlegende abgeschlossene VFX und noch ausstehendes Choreografie-/Audio-Polish aufgeteilt
- M4 – Originale Art und Combat Feel gestartet
- Selection- und Shield-Geometrie folgen der länglichen Cruiser-Silhouette
- Engine-Emissives pulsieren unabhängig von der Rumpftextur und kritischer Hull tönt das Schiff
- Lance, Broadside und Torpedo starten an echten Hardpoints; Shield-/Hull-Kontakt besitzt eine zusätzliche Ripple-Phase
- Reduced Motion deaktiviert nun auch Camera Shake
- kanonische Game Vision von der früheren Desktop-first-Annahme auf den 390×844-Mobile-Referenzviewport korrigiert
- opake Schachbrett-Entwürfe vor der Integration erkannt und durch technisch verifizierte Alpha-Exporte ersetzt
- Interaktionen bleiben bis zum vollständig gebundenen Phaser-/HUD-Ready-Signal deaktiviert
- Playwright wartet explizit auf Game Ready und verhindert dadurch frühe Mobile-Taps auf noch ungebundene Aktionen

## [0.1.0] – 2026-08-21

Meilenstein-Commits:

- `09b5acc` – Mobile-first Phaser-Fundament
- `5f5c3d6` – deterministischer Combat Core
- `255a7e9` – spielbarer Mobile-Greybox-Slice
- `a4fa320` – CI und GitHub-Pages-Deployment

### Added

- Mobile-first Phaser-4-/TypeScript-/Vite-Produktionsgrundlage
- reproduzierbar gepinnte Runtime-, Build- und Testabhängigkeiten
- Boot- und Combat-Szene im 390×844 Referenzviewport
- Vitest- und Playwright-Grundkonfiguration
- `ROADMAP.md` als lebender Projektstatus
- `CHANGELOG.md` als chronologische Änderungshistorie
- renderer-unabhängiger Combat Core in festen 1000×1500 World Units
- datengetriebene Definitionen für vier Schiffe und Broadside, Lance und Torpedo
- Commands und Events für Bewegung, Rotation, Angriffe, Schild und Rundenwechsel
- seedbarer Zufall für reproduzierbare Treffer- und Schadensauflösung
- gemeinsame Waffenvalidierung für Preview, Spieler und Gegner-KI
- sieben Unit Tests für Bewegung, Arcs, Kosten, Schaden, Determinismus und Phasen
- vollständig bedienbarer 2-gegen-2-Mobile-Kampf mit Auswahl, Bewegung und Facing
- Touch-optimierte Action Bar mit großen Zielen, Ressourcenanzeigen und klarer Bestätigung
- Reichweiten-, Treffer-, Schild- und Hull-Vorschau für alle drei Waffen
- animierter Gegnerzug mit derselben Regelbasis wie der Spieler
- prozedurale Greybox-Schiffe, Schlachtfeld, Schilde, Treffer-, Projektil- und Explosions-VFX
- Hilfe- und Ergebnisdialoge, deutsche Statusmeldungen und Reduced-Motion-Unterstützung
- vier Mobile-Chromium-E2E-Tests für Layout, Hilfe, Touch-Bewegung und Gegnerphase

### Changed

- Combat-Szene vom statischen Architekturbeweis zum durchgängig spielbaren Mobile-Slice ausgebaut
- Schiffszustände und Aktionsverfügbarkeit werden nach jedem Command direkt im HUD gespiegelt
- README auf den spielbaren Produktionsstand, Mobile-Steuerung und lokalen Entwickler-Workflow aktualisiert
- Produktionsplan durchgängig auf Mobile-first als primäre Layout- und Eingabestrategie geschärft

### Infrastructure

- GitHub-Pages-Workflow mit Typecheck, Unit Tests, Production Build und Mobile-/Desktop-E2E-Gate angelegt
- Live-Spiel-Link und Deployment-Status in die README aufgenommen
- erstes öffentliches Deployment in [GitHub Actions Run 1](https://github.com/emfau88/Voidline-Tactic/actions/runs/32506418474) erfolgreich gebaut, getestet und veröffentlicht
- Live-Build auf 390×844 visuell, funktional und ohne Console Errors abgenommen

## [0.0.1] – 2026-08-21

Commit: `6ce1172`

### Added

- zentrale Projekt-README
- Repository Audit, Production Plan und Art-/VFX-Richtung
- Hinweise zur Verwendung und rechtlichen Einordnung der Mockups

### Changed

- Vision nach `docs/design/` verschoben
- Konzeptbilder verständlich benannt und nach `docs/reference/mockups/` verschoben
- HTML-Prototyp v2 als aktuellen Interaction Spike eingeordnet
- HTML-Prototyp v1 archiviert
