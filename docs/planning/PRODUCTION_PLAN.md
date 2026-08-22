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

Mehr Waffen, Schiffe oder Meta-Systeme helfen nicht, solange der erste 2-gegen-2-Kampf nicht in den ersten 60 Sekunden überzeugt.

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

- die neue Joystick-Steuerung ist technisch abgesichert, aber noch nicht durch echte Mobile-Spieler validiert
- `CombatScene` bündelt noch Eingabe, Kamera und VFX und sollte vor größerem Content modularisiert werden
- VFX werden noch ad hoc erzeugt statt gepoolt
- Audio-Layer fehlt vollständig
- es gibt keine echte Telemetrie oder Balance-Simulation für Echtzeitkämpfe
- Results, Upgrades und Save-Loop fehlen

## 3. Phase A — Tactical Real-Time Vertical Slice ✅

Ergebnis:

- Command-Beat-/AP-/Turn-System entfernt
- kontinuierliche träge Kinematik
- Flaggschiff direkt, Eskorte halbautonom
- Auto-Breitseiten und drei manuelle Systeme
- physische Torpedos und Lance-Telegraph
- Pause, ¼-Tempo und Live
- neuer Mobile-HUD und reproduzierbare Screenshots
- 15 Unit- und 14 E2E-Läufe grün

Commit: `e0bc84a`

### A1. Mobile Joystick Experiment ✅

- absoluter Richtungs-Joystick mit persistentem Sollkurs
- Zwei-Daumen-HUD, Kursvektor und nähere 135-%-Kamera
- frühere Kurszeichnung dormant und reversibel erhalten
- 15 Unit- und 14 E2E-Läufe grün

Commit: `06f9b51`

## 4. Phase B — Combat Feel und Onboarding 🚧

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

### B3. Kamera und Motion

- sanftes Follow Framing statt dauerhaft starrem Weltzentrum
- Fokus auf Ziel optional, ohne Flaggschiff aus dem Blick zu verlieren
- kurze begrenzte Impulsreaktion bei Lance/Explosion
- Banking, Thruster-Stärke und Bremslicht an Kinematik koppeln
- Pinch und manuelle Zoomwahl haben immer Vorrang vor Autoframing

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

## 6. Phase D — Results, Refit und Persistenz

### D1. Mission Results

- Ergebnis, Dauer, Rest-Hull, verhinderter Schaden und zerstörte Ziele
- Credits/Salvage klar und kurz
- Retry und Continue ohne Sackgasse

### D2. Shipyard

- drei echte Trade-off-Upgrades
- sichtbare Änderung an Hardpoint/Silhouette
- Vorher-/Nachher-Preview mit Kosten und taktischem Satz
- genau ein Upgrade pro erstem Loop, damit die Entscheidung verständlich bleibt

### D3. Save

- versioniertes JSON-Schema
- LocalStorage-Migration
- expliziter Reset
- Tests für beschädigte, alte und leere Saves

## 7. Phase E — Vertical-Slice-Release

- 390×844, kleine Android-Breite, große Phones, Tablet und Desktop prüfen
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

1. **Control Decision:** drei kurze Mobile-Runs, Joystick-Verständnis messen und zwischen Joystick, Schubergänzung oder Pause-Route entscheiden.
2. **Onboarding + Combat Feel:** Kontextschritte, VFX-Pooling, Lance/Broadside/Torpedo-Choreografie, Trefferzustände und Kamera.
3. **Audio Foundation:** Busse, Mobile-Unlock, erste originale Weapon-/Impact-Sets und Mix.

Erst nach diesen drei Paketen beginnt der vollständige Results-/Shipyard-Loop.
