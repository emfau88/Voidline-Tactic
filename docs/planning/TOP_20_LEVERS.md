# Top 20 Hebel zum Mockup-Niveau

Stand: 22. August 2026

Bewertungsbasis: aktueller 390×844-Build, drei reproduzierbare Screenshots, automatisierte Mobile-/Desktop-Flows und die Konzeptbilder unter `docs/reference/mockups/`

## Ehrliche Standortbestimmung

| Bereich | Nähe zum Zielniveau | Einordnung |
|---|---:|---|
| Mobile Layout und Bedienbarkeit | 83 % | volle Breite, Safe Areas, Zwei-Daumen-HUD, Pause/Slow/Live und Pinch funktionieren; Joystick noch nicht extern validiert |
| Informationshierarchie und HUD | 68 % | deutlich strukturierter und eigenständig; Materialtiefe, Micro-Motion und Onboarding fehlen |
| Schiffssilhouetten und Hardpoints | 72 % | vier originale, lesbare Schiffe; Damage States und modulare Varianten fehlen |
| Battlefield und Atmosphäre | 62 % | hochwertige Basis und gute Kontraste; räumliche Tiefe und taktische Vielfalt fehlen |
| Combat-Regeln und Flow | 72 % | Echtzeit-Pivot und persistenter Sollkurs lösen Statik; Steuergefühl, Tempo und Verständlichkeit sind noch nicht extern validiert |
| VFX und Treffergefühl | 38 % | klare Prototyp-Effekte vorhanden, aber noch keine Produktionschoreografie |
| Audio | 0 % | größter vollständig fehlender Qualitätsmultiplikator |
| Meta-Loop und Progression | 22 % | Auswahl/Preview vorhanden, Results, echte Upgrades, Save und Replay fehlen |
| Gesamtprodukt | **ca. 58 %** | optisch schon klar über Greybox, aber Steuerung, Audio, Combat Feel und Produktloop sind noch nicht release-reif |

Die 58 % sind keine Zeitschätzung. Sie beschreiben die wahrnehmbare Produktreife gegenüber dem Zielbild. Audio, Reaktion, Onboarding und ein geschlossener Loop wiegen stärker als zusätzliche statische Assets.

## Die nächsten 20 Hebel in Prioritätsreihenfolge

| # | Hebel | Warum jetzt | Messbare Abnahme |
|---:|---|---|---|
| 1 | Joystick-Test und Control Decision | Der neue Stick ist bewusst ein Experiment; weitere Systeme sollten nicht auf ungeprüfter Eingabe aufbauen. | Drei kurze Mobile-Runs klären Richtungswahl, Kurs-Halten, Kamera und Wunsch nach Schub; Entscheidung für Joystick, Joystick + Schub oder Pause-Route dokumentiert. |
| 2 | 60-Sekunden-Kontext-Onboarding plus Session-Telemetrie | Verständlichkeit darf nicht von der Hilfeseite abhängen und braucht reale Daten. | 4/5 Erstspieler setzen Sollkurs, Ziel und Pause ohne Erklärung; Erstaktion ≤20 s; Fehl-Taps und Kurskorrekturen protokolliert. |
| 3 | Lance-Telegraph als audiovisuelle Referenzqualität | Er ist die zentrale Reaktionsentscheidung und definiert die Qualität aller späteren Telegraphs. | Warm-up, Richtungsanzeige, Riser, Release und Impact sind ohne HUD verständlich; Reaktionsfenster messbar. |
| 4 | Broadside-Salvenchoreografie | Auto-Feuer muss Gewicht geben, ohne Aufmerksamkeit zu stehlen. | Hardpoints feuern gestaffelt, Recoil/Travel/Impact sind klassenspezifisch und gepoolt. |
| 5 | Torpedo-Readability und Zielwarnung | Physische Torpedos sind ein Kernversprechen und brauchen eine klare Reise statt nur einen Marker. | Trail, Turn, Warnung, ETA und Explosion sind bei 100–180 % Zoom durchgängig verfolgbar. |
| 6 | Original-Audio-Foundation | Audio ist der größte noch fehlende Qualitätsmultiplikator. | Vier Busse, Mobile-Unlock, Suspend/Resume, Mute/Volume und erste originale UI-/Weapon-/Impact-Sets. |
| 7 | Trefferreaktionen und Damage States | Treffer verändern aktuell Zahlen stärker als das sichtbare Schiff. | Shield deformation, Hull flash, Debris und intakt/beschädigt/kritisch pro Schiff lesbar. |
| 8 | Kamera-Follow und Action Framing | Die starre Gesamtansicht begrenzt Dynamik, zu viel Autofokus würde Touch-Kontrolle stören. | Sanftes Flaggschiff-/Ziel-Framing, kurzer begrenzter Impact-Impuls, Pinch hat immer Vorrang. |
| 9 | Joystick-Ergonomie und reversible Route | Dead Zone, Reichweite und Halteverhalten müssen auf kleinen Phones sitzen; die Route bleibt bis zur Entscheidung verfügbar. | Keine Fehlsteuerung neben dem Stick, Pinch bleibt konfliktfrei; optionaler Schub und Pause-Route werden gegen dieselben Testkriterien bewertet. |
| 10 | Escort-Direktiven taktisch differenzieren | Vier Labels reichen nicht; jede Direktive muss eine echte Positionsentscheidung erzeugen. | Folgen, beide Flanken und Schutz haben messbar andere Abstände, Ziele, Risiko und VFX-Feedback. |
| 11 | Gegnerrollen und Telegraph-Grammatik | Gegner unterscheiden sich optisch, aber noch nicht deutlich genug im Verhalten. | Cruiser und Destroyer werden nach 30 s korrekt beschrieben; Symbole/Formen ergänzen Farbe. |
| 12 | Encounter-Geometrie und zweites Terrain | Ein Kreis mit Schadensreduktion trägt keine dauerhafte Positionierung. | Zweites Element erzwingt mindestens zwei alternative Routen und verändert Waffen-/Formationstiming. |
| 13 | HUD-Materialtiefe und Micro-Motion | Das Layout ist gut, wirkt aber noch wie eine sehr saubere App statt ein fertiges Flotteninstrument. | aktive/armed/cooldown/danger States besitzen konsistente Motion, Licht, Textur und Reduced-Motion-Varianten. |
| 14 | CombatScene modularisieren und VFX poolen | Weitere Inhalte würden die zentrale Scene zu riskant und mobile Effekte zu teuer machen. | Input, Camera, Presentation und VFX getrennt; Objektzahl bleibt über drei Kämpfe stabil. |
| 15 | Headless Balance-Simulation | Echtzeitwerte dürfen nicht nur per Gefühl angepasst werden. | Cruiser/Frigate-Szenarien prüfen First Hit, TTK, Energie, Fähigkeitshäufigkeit und Siegquote als Regression. |
| 16 | Mission Results mit verständlicher Leistung | Ein Sieg ohne Auswertung erzeugt keinen Abschluss. | Ergebnis zeigt Dauer, Rest-Hull, verhinderten Schaden und Salvage; Retry/Continue sind eindeutig. |
| 17 | Drei sichtbare Trade-off-Upgrades | Der Hauptmenü-Teaser muss spielbar eingelöst werden. | drei ausrüstbare Upgrades ändern Verhalten und mindestens einen sichtbaren Hardpoint/Emitter. |
| 18 | Versionierter Save und Replay-Loop | Ohne Persistenz bleibt der Shipyard nur Demo. | Menu → Combat → Results → Refit → Replay funktioniert nach Reload und migriert eine alte Save-Version. |
| 19 | Zweiter Encounter und Elite-Gegner | Produktqualität braucht Varianz, nicht nur einen polierten Screenshot. | neuer Encounter stellt eine andere taktische Frage und nutzt keine reine HP-Skalierung. |
| 20 | Release-QA und Accessibility-Matrix | Qualität muss auf realen Geräten und für verschiedene Nutzer stabil bleiben. | Visual Regression, 200-%-Textzoom, Keyboard, Reduced Motion, kleine Phones, Tablet, 60-FPS-/Memory-Soak grün. |

## Empfohlene Umsetzungspakete

### Paket 1 — Verständlichkeit und Messung

Hebel 1, 2, 9, 15. Erst damit wissen wir, ob Joystick und Echtzeitkern tatsächlich die richtige Dynamik erzeugen.

### Paket 2 — Wahrnehmbares Combat Feel

Hebel 3–8 und 14. Das bringt den größten Sprung von „funktioniert“ zu „fühlt sich hochwertig an“.

### Paket 3 — Taktische Tiefe

Hebel 10–12. Positionierung und Gegnerverhalten erhalten mehr langfristige Relevanz.

### Paket 4 — Geschlossener Produktloop

Hebel 16–19. Erst hier werden Shipyard, sichtbare Waffenvarianten und Replay wirklich wertvoll.

### Paket 5 — Release-Härtung

Hebel 13 und 20 laufen parallel mit jedem Paket und werden am Ende vollständig abgenommen.

## Was wir bewusst nicht als nächsten Hebel verfolgen

- mehr gleichzeitig direkt steuerbare Schiffe
- Höhenebenen oder 3D
- ballistische Simulation
- große Crew-/Officer-Systeme
- weitere zehn Waffen vor dem ersten hochwertigen Audio-/VFX-Set
- bloße HP-/Damage-Upgrades ohne sichtbare taktische Änderung

Diese Features würden Umfang erhöhen, aber die aktuelle Qualitätslücke nicht zielgerichtet schließen.
