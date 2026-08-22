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
- 80–180-%-Zoom über Buttons, Mausrad und echte Zwei-Finger-Geste um den Mittelpunkt
- bis zu 2× HiDPI-Canvas-Backbuffer und hochauflösende Environment-Runtime
- automatisches GitHub-Pages-Deployment mit Typecheck, Unit-, Build- und Browser-Gate

## M2 – Deterministischer Echtzeit-Combat-Core ✅

- feste 1000×1500 World Units und deterministischer 30-Hz-Fixed-Step
- kontinuierliche Position, Facing, Geschwindigkeit, Beschleunigung und begrenzte Drehrate
- datengetriebene Definitionen für vier Schiffe und drei Waffenfamilien
- Energie, Cooldowns, Hull, Shield, Armor, Shield-Boost und Nebelreduktion
- direkte Flaggschiff-Kurse, Fokusziel und vier Eskorte-Direktiven
- Auto-Breitseiten, aufladbare Lance und physische Homing-Torpedos
- halbautonome Formation sowie gegnerische Approach-/Orbit-KI auf derselben Regelbasis
- garantierte deterministische Treffer bei gültiger Lösung; keine Miss-/Intercept-Würfe
- 14 Unit-Tests für Kinematik, Waffen, Telegraph, Projectile, Cover und Hardpoints

## M3 – Spielbarer 2-gegen-2-Echtzeit-Slice ✅

- Cruiser-/Frigate-Auswahl mit spielwirksamer Flaggschiff-Doktrin
- direkte geglättete Kurszeichnung auf Touch und Maus
- Zielerfassung als gemeinsamer Fokus für Flaggschiff und Eskorte
- jederzeit verfügbare taktische Pause, ¼-Tempo und Live
- verständlicher Zwei-Reihen-HUD mit Status, Tempo, Energie, Cooldowns und Direktive
- deutlich hellere Feindmarkierung mit roter Kontur und Formmarker
- sichtbare Lance-Ladephase, physische Torpedos, Shield-Ripple und Hardpoint-Feuer
- taktischer Nebel mit 25 % Schadensreduktion
- Hilfe, Toasts, Ergebnisdialog, Restart und Reduced-Motion-Fallback
- sieben E2E-Flows auf Mobile und Desktop: Shell, Pause, Kurs, Lance, Torpedo/Eskorte, Hilfe und Pinch

## M3.5 – Design-Pivot von Command Beats zu Tactical Real-Time ✅

- Command-Beat-, AP-, Turn- und Seed-RNG-System vollständig aus der Runtime entfernt
- direkte Kontrolle auf das Flaggschiff konzentriert; Eskorte übernimmt Mikromanagement
- Standardfeuer automatisiert und Entscheidungslast auf drei manuelle Systeme reduziert
- Bewegung permanent wirksam gemacht: Kurs, Drehrate, Seitenbogen und Lade-Telegraph ändern Feuerlösungen laufend
- Anfangsdistanzen für einen schnellen ersten Kontakt reduziert
- Roadmap, Vision, Produktionsplan, README, Tests und Screenshots auf das neue Modell umgestellt

## M4 – Combat Feel und visuelle Produktionsreife 🚧

- ✅ vier originale, gut unterscheidbare Schiffssilhouetten mit vollständigen Hardpoints
- ✅ originales Nebula-Schlachtfeld und zwei subtile Sternlayer
- ✅ erster hochwertiger HUD-System-Pass mit eigenständigen Vektoricons
- ✅ klare Ziele, Route, Feuerbögen, Formation und Telegraph-Zustände
- ✅ drei reproduzierbare Mobile-Screenshots für README und Standabnahme
- 🚧 gestaffelte Waffen-Choreografien, VFX-Pooling und klassenspezifische Trefferreaktionen
- 🚧 Kamera-Fokus, kurzer Impact-Zoom und lesbares Action Framing
- ⏳ originale Audio-Busse, Varianten, Ducking und Mobile-Audio-Unlock
- ⏳ beschädigte Schiffszustände, Debris, Engine-Ausfall und bessere Zerstörungssequenz
- ⏳ kontextuelles 60-Sekunden-Onboarding statt ausschließlich statischer Hilfe
- ⏳ ein erster dokumentierter Fünf-Personen-Mobile-Playtest mit Zeit-/Fehlerdaten

### Abnahme M4

- fünf Erstspieler verstehen Kurs, Ziel, Pause und ein Spezialsystem ohne externe Erklärung
- erste bewusste Aktion in höchstens 20 Sekunden, erster Waffeneffekt in höchstens 35 Sekunden
- ein Kampf dauert im Median 3–5 Minuten und erzeugt mindestens drei relevante Kursentscheidungen
- stabile 60 FPS im Pixel-7-Profil, keine wachsenden VFX-Objektzahlen nach drei Restarts
- alle zentralen Zustände bleiben bei 390×844 und 200 % Browser-Textzoom bedienbar

## M5 – Reward, Shipyard und Persistenz ⏳

- Mission Results mit Credits, Salvage und klarer Leistungszusammenfassung
- drei kauf- und ausrüstbare Trade-off-Upgrades mit sichtbaren Hardpoint-Änderungen
- Waffenvarianten statt rein numerischer Upgrades
- versioniertes LocalStorage-Save mit Migration und Reset
- zweiter Encounter mit anderer taktischer Frage und ein Elite-Gegner
- vollständiger Menu → Combat → Results → Refit → Replay-Loop

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

Wir stehen nach **M3.5** am Beginn von **M4**. Der neue Kern ist funktional, deterministisch und browsergetestet; zur Qualität der Mockups fehlen vor allem audiovisuelle Reaktion, Kamera-Choreografie, Onboarding, taktische Encounter-Variation und der spielbare Refit-Loop.

Der nächste überprüfbare Meilenstein ist **M4.1 „Combat Feel + 60-Sekunden-Onboarding“**: Telegraph-Sprache vereinheitlichen, Weapon-/Impact-VFX vertiefen, Original-Audio integrieren, Kontext-Hinweise bauen und anschließend fünf echte Mobile-Erstspieler messen. Die genaue Reihenfolge und Abnahmekriterien stehen in den [Top-20-Hebeln](docs/planning/TOP_20_LEVERS.md).
