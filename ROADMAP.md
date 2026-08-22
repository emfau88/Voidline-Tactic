# Roadmap

Diese Datei ist der aktuelle, überprüfbare Projektstatus. Erledigte Meilensteine bleiben sichtbar; einzelne Änderungen stehen chronologisch im [Changelog](CHANGELOG.md).

Stand: 22. August 2026

## Statuslegende

- ✅ abgeschlossen
- 🚧 in Arbeit
- ⏳ geplant
- ⛔ bewusst außerhalb des aktuellen Scopes

## M0 – Repository und Produktgrundlage ✅

- Repository analysiert, geordnet und von den isolierten HTML-Spikes getrennt
- Vision, Audit, Produktionsplan, Art-/VFX-Richtung und Asset-Provenienz dokumentiert
- GitHub Pages, CI, Unit- und Browser-Tests als verbindliche Qualitätsgates eingerichtet

## M1 – Mobile-first Produktionsfundament ✅

- Phaser 4, TypeScript, Vite und Vitest reproduzierbar gepinnt
- Vollbreiten-Shell mit Safe Areas statt einer fest eingeschlossenen Gerätesäule
- Browser-Fullscreen, installierbares Web-App-Manifest und Plattform-Fallback
- 65–240-%-Zoom über Buttons, Mausrad und echte Zwei-Finger-Geste um den Mittelpunkt
- Landscape-first Combat mit Portrait-Drehaufforderung und gleichzeitiger Zwei-Finger-Kartenverschiebung
- Mobile-Full-field-Layout mit rund 90 % Kamerahöhe unter der Topbar und ohne reservierten Bottom-HUD-Streifen
- bis zu 2× HiDPI-Canvas-Backbuffer und hochauflösende Environment-Runtime
- automatisches GitHub-Pages-Deployment mit Typecheck, Unit-, Build- und Browser-Gate

## M2 – Deterministischer Echtzeit-Combat-Core ✅

- feste 2400×1400 World Units und deterministischer 30-Hz-Fixed-Step
- kontinuierliche Position, Facing, Geschwindigkeit, Beschleunigung und begrenzte Drehrate
- datengetriebene Definitionen für vier Schiffe und drei Waffenfamilien
- Energie, Cooldowns, Hull, Shield, Armor, Shield-Boost und Nebelreduktion
- persistenter Flaggschiff-Sollkurs, Routendaten, Fokusziel und vier Eskorte-Direktiven
- Auto-Breitseiten, aufladbare Lance und physische Homing-Torpedos
- halbautonome Formation sowie gegnerische Approach-/Orbit-KI auf derselben Regelbasis
- garantierte deterministische Treffer bei gültiger Lösung; keine Miss-/Intercept-Würfe
- 19 Unit-Tests für Kinematik, Joystick-Sollkurs, Startmodule, Missionssieg, Capture, Verstärkung, Waffen, Cover und Hardpoints

## M3 – Spielbarer Echtzeit-Kampfkern ✅

- Cruiser-/Frigate-Auswahl mit spielwirksamer Flaggschiff-Doktrin
- direkter persistenter Sollkurs per Touch-/Maus-Joystick; frühere Kurszeichnung bleibt dormant erhalten
- Zielerfassung als gemeinsamer Fokus für Flaggschiff und Eskorte
- jederzeit verfügbare taktische Pause, ¼-Tempo und Live
- kompakter Fünf-Aktionen-Dock mit Status, Tempo, Energie, Cooldowns und Direktive; dormant Route belegt auf Phones keinen Platz
- direkte Gegner-Taps mit mindestens 34 CSS-Pixeln tolerantem Trefferradius und ZIEL-Button zum Durchschalten
- deutlich hellere Feindmarkierung mit roter Kontur und Formmarker
- sichtbare Lance-Ladephase, physische Torpedos, Shield-Ripple und Hardpoint-Feuer
- taktischer Nebel mit 25 % Schadensreduktion
- Hilfe, Toasts, Ergebnisdialog, Restart und Reduced-Motion-Fallback
- acht E2E-Flows auf zwei Mobile-Landscape-Größen und Desktop: Shell, Kampagne, Pause/Joystick, Ziel/Lance, Torpedo/Eskorte, Hilfe und Pinch

## M3.5 – Design-Pivot von Command Beats zu Tactical Real-Time ✅

- Command-Beat-, AP-, Turn- und Seed-RNG-System vollständig aus der Runtime entfernt
- direkte Kontrolle auf das Flaggschiff konzentriert; Eskorte übernimmt Mikromanagement
- Standardfeuer automatisiert und Entscheidungslast auf drei manuelle Systeme reduziert
- Bewegung permanent wirksam gemacht: Kurs, Drehrate, Seitenbogen und Lade-Telegraph ändern Feuerlösungen laufend
- Anfangsdistanzen für einen schnellen ersten Kontakt reduziert
- Roadmap, Vision, Produktionsplan, README, Tests und Screenshots auf das neue Modell umgestellt

## M3.6 – Joystick-Steuerung und Control Decision ✅

- absoluter Richtungs-Joystick setzt einen persistenten Sollkurs statt einer kurzen Bewegungsaktion
- Loslassen hält den Sollkurs; Masse, Beschleunigung und Drehrate bleiben spielwirksam
- Zwei-Daumen-HUD mit Steuerung links und Kampfsystemen rechts
- aktuelle und gewünschte Ausrichtung sowie ein heller Richtungsvektor im Spielfeld
- Nutzerfeedback bestätigt den Joystick klar als primäre Echtzeitsteuerung
- 125-%-Startkamera mit sanftem Vorhaltepunkt in Fahrtrichtung
- Kurszeichnung technisch erhalten, im HUD klar als inaktiv markiert und gegen Eingaben gesperrt
- 19 Unit-Tests und 24 Mobile-/Desktop-E2E-Läufe grün
- neue reproduzierbare README-Screenshots für Joystick, Zielwahl und Telegraph

## M3.7 – Prolog und sichtbarer modularer Refit 🚧

- ✅ verpflichtende Preflight-Montage; Mission 1 startet ohne Modul nicht
- ✅ Aegis-Emitter (+12 Schild) und Vector-Drive (+10 Tempo, +12 % Drehen) als echte Trade-offs
- ✅ beide Module als transparente Layer im Menü und auf dem Flaggschiff im Gefecht sichtbar
- ✅ 1-gegen-1-Kalibrierungsflug als Mission 1: gewähltes Schiff gegen einen schwächeren Cinder Scout
- ✅ Eskorte samt HUD-Aktion in Mission 1 entfernt und erst in späteren Missionen aktiviert
- ⏳ zwei kleine Starterhüllen mit klarer Rolle statt der aktuellen Übergangs-Cruiser/-Frigate
- ⏳ zweiter sichtbarer Montageschritt vor dem Kampf: eine echte Waffenwahl
- ⏳ Salvage, geborgenes Modul und erneuter sichtbarer Refit direkt nach dem ersten Sieg
- ⏳ Vorschau auf die nächsten zwei bis drei Hüllen; bestehende große Schiffe werden spätere Freischaltungen
- ✅ Foozle „Void – Main Ship“ (CC0) als Struktur-/Animationsreferenz geprüft; Produktionskunst bleibt original und hochauflösend
- verbindliches Detailkonzept: [Prolog und modulare Schiffe](docs/design/PROLOGUE_AND_MODULAR_SHIPS.md)

## M4 – Combat Feel und visuelle Produktionsreife 🚧

- ✅ vier originale, gut unterscheidbare Schiffssilhouetten mit vollständigen Hardpoints
- ✅ originales Nebula-Schlachtfeld und zwei subtile Sternlayer
- ✅ erster hochwertiger HUD-System-Pass mit eigenständigen Vektoricons
- ✅ Landscape-HUD, klare Ziele, Sollkurs, Feuerbögen, Formation und Telegraph-Zustände
- ✅ kompakter 34-px-Topbar und Full-field-Kamera ohne reservierte Bottom-Aussparung
- ✅ 48-px-Telemetrie oben links und organisch schwebende Ecksteuerung
- ✅ vier getrennte 46–68-px-Ability-Buttons mit klarer Priorität, Energiekosten und radialer Cooldownanzeige
- ✅ automatisches Browser-Gate verhindert überlappende Ability-Touchflächen auf dem kleinen 667×375-Profil
- ✅ zentrierter visueller Kamera-Overscan ohne schwarze Zoomflächen sowie Autoframing des nächsten Gegners
- ✅ größere Arena, längere Waffenreichweiten, Zwei-Finger-Pan und sanftes Follow-Framing
- ✅ erste gestaffelte Broadside-Produktionschoreografie von Hardpoint bis Impact
- ✅ drei reproduzierbare Mobile-Screenshots für README und Standabnahme
- 🚧 Lance-/Torpedo-Choreografie, VFX-Pooling und klassenspezifische Trefferreaktionen
- 🚧 Kamera-Fokus, kurzer Impact-Zoom und lesbares Action Framing
- ⏳ originale Audio-Busse, Varianten, Ducking und Mobile-Audio-Unlock
- ⏳ beschädigte Schiffszustände, Debris, Engine-Ausfall und bessere Zerstörungssequenz
- ⏳ kontextuelles 60-Sekunden-Onboarding statt ausschließlich statischer Hilfe
- ⏳ ein erster dokumentierter Fünf-Personen-Mobile-Playtest mit Zeit-/Fehlerdaten

### Abnahme M4

- fünf Erstspieler verstehen Joystick-Sollkurs, Ziel, Pause und ein Spezialsystem ohne externe Erklärung
- erste bewusste Aktion in höchstens 20 Sekunden, erster Waffeneffekt in höchstens 35 Sekunden
- ein Kampf dauert im Median 3–5 Minuten und erzeugt mindestens drei relevante Kursentscheidungen
- stabile 60 FPS im Pixel-7-Profil, keine wachsenden VFX-Objektzahlen nach drei Restarts
- alle zentralen Zustände bleiben bei 844×390 Landscape und 200 % Browser-Textzoom bedienbar

## M5 – Drei-Missionen-Loop, Reward und Persistenz 🚧

- ✅ drei freischaltbare Missionen mit eskalierender Feindzahl und Elite-Cruiser
- ✅ Relaispunkt in Mission 2 und eroberbare Drohnenwerft in Mission 3
- ✅ strategische Ziele sind siegrelevant; eine verwaiste Feindwerft produziert keine neuen Drohnen
- ✅ Mission Result, einmaliges Salvage, Upgrade-Wahl, Continue und Replay
- ✅ vier persistente Flaggschiff-/Eskorte-Upgrades in versioniertem LocalStorage
- 🚧 vollständige Leistungsmetriken und expliziter Save-Reset
- ⏳ sichtbare Hardpoint-/Emitter-Änderungen sowie echte Waffenvarianten statt überwiegend numerischer Upgrades
- 🚧 Missionskurve begonnen: Mission 1 ist 1v1; Mission 2/3 müssen noch zu 1v2 → erste Eskorte/Objective neu geordnet werden

## M6 – Vertical-Slice-Release ⏳

- Responsive-, Accessibility- und Browser-Matrix
- Visual Regression, Performance-Budget und Restart-/Memory-Soak
- externe Verständlichkeits- und Balance-Playtests
- finale Audio-/VFX-Mischung, Credits, Datenschutz-/Lizenzhinweise
- öffentlich markierter Vertical-Slice-Release

## Später / außerhalb des Slice ⛔

- Boarding-Minispiel
- Officers und detaillierte Crew
- vollständige Kampagne mit 10–15 Missionen
- Multiplayer, 3D, Open World und prozedurale Galaxie

## Aktuelle Position und nächster überprüfbarer Meilenstein

Wir stehen nach der bestätigten **Joystick-Control-Decision**, dem **Full-field Mobile-UX-Pass**, dem ersten **M4-Combat-Feel-Pass** und einem funktionalen **M5-Drei-Missionen-Loop**. Landscape, vollflächige Kamera, kompakte Telemetrie oben links, getrennte Ability-Buttons mit Cooldown-Ringen, tolerante Zielerfassung, große Arena, Missionen, Capture, Werft-Drohnen, Salvage und persistente Upgrades sind implementiert. Die erste M3.7-Stufe ist ebenfalls spielbar: sichtbares Startmodul vor dem Kampf und ein echtes 1v1. Kleine eigene Starterhüllen, Waffenmontage und erneuter sichtbarer Refit fehlen noch.

Der nächste überprüfbare Teilmeilenstein von **M3.7 „Prologue Loadout Slice“** ist die sichtbare Waffenmontage plus Reward→Refit nach dem gewonnenen 1v1. Danach werden die aktuellen großen Übergangsschiffe durch zwei kleine Starterhüllen ersetzt und Mission 2 neu geordnet. Die genaue Reihenfolge steht in den [Top-20-Hebeln](docs/planning/TOP_20_LEVERS.md).
