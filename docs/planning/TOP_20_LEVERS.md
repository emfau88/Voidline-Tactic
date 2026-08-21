# Die nächsten 20 Top-Hebel

Stand: 21. August 2026

Dieses Dokument übersetzt die drei Konzeptbilder in eine priorisierte Produktionsfolge. Ziel ist nicht, deren konkrete Gestaltung oder mögliche fremde IP zu kopieren. Ziel ist dieselbe Qualität bei Informationshierarchie, taktischer Lesbarkeit, räumlicher Tiefe und Feedback – in der eigenständigen abyssal-nautischen Bildsprache von Voidline Tactics.

## Ehrliche Standortbestimmung

Die Prozentwerte sind Arbeitswerte, keine mathematische Messung. Sie bewerten Funktionsabdeckung, visuelle Reife, Verständlichkeit und technische Robustheit gemeinsam.

| Bereich | Stand | Begründung |
|---|---:|---|
| Kampfregeln und spielbarer Flow | 70 % | Der 2-gegen-2-Kampf ist durchgängig spielbar, deterministisch getestet und hat gemeinsame Regeln für UI und KI. |
| Mobile Verständlichkeit | 72 % | Vollbreite, Safe Areas, Zoom, große Touch-Ziele, Vorschauen und Startwahl funktionieren; kontextuelles Onboarding und Touch-Pinch/Pan fehlen. |
| Schiffe und Environment | 60 % | Vier eigenständige Silhouetten, sichtbare Mounts und der Nebula-Layer sind integriert; Asteroiden, Tiefenstaffelung und Damage States fehlen. |
| Combat-HUD, VFX und Audio | 45 % | Ein erster HUD-System-Pass, eigene Icons, Arcs, Projektile, Hardpoints und Trefferfeedback existieren; finale Choreografie und Audio fehlen. |
| Results, Shipyard und Progression | 15 % | Startschiffwahl, zwei Flaggschiff-Module und Refit-Vorschau existieren; Belohnung, tatsächliches Ausrüsten und Save fehlen. |
| Officers und detaillierte Crew | 0 % | Bewusst außerhalb des Vertical-Slice-Scopes, bis der Kernloop nachweislich trägt. |

Damit liegt der **aktuelle Combat Slice bei ungefähr 50–55 % des Präsentationsniveaus des Kampf-Mockups**. Über alle drei Konzeptbilder liegt das Produkt bei ungefähr **30–35 %**, weil ein echter Shipyard und Crew weiterhin erhebliche zusätzliche Produktbreite darstellen. Der wichtigste Befund bleibt: Die technische und spielerische Grundlage ist weiter als die sichtbare Präsentation.

## Aus direktem Mobile-Feedback bereits geschlossen

| Beobachtung | Umsetzung | Restgrenze |
|---|---|---|
| Phone-Breite blieb ungenutzt | dynamische Vollbreiten-Shell, Safe Areas und Phaser-Resize | Desktop bleibt bewusst auf 620 px fokussiert |
| kein Fullscreen | Fullscreen-API, Web-App-Manifest und erklärter iOS-/Home-Screen-Fallback | iPhone-Safari kann Web-Apps je nach Plattform weiterhin auf den installierten Home-Screen-Modus beschränken |
| keine Zoomsteuerung | 80–140 % über Touch-Buttons und Mausrad | natürliches Pinch/Pan und Action Framing stehen noch aus |
| HUD zu rudimentär | erster Komponenten-Pass, größere Hierarchie, eigene SVG-Icons, AP-/Energiekosten | der zweite Fidelity-Pass ist Hebel 1 |
| kein Einstieg/Startschiff | Hauptmenü, zwei Startschiffe und zwei spielwirksame Flaggschiff-Module | echte Flottenzusammenstellung ist Hebel 4 |
| Waffen nicht ausreichend sichtbar | Mount-Marker auf dem Schiff und Loadout-Chips im Menü | austauschbare Waffenmodelle und Varianten sind Hebel 3 |

## Priorisierte Hebel

| # | Hebel | Warum er stark wirkt | Messbares Done |
|---:|---|---|---|
| 1 | Zweiter HUD-Fidelity-Pass | Das neue System löst Lesbarkeit und Icon-Konsistenz, erreicht aber noch nicht die räumliche Dichte und Materialtiefe des Mockups. | Responsive Panel-Komposition, Status-Chips, Zielhierarchie, Motion States und Design Tokens sind über Menü, Combat und Dialoge konsistent. |
| 2 | Gekrümmte Movement-Route und Facing-Ghost | Macht die zentrale taktische Entscheidung sofort lesbar und nähert sich direkt der stärksten Mockup-Idee. | Kurve, Wegpunkte, Ghost-Silhouette und Touch-Facing stimmen mit der tatsächlich ausgeführten Bewegung überein. |
| 3 | Austauschbare Waffen und sichtbare Modelle | Mehr Waffen sind nur wertvoll, wenn Daten, Mount, Silhouette, Arc, VFX und Upgrade gemeinsam wechseln. | Mindestens fünf Waffenfamilien; Ausrüsten verändert Ship-Art-Mounts, Werte, Vorschau und Kampfchoreografie. |
| 4 | Echte Flotten-/Startschiff-Konfiguration | Die aktuelle Wahl bestimmt Flaggschiff und Modul, aber noch nicht Formation, Escort und Kosten. | Startwahl verändert zulässige Formation, Budget, Escort und mindestens einen taktischen Trade-off. |
| 5 | Taktische Pinch-/Pan-Kamera mit Action Framing | Zoombuttons lösen die Baseline; natürliche Gesten und Fokuswechsel machen große Schiffe körperlicher. | Pinch/Pan, Grenzen, Reset und automatischer Fokus bei Angriffen funktionieren ohne Fehlkommandos. |
| 6 | Präzise Feuergeometrie und Zielzustände | Reichweite, Arc, gültig/ungültig und Kollateraleffekt müssen ohne Textsuche erkennbar sein. | Jede Waffe besitzt eindeutig unterscheidbare Geometrie, Farbcodierung, Zielmarke und Fehlergrund. |
| 7 | Waffen-Choreografie als VFX-System | Gestaffelte Salven statt einzelner Effekte erzeugen wahrgenommene Produktionsqualität. | Jede Waffenfamilie hat Charge, Launch, Travel, Impact und Aftermath mit Pooling. |
| 8 | Lokale Treffer- und Damage-Reaktionen | Wirkung entsteht am Ziel, nicht nur am Projektil. | Shield-Ripple, Hull-Flash, Funken, Trümmer, kritischer Zustand und dezenter Camera Impulse sind klar abgestuft. |
| 9 | Taktische Raumtiefe | Asteroiden, Wracks und Nebelzonen geben Maßstab und Komposition, ohne Ziele zu verdecken. | Drei Tiefenebenen, sichere Kontrastzonen und mindestens ein regelrelevantes Terrain-Element sind integriert. |
| 10 | Originales Audio mit sauberem Mobile-Unlock | Audio ist der schnellste Multiplikator für Gewicht, Bestätigung und Markenidentität. | Musik-, UI-, Weapon- und Impact-Busse, Varianten, Mute/Volume und suspend/resume sind getestet. |
| 11 | Kontextuelles First-Battle-Onboarding | Die Regeln sind vorhanden, werden aber noch nicht im Entscheidungsmoment erklärt. | Der erste Kampf lehrt Auswahl, Bewegung/Facing, Arc, Prognose und Runde ohne separates Handbuch. |
| 12 | Mission Results als Loop-Abschluss | Ein hochwertiges Spiel braucht Konsequenz und einen klaren Übergang aus dem Kampf. | Ergebnis, Kennzahlen, Credits/Salvage und Weiter/Retry sind vollständig spielbar. |
| 13 | Funktionaler Shipyard mit drei Trade-offs | Die Refit-Vorschau wird erst wertvoll, wenn Ausrüstung echte Kampfentscheidungen verändert. | Drei Upgrade-Pfade sind kaufbar, ausrüstbar, sichtbar und zeigen Vorher/Nachher. |
| 14 | Versionierte Persistenz | Fortschritt und Settings müssen Releases überleben. | LocalStorage-Schema, Migration, Reset und korrupter-Save-Fallback sind getestet. |
| 15 | Zweite Mission mit Terrainziel | Eine zweite Situation beweist, dass der Combat Core ein Spielsystem und kein Demo-Skript ist. | Andere Formation, mindestens ein Raumziel und ein neuer taktischer Lösungsweg. |
| 16 | Positionsbewusste Gegner-KI | Die KI soll Feuerwinkel planen statt nur das nächste gültige Kommando wählen. | KI bewertet Route, Facing, Arc, Überleben und Fokusziel deterministisch und testbar. |
| 17 | Performance- und Ladebudgets | Hochwertige Assets dürfen Mobile-Startzeit und stabile Framerate nicht zerstören. | Definierte JS-/Asset-Budgets, Atlanten, Lazy Loading und 30/60-fps-Qualitätsstufen auf Zielgeräten. |
| 18 | Visual Regression und Gerätematrix | UI- und VFX-Polish benötigt reproduzierbare visuelle Abnahme. | Golden Screens für 390×844, kleines Android, großes iPhone und Desktop laufen als Review-Artefakt. |
| 19 | Accessibility-, Settings- und Content-Gates | Qualität braucht lesbare Zustände und sichere Datenpipelines. | Reduced Motion, Contrast, Lautstärke, Touch-Ziele, Definitionen, Rechte, Hardpoints und Budgets sind prüfbar. |
| 20 | Externer Verständlichkeits- und Balance-Test | Interne Tests finden keine falschen Annahmen echter Erstspieler. | Mindestens fünf Erstspieler; Time-to-first-valid-action, Fehlklicks, Abbruchpunkte und Feedback sind ausgewertet. |

## Empfohlene Produktionsreihenfolge

1. **Mobile Combat und Loadout-Fidelity:** Hebel 1–9.
2. **Feel und Verständlichkeit:** Hebel 10–11.
3. **Geschlossener Vertical Slice:** Hebel 12–16.
4. **Release-Härtung:** Hebel 17–20.

Officers und detaillierte Crew bleiben danach ein möglicher Ausbau. Sie jetzt vorzuziehen würde viel Oberfläche schaffen, aber weder den Kampf noch den entscheidenden Combat→Reward→Shipyard-Loop beweisen.
