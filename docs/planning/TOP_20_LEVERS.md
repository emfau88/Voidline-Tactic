# Top 20 Hebel zum Mockup-Niveau

Stand: 22. August 2026

Bewertungsbasis: aktueller Battlefield-first-Landscape-Build auf 844×390 und 667×375, drei reproduzierbare Screenshots, 18 Unit-Tests, 24 automatisierte Mobile-/Desktop-Browser-Läufe und die Konzeptbilder unter `docs/reference/mockups/`. Ein vollständiger externer Drei-Missionen-Playtest auf realen Phones steht noch aus.

## Ehrliche Standortbestimmung

| Bereich | Nähe zum Zielniveau | Einordnung |
|---|---:|---|
| Mobile Layout und Bedienbarkeit | 94 % | 69–72 % freie Spielfeldhöhe, 64-px-Joystick, mindestens 44-px-Aktionen, tolerante Ziel-Taps, Pinch/Pan und Fullscreen-Fallback sind browsergeprüft; reale Geräte-/Safe-Area-Abnahme fehlt. |
| Informationshierarchie und HUD | 82 % | eine einzige Kommandozeile, kompakter Fünf-Aktionen-Dock und reduzierte Zielkarte priorisieren das Gefecht; Materialtiefe, Micro-Motion und kontextuelles Onboarding fehlen. |
| Schiffssilhouetten und Hardpoints | 72 % | vier originale, lesbare Schiffe und definierte Feuerpunkte; Damage States und sichtbar montierte Upgrade-/Waffenvarianten fehlen. |
| Battlefield und Atmosphäre | 75 % | große 2400×1400-Arena, zentrierter Overscan, Parallax und gleichzeitiger Flottenüberblick; Terrainvielfalt und räumliche Tiefe sind noch dünn. |
| Combat-Regeln und Flow | 81 % | Joystick-Echtzeit, längere Reichweiten, drei eskalierende Missionen, siegrelevante Capture-Ziele und Werft-Drohnen bilden einen echten Slice; Balance ist noch nicht extern validiert. |
| VFX und Treffergefühl | 54 % | Broadside hat einen vollständigen ersten Produktionspass; Lance, Torpedo, Damage States, Explosionen und Pooling liegen sichtbar darunter. |
| Audio | 0 % | größter vollständig fehlender Qualitätsmultiplikator. |
| Meta-Loop und Progression | 55 % | Missionsfreischaltung, Salvage, vier Upgrades, Continue/Replay und persistenter Save funktionieren; der neue persönliche Prolog mit kleinen Hüllen, sichtbarer Montage und 1v1 fehlt noch. |
| Gesamtprodukt | **ca. 68 %** | der funktionale Drei-Missionen-Slice besitzt jetzt eine belastbare Mobile-Kommandoansicht; die neue Zielkurve legt zusätzlich offen, dass persönlicher Einstieg, modularer Refit, Audio, Trefferzustände und finaler UI-/VFX-Polish fehlen. |

Die 68 % sind keine Zeitschätzung. Sie bewerten die wahrnehmbare Produktreife gegen das jetzt präzisere Ziel. Der Abstand ist nicht primär „mehr Systeme“, sondern ein verständlicher persönlicher Einstieg, sichtbare Konsequenz, Qualität, Rückmeldung und Beweis durch echte Erstspieler.

## Die nächsten 20 Hebel in Prioritätsreihenfolge

| # | Hebel | Warum jetzt | Messbare Abnahme |
|---:|---|---|---|
| 1 | Persönlicher Prolog-Loop | Hüllenwahl, zwei sichtbare Montagen und ein kurzer 1v1 erzeugen Identität, Verständnis und Motivation vor der Flottenkomplexität. | Wahl→Waffe/Support→1v1→Reward→Refit ist auf zwei Phonegrößen komplett; Mission 1 startet ≤90 s und endet in 2–3 min. |
| 2 | Vollständiger Drei-Missionen-Phone-Playtest | Der neu geordnete Kernloop muss auf echter Hardware seine Verständlichkeit, Kampfzeit und Ergonomie beweisen. | Mindestens fünf komplette Runs auf kleinem/großem Phone; Zeiten, Fehl-Taps, Abbrüche, Zoomnutzung und Todesursachen dokumentiert. |
| 3 | 60-Sekunden-Kontext-Onboarding plus Telemetrie | Menü, Joystick, Fokus, Pause und Capture dürfen keine Vorab-Erklärung brauchen. | 4/5 Erstspieler setzen Kurs, Ziel und Pause korrekt; Erstaktion ≤20 s, erster lesbarer Treffer ≤35 s. |
| 4 | Sichtbare Waffen- und Upgrade-Hardpoints | Die modulare Präsentation ist Grundlage des neuen Einstiegs und muss Werte, Menübild und Kampf verbinden. | Zwei Starterhüllen und mindestens vier Module ändern Silhouette/Emitter und Ingame-Effekt; Menü zeigt Vorher/Nachher. |
| 5 | Original-Audio-Foundation | Audio ist der größte verbleibende Qualitätssprung und zugleich wichtiges Gameplay-Feedback. | Vier Busse, Mobile-Unlock, Suspend/Resume, Mute/Volume und originale UI-, Broadside-, Impact- und Warn-Sets. |
| 6 | Broadside zur Referenzqualität bringen | Sie ist das häufigste Feuerereignis und besitzt bereits eine belastbare visuelle Basis. | 3–5 Schuss-/Impact-Varianten, Klassencharakter, Audio, VFX-Pooling und stabile Objektzahl über drei Kämpfe. |
| 7 | Lance-Telegraph als audiovisuelle Referenz | Die Lanze definiert Reaktion, Pause und starke Waffenwirkung. | Warm-up, Richtung, Riser, Release, Beam und Schild-/Hull-Impact sind ohne HUD verständlich. |
| 8 | Torpedo-Travel und Zielwarnung | Physische Torpedos sind ein Kernversprechen und müssen über die größere Arena spannend lesbar bleiben. | Launch, Trail, Kurskorrektur, ETA/Warnung, Explosion und Debris sind bei 65–240 % Zoom verfolgbar. |
| 9 | Trefferreaktionen und Damage States | Treffer verändern aktuell Werte stärker als die sichtbare Schiffslage. | Shield deformation, Hull flash, Scorch/Debris und intakt/beschädigt/kritisch pro Klasse klar erkennbar. |
| 10 | Mission Results mit Leistungswerten | Der Ergebnisdialog schließt den Loop, erklärt aber die eigene Leistung noch kaum. | Dauer, Rest-Hull, verhinderter Schaden, zerstörte Ziele und Salvage; Retry/Continue bleiben eindeutig. |
| 11 | Drei Missionen balancieren und profilieren | Mehr Feinde allein erzeugen noch keine gute Steigerung. | Missionen dauern 2–5 Minuten, stellen jeweils eine andere taktische Frage und besitzen dokumentierte TTK-/Siegquoten-Ziele. |
| 12 | Escort-Direktiven taktisch differenzieren | Vier Labels müssen spürbar andere Flottenentscheidungen erzeugen. | Folgen, Flanke links/rechts und Schutz unterscheiden Abstand, Zielwahl, Risiko und sichtbares Feedback messbar. |
| 13 | Gegnerrollen und Telegraph-Grammatik | Raider, Destroyer, Cruiser und Elite brauchen Verhalten statt nur verschiedene Werte. | Rollen werden nach 30 s korrekt beschrieben; Form/Symbol ergänzt Farbe; Elite nutzt eine erkennbare neue Sequenz. |
| 14 | Zweites Terrain-System | Capture-Ringe und Nebel helfen, aber Begegnungen brauchen mehr räumliche Variation. | Trümmer-Line-of-Sight oder Energiezone erzeugt mindestens zwei plausible Routen und verändert Waffentiming. |
| 15 | HUD-Materialtiefe und Micro-Motion | Die Struktur funktioniert, erreicht aber noch nicht die physische Tiefe der Konzeptbilder. | aktive/armed/cooldown/danger States besitzen konsistente Bewegung, Licht, Textur und Reduced-Motion-Varianten. |
| 16 | CombatScene modularisieren und VFX poolen | Weitere Waffen/VFX würden die zentrale Scene und Mobile-Performance riskant machen. | Input, Camera, Presentation und VFX getrennt; Objektzahl/Memory bleiben über drei Missionen und Restarts stabil. |
| 17 | Headless Balance-Simulation | Echtzeitwerte dürfen nach dem Playtest nicht nur per Gefühl korrigiert werden. | Batch-Szenarien prüfen First Hit, TTK, Energie, Fähigkeitshäufigkeit, Capture-Zeit und Siegquote als Regression. |
| 18 | Save-Migration und expliziter Kampagnenreset | Versionierte Persistenz steht, braucht aber belastbare Fehlerpfade. | leere, beschädigte und alte Saves migrieren/fallen sicher zurück; Reset ist verständlich und getestet. |
| 19 | Release-QA und Accessibility-Matrix | Querformat und dichter HUD müssen auf realen Browsern stabil bleiben. | 200-%-Textzoom, Keyboard, Reduced Motion, Safe Areas, kleine Phones, Tablet, 60-FPS- und Memory-Soak grün. |
| 20 | Nächste Waffen-/Schiffvariante nur als Qualitäts-Benchmark | Mehr Inhalt ist erwünscht, soll aber die bestehende Produktionsqualität übernehmen. | Eine neue sichtbare Waffenvariante oder Klasse besitzt Daten, Hardpoints, VFX, Audio, Upgrade-Preview, Balance-Test und klare taktische Rolle. |

## Empfohlene Umsetzungspakete

### Paket 1 — Persönlicher Einstieg und sichtbarer Refit

Hebel 1 und 4. Zwei Starterhüllen, vier Module und der erste vollständige Belohnungsloop schaffen das Fundament für alle weiteren Schiffe und Effekte.

### Paket 2 — Beweisen und verstehen

Hebel 2, 3, 10, 11 und 17. Der komplette Slice wird gemessen, bevor Balance oder Umfang blind wachsen.

### Paket 3 — Wahrnehmbares Combat Feel

Hebel 5–9 und 16. Das ist der größte Sprung von „funktioniert“ zu „fühlt sich hochwertig an“.

### Paket 4 — Taktische Tiefe

Hebel 12–14 und 20. Upgrades, Gegner und Raum erzeugen nachvollziehbar andere Gefechte.

### Paket 5 — Release-Härtung

Hebel 15, 18 und 19 laufen parallel zu jedem Paket und werden am Ende vollständig abgenommen.

## Was wir bewusst nicht als nächsten Hebel verfolgen

- dauerhaft mehrere Schiffe direkt per zusätzlichem Joystick steuern
- Höhenebenen oder 3D
- ballistische Vollsimulation
- große Crew-/Officer-Systeme
- zehn neue Waffen vor einem hochwertigen Audio-/VFX-Referenzset
- reine HP-/Damage-Upgrades ohne sichtbare taktische Änderung

Diese Features würden Umfang erhöhen, aber die aktuelle Qualitätslücke nicht zielgerichtet schließen.
