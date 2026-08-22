# Production Plan

Stand: 22. August 2026

Ziel: hochwertiger, verständlicher Mobile-Vertical-Slice in langsamer Echtzeit mit taktischer Pause

## 1. Produktionsprinzip

Jeder Schritt muss als spielbarer, deploybarer Build enden. Ein System gilt erst als fertig, wenn Regeln, Präsentation, Mobile-Bedienung, Tests und Dokumentation zusammenpassen.

Die Reihenfolge ist bewusst:

1. Kampf verstehen und fühlen
2. Kampf audiovisuell glaubwürdig machen
3. Ergebnis und Refit als motivierenden Loop schließen
4. Inhalt verbreitern
5. Release härten

Mehr Waffen, Schiffe oder Meta-Systeme helfen nicht, solange Auswahl, zwei sichtbare Montageschritte und der erste 1-gegen-1-Kampf nicht in den ersten sechs Minuten überzeugen.

## 2. Aktueller Architekturstand

```text
src/
  app/                 Bootstrap, Display, Startschiffwahl
  domain/combat/       pure Fixed-Step-Regeln und KI
  game/scenes/         Battlefield, Eingabe, Kamera und VFX-Orchestrierung
  game/presentation/   Schiffskunst und Hardpoint-Transformation
  ui/                  DOM-HUD und Dialoge
```

Stärken:

- deterministische 30-Hz-Domäne
- Rendering und Regeln sauber getrennt
- Mobile-/Desktop-E2E-Gate
- sichtbare Originalschiffe mit Hardpoints
- GitHub Pages als kontinuierlich testbarer Build

Aktuelle Produktionsrisiken:

- der Einstieg besitzt jetzt sichtbare Support-Montage und echtes 1v1, verwendet aber noch große Übergangsschiffe und bietet noch keine Waffenmontage oder Reward→Refit
- Landscape-Joystick und Drei-Missionen-Flow sind technisch abgesichert, aber noch nicht als vollständige Kampagne extern playgetestet
- `CombatScene` bündelt noch Eingabe, Kamera und VFX und sollte vor größerem Content modularisiert werden
- VFX werden noch ad hoc erzeugt statt gepoolt
- Audio-Layer fehlt vollständig
- es gibt keine echte Telemetrie oder Balance-Simulation für Echtzeitkämpfe
- Upgrade-Auswirkungen sind funktional, aber noch nicht als sichtbare Hardpoint-/Emitter-Varianten produziert

## 3. Phase A — Tactical Real-Time Vertical Slice ✅

Ergebnis:

- Command-Beat-/AP-/Turn-System entfernt
- kontinuierliche träge Kinematik
- Flaggschiff direkt, Eskorte halbautonom
- Auto-Breitseiten und drei manuelle Systeme
- physische Torpedos und Lance-Telegraph
- Pause, ¼-Tempo und Live
- neuer Mobile-HUD und reproduzierbare Screenshots
- 19 Unit- und 24 E2E-Läufe auf zwei Mobile-Landscape-Größen und Desktop grün

Commit: `e0bc84a`

### A1. Mobile Joystick Experiment ✅

- absoluter Richtungs-Joystick mit persistentem Sollkurs
- Zwei-Daumen-HUD, Kursvektor und 125-%-Kamera
- frühere Kurszeichnung dormant und reversibel erhalten
- 19 Unit- und 24 E2E-Läufe grün

Commit: `06f9b51`

### A2. Landscape Campaign Slice ✅

- 844×390 Landscape-Referenz, 2400×1400-Arena und 65–240-%-Zoom mit Zwei-Finger-Pan
- drei freischaltbare Missionen mit eskalierenden Verbänden
- Relay-/Shipyard-Capture und begrenzte automatische Drohnenverstärkung
- strategische Missionsziele als verpflichtende Siegbedingung nach Ausschaltung des Feindverbands
- Mission Results, Salvage, Upgrade-Wahl, Continue/Replay und LocalStorage-Persistenz
- erste gestaffelte Broadside-Choreografie

Commits: `fb12d6e`, `60029d1`, `a5bb610`

### A3. Mobile Full-field HUD ✅

- 34-px-Topbar; keine reservierte Bottom-Leiste und keine Verkleinerung der Weltkamera für das HUD
- rund 90 % Kamerahöhe unterhalb der Topbar auf 844×390, 740×360 und 667×375
- 48-px-Telemetrie oben links, freier Joystick unten links und getrennte 46–68-px-Ability-Buttons unten rechts
- radiale Cooldownanzeige, sichtbare Kosten und Browser-Gate gegen überlappende Touchflächen
- visueller Overscan ohne schwarze Zoomränder
- tolerante direkte Gegner-Taps sowie ZIEL-Durchschaltung
- Mindestgrößen für Joystick/Aktionen als Browser-Regression

Commit: `17218da`

## 4. Phase B — Combat Feel und Onboarding 🚧

### B0. Prologue Loadout Slice

- ⏳ zwei kleine Starterhüllen mit unterschiedlichen Bewegungs-/Defensivrollen
- 🚧 datengetriebene Weapon-, Engine- und Shield-Emitter-Sockets; Support-Layer steht, Weapon-Socket folgt
- 🚧 vor Mission 1 genau eine Waffe und ein Support-Modul sichtbar montieren; Support-Auswahl steht
- ✅ Menü-Preview und Kampfschiff verwenden dasselbe Startermodul
- ✅ 1-gegen-1-Kalibrierungsflug; Eskorte und ihre HUD-Aktion sind dort entfernt
- Salvage, Modulbelohnung, erneuter Refit und Vorschau späterer Hüllen
- bestehende Cruiser-/Frigate-Modelle als spätere Tier-2-/Tier-3-Ziele neu positionieren

Abnahme:

- vollständiger Wahl→Montage→1v1→Reward→Refit-Flow auf 667×375 und 844×390
- zwei Module sind im Menü, im Combat und im Effektbild eindeutig wiederzuerkennen
- Mission 1 startet in höchstens 90 Sekunden und endet in 2–3 Minuten
- Unit-, Save- und E2E-Abdeckung für Loadout und Belohnung

Konzept: [Prolog und modulare Schiffe](../design/PROLOGUE_AND_MODULAR_SHIPS.md)

### B1. Lesbarkeit und Kontext-Onboarding

- Intro-Hinweis zeigt Flaggschiff und fordert einen ersten Joystick-Sollkurs
- erster Gegnerkontakt erklärt Fokus und Auto-Broadside im Kontext
- erste gegnerische Lance erklärt Pause und Joystick-Kursreaktion
- erster Hull-Treffer erklärt Shield Boost
- Hinweise verschwinden dauerhaft nach erfolgreicher Handlung
- Hilfe bleibt als kurze Referenz erhalten

Abnahme:

- fünf Erstspieler starten ohne mündliche Erklärung
- vier verstehen Joystick-Sollkurs, Ziel und Pause innerhalb von 60 Sekunden
- Fehl-Taps, Zeit bis Erstaktion und Zeit bis Ersttreffer werden protokolliert

### B2. Weapon-/Impact-Choreografie

- Broadside: gestaffelte Hardpoint-Salven, kurze Recoil-/Muzzle-Sequenz, Travel-Linie, klassenspezifischer Impact
- Lance: Warm-up-Licht, ansteigender Ring, Audio-Riser, Release-Flash, Beam-Kern, Impact-Hold
- Torpedo: Engine-Trail, Kurskorrektur, Zielwarnung, sichtbarer Einschlag und Debris
- Shield: Fläche verformt sich am Kontaktpunkt, Boost hat Start/Loop/Ende
- Explosion: mehrere Stufen statt eines einzelnen Kreises
- VFX-Pool und zentrales Intensitätsprofil für Mobile/OLED

Abnahme:

- jede Waffe ist ohne HUD eindeutig erkennbar
- kein Effekt verdeckt länger als 250 ms eine kritische Telegraphrichtung
- drei Restarts erzeugen keine wachsende Objektzahl

Status: Broadside besitzt einen ersten vollständigen Hardpoint→Travel→Impact-Pass; Pooling, Audio und klassenspezifische Varianten bleiben offen.

### B3. Kamera und Motion

- ✅ sanftes Follow Framing statt dauerhaft starrem Weltzentrum
- Fokus auf Ziel optional, ohne Flaggschiff aus dem Blick zu verlieren
- kurze begrenzte Impulsreaktion bei Lance/Explosion
- Banking, Thruster-Stärke und Bremslicht an Kinematik koppeln
- ✅ Pinch, Zwei-Finger-Pan und manuelle Zoomwahl haben Vorrang; Follow setzt verzögert wieder ein

### B4. Original-Audio

- AudioManager mit UI-, Ambience-, Weapon- und Impact-Bus
- Mobile Audio Unlock beim Startbutton
- Suspend/Resume bei Tab-Wechsel
- Musik-/SFX-Schalter sowie persistente Lautstärke
- Varianten für häufige Schüsse und Impacts
- Lance-Warm-up als zuverlässiger Telegraph

## 5. Phase C — Tactical Depth

### C1. Rollenidentität

- Cruiser: breite Seitenbögen, starke Schildkontrolle, langsame Kurskorrektur
- Frigate: aggressive Frontwaffen, schnelles Repositionieren, fragiler
- Escort-Direktiven erzeugen sichtbar andere Ziele und Abstände
- Gegnerrollen erhalten eindeutige Telegraph- und Bewegungsmuster

### C2. Terrain und Encounter

- Nebelwirkung visuell eindeutiger machen
- zweites Terrain-Element mit anderer Entscheidung, etwa Trümmer-Line-of-Sight oder Energiezone
- Encounter-Daten aus der Scene lösen
- zweiter Encounter plus Elite-Gegner statt bloß höherer HP

### C3. Balance-Simulation

- headless Batch-Simulationen für Time-to-First-Hit, Time-to-Kill, Energie und Fähigkeitshäufigkeit
- Szenarien mit Cruiser/Frigate und allen Eskorte-Direktiven
- Grenzwerte als Regression-Gate dokumentieren

## 6. Phase D — Results, Refit und Persistenz 🚧

### D1. Mission Results 🚧

- ✅ Ergebnis, Dauer und einmaliges Salvage
- ✅ Retry und Continue ohne Sackgasse
- ⏳ Rest-Hull, verhinderter Schaden und zerstörte Ziele

### D2. Shipyard 🚧

- ✅ vier funktionale Flaggschiff-/Eskorte-Upgrades
- sichtbare Änderung an Hardpoint/Silhouette
- Vorher-/Nachher-Preview mit Kosten und taktischem Satz
- genau ein Upgrade pro erstem Loop, damit die Entscheidung verständlich bleibt

### D3. Save 🚧

- ✅ versioniertes JSON-Schema
- ✅ LocalStorage-Persistenz für Missionen, Salvage und Upgrades
- LocalStorage-Migration
- expliziter Reset
- Tests für beschädigte, alte und leere Saves

## 7. Phase E — Vertical-Slice-Release

- 844×390, kleine Landscape-Höhe, große Phones, Tablet und Desktop prüfen
- 200-%-Textzoom, Keyboard, Reduced Motion und Kontrast prüfen
- Visual Regression für Menü, Live Combat, Pause/Telegraph und Resultat
- Performance-Budget, Memory-Soak und drei vollständige Replay-Loops
- Asset-/Audio-Lizenzen und Credits vollständig
- finale fünf externe Verständlichkeits-Playtests
- Release-Tag und stabiler Pages-Build

## 8. Testmatrix

| Ebene | Verbindliche Abdeckung |
|---|---|
| Unit | Kinematik, Arcs, Energie, Cooldowns, Damage, Cover, Projectiles, AI-Direktiven, Save-Migration |
| Integration | Fixed-Step über komplette Gefechte, Ergebnis und Upgrade-Auswirkung |
| E2E Mobile | Startwahl, Pause, Joystick-Sollkurs, Ziel, jedes manuelle System, Eskorte, Zoom, Results, Refit |
| E2E Desktop | identische Kernflows plus Maus/Mausrad |
| Visual | Menü, Live, Telegraph-Pause, Explosion, Results, Shipyard |
| Performance | 60 FPS Profil, Objektzahlen, drei Restarts, Hintergrund/Resume |
| Playtest | Zeit bis Erstaktion, Ersttreffer, Kampfzeit, Fehl-Taps, Verständnis |

## 9. Definition of Done

Eine Änderung ist fertig, wenn:

- sie im echten Mobile-Viewport bedienbar ist
- Fehlerzustand und Feedback verständlich sind
- Typecheck, Unit-, Build- und E2E-Gates grün sind
- neue Assets im Manifest dokumentiert sind
- Roadmap und Changelog aktualisiert sind
- der Pages-Link nach dem Push geprüft wurde
- bei sichtbarer Änderung ein reproduzierbarer Screenshot oder Visual-Test aktualisiert wurde

## 10. Nächste drei Produktionspakete

1. **Prologue Loadout Slice:** zwei kleine Hüllen, zwei sichtbare Module, 1-gegen-1, Reward und erneuter Refit.
2. **Three-Mission Phone Playtest:** den neu geordneten Landscape-Flow messen und Steuer-/Balanceprobleme priorisieren.
3. **Combat Feel + Audio:** Kontextschritte, VFX-Pooling, Lance/Torpedo-Choreografie, Damage States, Busse und Mobile-Unlock.

Die modulare Schiffsarchitektur ist dabei kein Nebenfeature, sondern die gemeinsame Grundlage für sichtbare Upgrades, Damage States, Engine-VFX, Schildbögen und spätere Waffenvarianten.
