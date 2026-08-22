# Top 20 Hebel zum Mockup-Niveau

Stand: 22. August 2026

Bewertungsbasis: aktueller 844×390-Landscape-Build, drei reproduzierbare Screenshots, 18 Unit-Tests, 16 automatisierte Mobile-/Desktop-Browser-Läufe und die Konzeptbilder unter `docs/reference/mockups/`. Ein vollständiger externer Drei-Missionen-Playtest auf realen Phones steht noch aus.

## Ehrliche Standortbestimmung

| Bereich | Nähe zum Zielniveau | Einordnung |
|---|---:|---|
| Mobile Layout und Bedienbarkeit | 90 % | Landscape nutzt die Breite, Zwei-Daumen-HUD, Joystick, Pause, Pinch, Pan und Fullscreen-Fallback funktionieren; reale Geräte- und Safe-Area-Abnahme fehlt. |
| Informationshierarchie und HUD | 76 % | klarer als die frühere App-Shell und im Gefecht verständlich; Materialtiefe, Micro-Motion und kontextuelles Onboarding fehlen. |
| Schiffssilhouetten und Hardpoints | 72 % | vier originale, lesbare Schiffe und definierte Feuerpunkte; Damage States und sichtbar montierte Upgrade-/Waffenvarianten fehlen. |
| Battlefield und Atmosphäre | 71 % | große 2400×1400-Arena, unverzerrte Nebula-Komposition, Parallax und bessere Gegnerlesbarkeit; Terrainvielfalt und räumliche Tiefe sind noch dünn. |
| Combat-Regeln und Flow | 81 % | Joystick-Echtzeit, längere Reichweiten, drei eskalierende Missionen, siegrelevante Capture-Ziele und Werft-Drohnen bilden einen echten Slice; Balance ist noch nicht extern validiert. |
| VFX und Treffergefühl | 54 % | Broadside hat einen vollständigen ersten Produktionspass; Lance, Torpedo, Damage States, Explosionen und Pooling liegen sichtbar darunter. |
| Audio | 0 % | größter vollständig fehlender Qualitätsmultiplikator. |
| Meta-Loop und Progression | 64 % | Missionsfreischaltung, Salvage, vier Upgrades, Continue/Replay und persistenter Save funktionieren; sichtbarer Refit, Results-Metriken und Migration fehlen. |
| Gesamtprodukt | **ca. 69 %** | der funktionale Drei-Missionen-Slice steht; zum Mockup-Eindruck fehlen vor allem Audio, Onboarding, sichtbare Ausrüstung, Trefferzustände und finaler UI-/VFX-Polish. |

Die 69 % sind keine Zeitschätzung. Sie bewerten die wahrnehmbare Produktreife. Der Abstand ist nicht mehr primär „mehr Systeme“, sondern Qualität, Rückmeldung und Beweis durch echte Erstspieler.

## Die nächsten 20 Hebel in Prioritätsreihenfolge

| # | Hebel | Warum jetzt | Messbare Abnahme |
|---:|---|---|---|
| 1 | Vollständiger Drei-Missionen-Phone-Playtest | Der Kernloop existiert jetzt und muss auf echter Hardware seine Verständlichkeit, Kampfzeit und Ergonomie beweisen. | Mindestens fünf komplette Runs auf kleinem/großem Phone; Zeiten, Fehl-Taps, Abbrüche, Zoomnutzung und Todesursachen dokumentiert. |
| 2 | 60-Sekunden-Kontext-Onboarding plus Telemetrie | Menü, Joystick, Fokus, Pause und Capture dürfen keine Vorab-Erklärung brauchen. | 4/5 Erstspieler setzen Kurs, Ziel und Pause korrekt; Erstaktion ≤20 s, erster lesbarer Treffer ≤35 s. |
| 3 | Original-Audio-Foundation | Audio ist der größte verbleibende Qualitätssprung und zugleich wichtiges Gameplay-Feedback. | Vier Busse, Mobile-Unlock, Suspend/Resume, Mute/Volume und originale UI-, Broadside-, Impact- und Warn-Sets. |
| 4 | Broadside zur Referenzqualität bringen | Sie ist das häufigste Feuerereignis und besitzt bereits eine belastbare visuelle Basis. | 3–5 Schuss-/Impact-Varianten, Klassencharakter, Audio, VFX-Pooling und stabile Objektzahl über drei Kämpfe. |
| 5 | Lance-Telegraph als audiovisuelle Referenz | Die Lanze definiert Reaktion, Pause und starke Waffenwirkung. | Warm-up, Richtung, Riser, Release, Beam und Schild-/Hull-Impact sind ohne HUD verständlich. |
| 6 | Torpedo-Travel und Zielwarnung | Physische Torpedos sind ein Kernversprechen und müssen über die größere Arena spannend lesbar bleiben. | Launch, Trail, Kurskorrektur, ETA/Warnung, Explosion und Debris sind bei 65–240 % Zoom verfolgbar. |
| 7 | Trefferreaktionen und Damage States | Treffer verändern aktuell Werte stärker als die sichtbare Schiffslage. | Shield deformation, Hull flash, Scorch/Debris und intakt/beschädigt/kritisch pro Klasse klar erkennbar. |
| 8 | Kamera- und Action-Framing verfeinern | Follow, Pinch und Pan stehen; starke Momente brauchen noch kontrollierte Inszenierung. | Ziel bleibt optional im Frame, Impact-Impulse sind kurz, manuelle Geste gewinnt immer und Reduced Motion wird respektiert. |
| 9 | Sichtbare Waffen- und Upgrade-Hardpoints | Der funktionale Upgrade-Loop muss das vom Nutzer gewünschte sichtbare Aufrüsten einlösen. | Mindestens drei Trade-offs ändern Werte, Silhouette/Emitter und Ingame-Schussbild; Menü zeigt Vorher/Nachher. |
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

### Paket 1 — Beweisen und verstehen

Hebel 1, 2, 10, 11 und 17. Der komplette Slice wird gemessen, bevor Balance oder Umfang blind wachsen.

### Paket 2 — Wahrnehmbares Combat Feel

Hebel 3–8 und 16. Das ist der größte Sprung von „funktioniert“ zu „fühlt sich hochwertig an“.

### Paket 3 — Sichtbarer Refit und taktische Tiefe

Hebel 9, 12–14 und 20. Upgrades, Gegner und Raum erzeugen nachvollziehbar andere Gefechte.

### Paket 4 — Release-Härtung

Hebel 15, 18 und 19 laufen parallel zu jedem Paket und werden am Ende vollständig abgenommen.

## Was wir bewusst nicht als nächsten Hebel verfolgen

- dauerhaft mehrere Schiffe direkt per zusätzlichem Joystick steuern
- Höhenebenen oder 3D
- ballistische Vollsimulation
- große Crew-/Officer-Systeme
- zehn neue Waffen vor einem hochwertigen Audio-/VFX-Referenzset
- reine HP-/Damage-Upgrades ohne sichtbare taktische Änderung

Diese Features würden Umfang erhöhen, aber die aktuelle Qualitätslücke nicht zielgerichtet schließen.
