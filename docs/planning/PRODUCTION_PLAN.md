# Produktionsplan für den hochwertigen Vertical Slice

## Ergebnisdefinition

Der erste Produktions-Meilenstein ist eine vollständige Mission mit zwei Spieler- und zwei Gegnerschiffen, die ohne externe Erklärung verstanden und abgeschlossen werden kann. Combat, Reward und eine Upgrade-Entscheidung bilden einen durchgehenden Loop. Der Build läuft als statische Website, ist reproduzierbar getestet und besitzt originale, rechtlich saubere Art- und Audio-Assets.

Der bestehende HTML-Prototyp ist Referenz, nicht Codebasis.

## Technische Entscheidung

Empfohlen wird:

- **Phaser 4 + TypeScript** für Szenen, WebGL/Canvas-Fallback, Input, Tweens, Loader, Audio und 2D-Rendering
- **Vite** für Development Server und statischen Production Build
- **Vitest** für den renderer-unabhängigen Combat Core
- **Playwright** für komplette Missionspfade, Desktop-/Mobile-Layouts und visuelle Regression
- JSON/TypeScript-Content mit Schema-Validierung für Schiffe, Waffen, Module und Missionen

Phaser ist hier PixiJS vorzuziehen, weil Voidline nicht nur einen Renderer, sondern eine vollständige Spielstruktur mit Szenen, Asset Loading, Input, Audio und Zeitsteuerung benötigt. PixiJS wäre sinnvoll, wenn maximale Rendering-Kontrolle wichtiger wäre und diese Systeme bewusst selbst gebaut werden sollten. Die genaue Paketversion wird beim Setup fest gepinnt und regelmäßig, nicht automatisch, aktualisiert.

Offizielle Referenzen:

- [Phaser-Dokumentation](https://docs.phaser.io/)
- [Phaser Loader](https://docs.phaser.io/phaser/concepts/loader)
- [Vite Production Build](https://vite.dev/guide/build)
- [Vitest](https://vitest.dev/guide/)
- [Playwright Browser Projects](https://playwright.dev/docs/browsers)

## Zielarchitektur

```text
src/
  app/                 Bootstrap, Konfiguration, Szenenwechsel
  domain/combat/       pure Regeln, Commands, Events, seeded RNG
  domain/fleet/        Schiffe, Loadouts, Upgrades, Rewards
  content/             validierte Ship-/Weapon-/Mission-Definitionen
  game/scenes/         Boot, Combat, Results, Shipyard
  game/presentation/   Ship Views, Overlays, Camera, VFX, Audio
  ui/                  HUD und Meta-UI
  persistence/         Save-Schema, Migration, LocalStorage-Adapter
  platform/            Input, Settings, Quality/Accessibility
public/assets/
  atlases/ audio/ backgrounds/ fonts/ shaders/
tests/
  unit/ integration/ e2e/ visual/
tools/
  content-validation/ asset-manifest/
```

Der `domain`-Bereich kennt weder Phaser noch DOM. Aktionen werden als Commands ausgeführt und erzeugen Events. VFX und Audio reagieren auf Events; sie verändern niemals direkt Kampfwerte. So bleiben Replays, Tests, KI-Simulationen und später Save-Migrationen möglich.

## Phase 0 – Produkt-, IP- und Qualitätsfundament

**Ziel:** Eindeutige Definition dessen, was gebaut und was bewusst nicht gebaut wird.

Arbeit:

- Vision in ein kurzes Vertical-Slice-Backlog übersetzen
- eigenständige Fraktionsnamen, Embleme und Formensprache definieren
- Mockups auf UI-Hierarchie reduzieren; keine direkte Stilkopie
- Asset-Manifest und Rechtefelder festlegen
- 390×844 als primären Mobile-Referenzviewport und unterstützte Desktop-Breiten definieren
- Definition of Done, Performance- und Download-Budgets festlegen

Gate:

- 1 Mission, 4 Schiffe, 3 Waffen und 3 Upgrades sind verbindlich beschrieben
- jedes geplante Asset hat Owner, Format, Quelle und Abnahmekriterium
- Boarding, Officers, Crew-Roster und Kampagne bleiben außerhalb des Slice

## Phase 1 – Produktionssetup

**Ziel:** Jeder Commit ist baubar und prüfbar.

Arbeit:

- Phaser/TypeScript/Vite-Projekt erstellen
- Formatierung, Linting, Typecheck, Unit Tests und Production Build einrichten
- CI für `typecheck → test → build` anlegen
- Boot-/Preload-/Combat-Szene und responsive Scale-Strategie aufsetzen
- Asset-Manifest, Loading Screen, Fehlerzustand und Settings-Grundgerüst implementieren
- GitHub Pages oder vergleichbares statisches Preview-Deployment vorbereiten

Gate:

- frischer Checkout startet mit dokumentierten Befehlen
- Production Build läuft ohne Console-Fehler
- mindestens Chromium-Desktop und ein Mobile-Viewport werden automatisiert geöffnet

## Phase 2 – Deterministischer Combat Core

**Ziel:** Das Spiel ist als Regeln testbar, bevor es schön wird.

Arbeit:

- feste World Units unabhängig von Auflösung und Kamera
- Combat State, Ship State, Command Beats, AP und Energy
- Commands für Select, Move, Rotate, Broadside, Lance, Torpedo und Shield
- gemeinsame Validierung und Schadensberechnung für Spieler, KI und Preview
- deterministische Treffer-/Schadensauflösung, Combat Log und Replay-fähige Events
- Sieg/Niederlage, Reset und Save-Versionierung
- datengetriebene Definitionen für 4 Schiffe und 3 Waffen

Gate:

- gleiche Befehle ergeben exakt dasselbe Ergebnis
- Preview und tatsächlicher exakter Schaden verwenden dieselbe Formel
- Desktop- und Mobile-Viewport verändern weder Reichweite noch Schaden
- ungültige Commands verändern den State nicht

## Phase 3 – Lesbarer Greybox-Vertical-Slice

**Ziel:** Movement, Facing und Waffenidentität machen bereits ohne finale Art Spaß.

Arbeit:

- taktische Kamera, Auswahl und Hover/Touch-Zielgrößen
- Movement Range, gebogener Pfad, Ghost und Facing-Griff
- klar getrennte Front-/Port-/Starboard-Arcs
- Target Preview mit exaktem Shield-/Hull-Schaden, Cover und Kosten
- kurze Planungsbeats mit offenen Gegnerabsichten und gemeinsamer Ausführungsphase
- regelbasierte KI: angekündigte Zielwahl, gewünschte Waffenposition, Retreat/Shield bei Gefahr
- Tutorial als kontextuelle Hinweise statt Textwand

Gate:

- fünf neue Testspieler können ihr erstes Schiff bewegen, ausrichten und korrekt feuern
- mindestens 80 % schließen die Testmission ohne mündliche Erklärung ab
- ein gemeinsamer Ausführungsbeat mit vier Schiffen dauert im Standardfall höchstens etwa drei Sekunden oder ist beschleunigbar

## Phase 4 – Originale Art und Asset-Pipeline

**Ziel:** Ein konsistenter, eigenständiger In-Game-Look ersetzt alle Platzhalter.

Arbeit:

- Style Tiles und Silhouettenvergleich für beide Fraktionen
- vier finale Schiffssprites mit Emissive-, Tint- und Damage-Layern
- Hardpoints für Engines, Broadside, Lance und Torpedos als Daten
- Atlas-/Kompressionspipeline und automatische Asset-Manifest-Prüfung
- dreischichtiger Parallax-Hintergrund, Asteroiden und taktische Marker
- Nine-Slice-HUD, eigenes Iconset und lizenzierte Schriften
- tatsächlichen Spielzoom ständig als Abnahmeansicht verwenden

Gate:

- Klasse, Team und Facing sind in unter einer Sekunde erkennbar
- jedes Schiff bleibt bei Zielzoom und Bewegung klar lesbar
- keine ungeklärten oder aus Mockups ausgeschnittenen Assets im Build
- Initial-Download und Texturspeicher bleiben innerhalb des in Phase 0 gesetzten Budgets

## Phase 5 – VFX, Audio und Combat Feel

**Ziel:** Jede Aktion besitzt Gewicht und eine unverwechselbare Signatur.

Arbeit:

- VFX-Event-Pipeline mit Object Pooling und Quality Presets
- Engine Glow/Trail, Selection, Target Lock und Movement Ghost
- vollständige Broadside-, Lance-, Torpedo-, Shield- und Destruction-Choreografie
- lokaler Shield Impact, Scorch/Damage Decals, Debris und Critical States
- Audio Busse für UI, Weapons, Impacts, Ambience und Music
- Variationen, Pitch-Streuung, Ducking, Lautstärke- und Mute-Einstellungen
- Reduced Motion, Shake-Intensität und Low-VFX-Modus

Gate:

- Waffentyp ist auch ohne UI eindeutig an Bild und Ton erkennbar
- Shield- und Hull-Treffer können nicht verwechselt werden
- VFX verdecken weder Ziel noch Arc oder Statusanzeige
- stabile Framerate ohne anwachsende Partikel-/Audio-Objekte nach mehreren Restarts

## Phase 6 – Reward, Shipyard und Persistenz

**Ziel:** Der Combat-Loop hat einen nachvollziehbaren Grund, erneut gespielt zu werden.

Arbeit:

- Results Screen mit Credits/Salvage und kurzem Combat Summary
- Shipyard mit drei echten Trade-off-Upgrades
- Power Budget und Loadout-Validierung nur soweit für den Slice nötig
- versioniertes LocalStorage-Save mit Migration und Reset
- Replay-Mission und ein zweiter Schwierigkeitszustand zum Prüfen der Upgrades

Gate:

- Upgrade verändert eine Entscheidung oder einen Build, nicht nur eine unsichtbare Zahl
- Reload erhält Flotte, Upgrade und Settings
- korrupter oder alter Save führt zu kontrollierter Recovery, nicht zu einem weißen Screen

## Phase 7 – Onboarding, Responsive UX und Accessibility

**Ziel:** Das Spiel ist verständlich und robust, nicht nur optisch attraktiv.

Arbeit:

- klare Mobile-Komposition und Touch-Flow zuerst, danach bewusste Tablet-/Desktop-Erweiterung
- vollständiger Touch-Flow plus gleichwertige Maus-/Tastatur-Bedienung
- Fokuszustände, zugängliche Namen, Live-Feedback und skalierbare Texte
- Farbblind-sichere Shapes/Icons, Reduced Motion und Browser-Zoom
- lokalisierbare Strings statt gemischter Sprache
- Tutorial- und Fehlertexte durch Nutzertests kürzen

Gate:

- keine abgeschnittenen Aktionen auf unterstützten Viewports
- alle Kernaktionen funktionieren ohne präzises Pixel-Tapping
- kritische Informationen sind nicht ausschließlich farbcodiert
- Mission ist mit Maus und Touch vollständig spielbar

## Phase 8 – Balancing und Release-Härtung

**Ziel:** Der Slice ist ein vorzeigbares Produktstück statt einer Tech-Demo.

Arbeit:

- Telemetrie nur nach bewusster Datenschutzentscheidung; lokal zunächst Combat Logs
- Balance-Simulationen für Beat-Zahl, Time-to-Kill, AP und Energy
- Unit-, Integration-, E2E- und Visual-Regression-Suite
- Chromium, Firefox, WebKit sowie mindestens ein Mobile-Chrome-/Mobile-Safari-Profil
- Restart-/Memory-Soak, Audio-Unlock, Tab-Visibility und Resize testen
- Credits, Lizenzen, Asset-Provenienz und Release Notes vervollständigen

Gate:

- 60 FPS auf normalem Desktop in der Referenzszene; definierter Mobile-Fallback
- keine Console Errors, kein State-Leak bei zehn Restarts
- vollständige Mission inklusive Reward und Upgrade ist automatisiert getestet
- externe Testspieler verstehen Ziel, Auswahl, Kosten, Facing und Waffenidentität

## Priorisierte Asset-Reihenfolge

1. Silhouetten und Größenverhältnis der vier Schiffe
2. Auswahl, Pfad, Ghost, Facing und Arcs
3. Hardpoints und Engine Emissives
4. Broadside, Lance, Torpedo und Shield Impact
5. Damage States und Destruction
6. taktisches HUD und Icons
7. Hintergrund/Parallax
8. Shipyard-Präsentation
9. erst nach erfolgreichem Slice: Officers/Crew-Art

Diese Reihenfolge verhindert, dass teure Meta-Screens entstehen, bevor das eigentliche Gefecht funktioniert.

## Teststrategie

| Ebene | Prüft |
|---|---|
| Unit / Vitest | Winkel, Reichweite, AP/Energy, Schaden, Shield, RNG, Save-Migration |
| Integration | vollständige Commands und Events über mehrere Command Beats |
| E2E / Playwright | Tutorial, Mission, Sieg/Niederlage, Upgrade, Reload, Responsive Layout |
| Visual Regression | HUD, Arcs, Target Preview, VFX-Schlüsselframes, Shipyard |
| Playtests | Verständlichkeit, Entscheidungsqualität, Tempo und visuelle Priorität |

## Realistische Planung

Für eine erfahrene Einzelperson ist ein wirklich polierter Vertical Slice mit originaler Art, Audio, Tests und Shipyard eher ein Projekt von ungefähr **10–14 Vollzeitwochen**, sofern Asset-Produktion teilweise parallel oder gezielt extern unterstützt wird. Ein kleiner Kern aus Entwicklung plus 2D-Art/Audio kann die Kalenderzeit reduzieren. Die vollständige 10–15-Missionen-Version ist danach ein eigener mehrmonatiger Produktionsabschnitt und sollte erst nach den Slice-Playtests geplant werden.

## Unmittelbar nächste drei Arbeitspakete

1. ✅ **Foundation:** Phaser/TypeScript/Vite, feste World Units und ein testbarer Combat-State.
2. ✅ **Greybox Gate:** Movement/Facing/Arcs plus dieselbe Waffenlogik für Preview, Spieler und KI.
3. ✅ **Delivery Gate:** CI-gesicherter GitHub-Pages-Build und verifizierter öffentlicher Spiel-Link.
4. ✅ **Art Proof:** ein finaler Spieler-Cruiser mit Engine, Shield Impact, Broadside und Lance als Qualitätsreferenz.
5. ✅ **Fleet Art:** die drei restlichen Schiffe mit klarer Klassen-/Fraktionssilhouette und vollständigen Hardpoints produzieren.
6. 🚧 **Presentation:** Parallax-Environment, taktisches HUD, vollständige VFX-Choreografien und Audio-Busse auf Flottenniveau bringen.
7. ✅ **Command-Beat-Pass:** offene Gegnerabsichten, deterministische Treffer, kürzere Time-to-Kill, Vorwärtsdrift, Nebel-Cover sowie Pinch-/HiDPI-Kamera integrieren.
8. 🚧 **Validation:** neuen Kampfablauf auf echten Phones testen, danach gekrümmte Routen, Action Framing und Trefferchoreografie ausbauen.
