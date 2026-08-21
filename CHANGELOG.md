# Changelog

Alle nachvollziehbaren Änderungen an Voidline Tactics werden hier chronologisch dokumentiert. Das Format orientiert sich an Keep a Changelog; Commit-IDs werden nach dem jeweiligen Meilenstein ergänzt.

## [Unreleased]

### Added

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
