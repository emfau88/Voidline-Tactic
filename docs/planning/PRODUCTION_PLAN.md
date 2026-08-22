# Production Plan

Stand: 22. August 2026  
Ziel: hochwertiger, verständlicher Mobile-Vertical-Slice auf Basis von Fleet Corridors

## Produktionsprinzip

Jeder Schritt endet in einem spielbaren Pages-Build mit Regeln, Präsentation, Mobile-Bedienung, Tests und aktualisierter Dokumentation. Mehr Content folgt erst, wenn der bestehende Kampf verständlich, wirkungsvoll und balanciert ist.

## Architektur

```text
src/domain/combat/    Fixed-Step, Schiffe, Waffen und Schaden
src/domain/fleet/     Korridore, Befehle, Navigation, Objectives, Versorgung, Strategie-KI
src/game/scenes/      Fleet-Orchestrierung
src/game/controllers/ freie Kamera und spätere Audio-/VFX-Controller
src/game/presentation/Lane-, Schiffs- und Waffenansicht
src/ui/               DOM-Command-HUD und Dialoge
```

Stärken:

- deterministische pure Domain und 100-Match-Simulation
- Fleet-Regeln getrennt vom Combat-Core
- Mobile-/Desktop-E2E-Gate und GitHub Pages
- originale Schiffe, Hardpoints und sichtbare Startmodule
- aktiver Modus kann Legacy-Joystickcode ersetzen, ohne ihn sofort destruktiv zu löschen

Risiken:

- 84 % Spielersiege und zu effizienter Center Push
- Command-Ship-Dauer noch über starke HP-Multiplikatoren
- keine originale Audioebene
- VFX nicht gepoolt, 7v7 noch nicht auf Zielhardware vermessen
- Fleet-Szene bündelt weiterhin Input, Match und mehrere VFX
- externe Verständlichkeit ist noch ungetestet

## Phase A – Fleet-Corridors-PoC ✅

- Repository-Audit und Pivot-Architektur
- drei Routen, Junctions, fünf Haltungen und Rollen-Autopilot
- Relay, Shipyard/Nebel, Versorgung, Deployment und 7-Schiff-Limit
- strategische Gegner-KI und Command-Ship-Sieg
- freie Kamera, Pinch-Zoom und expliziter Flottenfokus
- Mobile-Routengruppen-HUD und optionale Einzelschiff-Systeme
- 30 Unit-, 18 E2E- und 100 Headless-Matches grün

Commits: `f79f605`, `3656354`, `025cbc7`

## Phase B – Balance und Verständlichkeit 🚧

1. Center Push mit höherem Risiko oder Verteidigungsfenster versehen.
2. Relay-/Shipyard-Bonus direkt am Objective quantifizieren.
3. Command Ship in lesbare Phasen mit Support-Abhängigkeit umbauen.
4. Siegquote auf 55–65 % bringen, ohne frühe Dynamik zu verlieren.
5. fünf externe Erstspieler im Mobile-Querformat beobachten.
6. Nachkampfbericht mit Captures, Routendruck, Verlusten und Versorgung.

Abnahme:

- alle drei Strategien innerhalb 3–6 Minuten und ohne dominante Auto-Wahl
- vier von fünf Erstspielern verstehen Routengruppe, Haltung und Versorgung ohne Hilfe
- kein Spieler versucht, jedes Schiff dauerhaft zu steuern
- Niederlagenursache ist in mindestens vier von fünf Fällen korrekt benennbar

## Phase C – Audio/VFX und Rollenlesbarkeit ⏳

1. AudioManager mit Music-, UI-, Weapons- und Impact-Bus plus Mobile-Unlock.
2. Broadside je Klasse, Lance-Warm-up, Torpedo-Trail und Shield-Impact ausbauen.
3. Damage States, Engine-Ausfall, Debris und mehrstufige Command-Ship-Zerstörung.
4. VFX-/Projectile-Pooling und 7v7-Performance-Telemetrie.
5. Formation, Rollenmarker und Effektbudget für große Schlachten.

Abnahme:

- 60 FPS Zielhardware bei 7v7
- drei Restarts ohne wachsenden Speicher-/Objektbestand
- Klasse und Hauptwaffe aus Silhouette/Salve erkennbar
- Audio transportiert Alarm, Abschuss, Treffer und Objective-Wechsel ohne Blick aufs HUD

## Phase D – Reward, Refit und drei Missionen ⏳

- zweite sichtbare Waffenmontage vor Einsatz 1
- Nachkampf-Reward und sichtbarer Refit
- Mission 1: kleine Routenschlacht mit reduziertem Gegnerverband
- Mission 2: vollständiges Relay-/Supply-Spiel
- Mission 3: Werft, Nebel und 5–7 Schiffe pro Seite
- Vorschau auf nächste Hüllen und Rollen
- persistenter, versionierter Fortschritt mit Save-Reset

## Phase E – Release-Härtung ⏳

- Accessibility und 200-%-Textzoom
- Visual Regression und echte Geräte-Matrix
- Performance-, Memory- und Drei-Match-Soak
- Credits, Lizenz-/Assetprüfung und Datenschutz
- externer Balance-/Verständlichkeitstest
- öffentlicher Vertical-Slice-Tag

## Definition of Done pro Änderung

- Regel ist deterministisch getestet
- aktive UI erklärt Nutzen und Zustand
- 844×390 und 667×375 bleiben überlappungsfrei
- Touch-Ziele erfüllen mindestens 44×44 px für Hauptaktionen
- Production Build und relevante E2E-/Simulation-Gates sind grün
- Roadmap und Changelog spiegeln den Stand
- Pages-Link wird nach Push geöffnet und geprüft
