# Die nächsten 20 Top-Hebel

Stand: 21. August 2026

Dieses Dokument übersetzt die drei Konzeptbilder in eine priorisierte Produktionsfolge. Ziel ist nicht, deren konkrete Gestaltung oder mögliche fremde IP zu kopieren. Ziel ist dieselbe Qualität bei Informationshierarchie, taktischer Lesbarkeit, räumlicher Tiefe und Feedback – in der eigenständigen abyssal-nautischen Bildsprache von Voidline Tactics.

## Ehrliche Standortbestimmung

Die Prozentwerte sind Arbeitswerte, keine mathematische Messung. Sie bewerten Funktionsabdeckung, visuelle Reife, Verständlichkeit und technische Robustheit gemeinsam.

| Bereich | Stand | Begründung |
|---|---:|---|
| Kampfregeln und spielbarer Flow | 80 % | Command Beats, offene Gegnerabsichten, sichere Treffer, Drift, Cover und verkürzte Time-to-Kill adressieren die größten Dynamikprobleme; das neue Tempo braucht echte Playtests. |
| Mobile Verständlichkeit | 82 % | Vollbreite, Safe Areas, HiDPI, Pinch-Zoom, große Touch-Ziele, exakte Vorschauen, Intent-Chips und Startwahl funktionieren; Pan, Action Framing und kontextuelles Onboarding fehlen. |
| Schiffe und Environment | 67 % | Vier eigenständige Silhouetten, dauerhafte Teammarker, sichtbare Mounts, hochauflösender Nebula-Layer und erstes regelrelevantes Terrain sind integriert; Tiefenstaffelung und Damage States fehlen. |
| Combat-HUD, VFX und Audio | 52 % | Planungs-/Ausführungszustände, Intent-Layer, eigene Icons, Arcs, Projektile, Hardpoints und Trefferfeedback existieren; finale Materialtiefe, Choreografie und Audio fehlen. |
| Results, Shipyard und Progression | 15 % | Startschiffwahl, zwei Flaggschiff-Module und Refit-Vorschau existieren; Belohnung, tatsächliches Ausrüsten und Save fehlen. |
| Officers und detaillierte Crew | 0 % | Bewusst außerhalb des Vertical-Slice-Scopes, bis der Kernloop nachweislich trägt. |

Damit liegt der **aktuelle Combat Slice bei ungefähr 60–65 % des Präsentationsniveaus des Kampf-Mockups**. Über alle drei Konzeptbilder liegt das Produkt bei ungefähr **35–40 %**, weil ein echter Shipyard und Crew weiterhin erhebliche zusätzliche Produktbreite darstellen. Der wichtigste Befund bleibt: Die technische und spielerische Grundlage ist weiter als die sichtbare Präsentation.

## Aus direktem Mobile-Feedback bereits geschlossen

| Beobachtung | Umsetzung | Restgrenze |
|---|---|---|
| Phone-Breite blieb ungenutzt | dynamische Vollbreiten-Shell, Safe Areas und Phaser-Resize | Desktop bleibt bewusst auf 620 px fokussiert |
| kein Fullscreen | Fullscreen-API, Web-App-Manifest und erklärter iOS-/Home-Screen-Fallback | iPhone-Safari kann Web-Apps je nach Plattform weiterhin auf den installierten Home-Screen-Modus beschränken |
| Zoom wurde beim Vergrößern unscharf | 80–180 % über Buttons/Mausrad und echtes Zwei-Finger-Pinch; bis 2× HiDPI und 1024×1536-Environment | Zwei-Finger-Pan und Action Framing stehen noch aus |
| HUD zu rudimentär | größere Hierarchie, eigene SVG-Icons, AP-/Energiekosten, Planungsstatus, Beat-Zähler und auffällige Intent-Chips | Materialtiefe, Motion States und kontextuelles Onboarding fehlen |
| kein Einstieg/Startschiff | Hauptmenü, zwei Startschiffe und zwei spielwirksame Flaggschiff-Module | echte Flottenzusammenstellung ist Hebel 4 |
| Waffen nicht ausreichend sichtbar | Mount-Marker auf dem Schiff und Loadout-Chips im Menü | austauschbare Waffenmodelle und Varianten sind Hebel 3 |
| Torpedos verfehlen/werden zufällig abgefangen | alle Treffer deterministisch, keine versteckte Interception, Reichweite verändert exakten Schaden | sichtbare aktive Point-Defense bleibt spätere Waffen-/Systemoption |
| Kampf zu tanky und zäh | 30–40 % weniger Effective Health, stärkere Waffen, ein Befehl pro Beat, keine passive Schildregeneration | Time-to-Kill und Energiekurve müssen mit echten Spielern validiert werden |
| Positionierung wird nach Kontakt irrelevant | offene Gegnerpläne, gleichzeitige Ausführung, gebrochene Feuerlösungen, 52 Units Drift und 25-%-Nebel-Cover | gekrümmte Routen und weitere Terrain-Entscheidungen fehlen |
| Gegner im dunklen Bild schwer lesbar | hellerer Screen-Grade, rote Dauer-Outline, Formmarker, Statusleisten und Intent-Chips | Farbblind-/Kontrast-Preset bleibt Hebel 19 |

## Priorisierte Hebel

| # | Hebel | Warum er stark wirkt | Messbares Done |
|---:|---|---|---|
| 1 | Neuer Command-Beat-Playtest und Balance-Telemetrie | Der größte Designwechsel ist implementiert; jetzt muss beobachtet werden, ob sechs bis zehn Beats wirklich in drei bis fünf Minuten verständlich und spannend bleiben. | Fünf Mobile-Erstspieler; Beat-Zahl, Kampfzeit, ungültige Befehle, Time-to-Kill und subjektive Dynamik sind protokolliert und ausgewertet. |
| 2 | Gekrümmte Movement-Route und Facing-Ghost | Macht die zentrale taktische Entscheidung sofort lesbar und nähert sich direkt der stärksten Mockup-Idee. | Kurve, Wegpunkte, Ghost-Silhouette und Touch-Facing stimmen mit der tatsächlich ausgeführten Bewegung überein. |
| 3 | Zweiter HUD-Fidelity-Pass | Das neue System löst Lesbarkeit, Icon-Konsistenz und Planung, erreicht aber noch nicht die räumliche Dichte und Materialtiefe des Mockups. | Responsive Panel-Komposition, Status-Chips, Zielhierarchie, Motion States und Design Tokens sind über Menü, Combat und Dialoge konsistent. |
| 4 | Waffen-Choreografie als VFX-System | Gestaffelte Salven statt einzelner Effekte erzeugen wahrgenommene Produktionsqualität und machen die gemeinsame Ausführungsphase zum Höhepunkt jedes Beats. | Jede Waffenfamilie hat Charge, Launch, Travel, Impact und Aftermath mit Pooling. |
| 5 | Taktische Pan-Kamera mit Action Framing | Pinch-Zoom ist gelöst; Fokuswechsel und begrenztes Zwei-Finger-Pan machen große Schiffe körperlicher. | Zwei-Finger-Pan, Grenzen, Reset und automatischer Fokus bei Angriffen funktionieren ohne Fehlkommandos. |
| 6 | Präzise Feuergeometrie und Zielzustände | Reichweite, Arc, gültig/ungültig und Kollateraleffekt müssen ohne Textsuche erkennbar sein. | Jede Waffe besitzt eindeutig unterscheidbare Geometrie, Farbcodierung, Zielmarke und Fehlergrund. |
| 7 | Lokale Treffer- und Damage-Reaktionen | Wirkung entsteht am Ziel, nicht nur am Projektil. | Shield-Ripple, Hull-Flash, Funken, Trümmer, kritischer Zustand und dezenter Camera Impulse sind klar abgestuft. |
| 8 | Taktische Raumtiefe | Die erste Nebelzone beweist das Prinzip; Asteroiden, Wracks und weitere Ebenen sollen Maßstab geben, ohne Ziele zu verdecken. | Drei Tiefenebenen, sichere Kontrastzonen und zwei klar unterscheidbare regelrelevante Terrain-Elemente sind integriert. |
| 9 | Austauschbare Waffen und sichtbare Modelle | Mehr Waffen sind nur wertvoll, wenn Daten, Mount, Silhouette, Arc, VFX und Upgrade gemeinsam wechseln. | Mindestens fünf Waffenfamilien; Ausrüsten verändert Ship-Art-Mounts, Werte, Vorschau und Kampfchoreografie. |
| 10 | Originales Audio mit sauberem Mobile-Unlock | Audio ist der schnellste Multiplikator für Gewicht, Bestätigung und Markenidentität. | Musik-, UI-, Weapon- und Impact-Busse, Varianten, Mute/Volume und suspend/resume sind getestet. |
| 11 | Kontextuelles First-Battle-Onboarding | Die Regeln sind vorhanden, werden aber noch nicht im Entscheidungsmoment erklärt. | Der erste Kampf lehrt Intent, Auswahl, Bewegung/Facing, Arc, Prognose und Beat ohne separates Handbuch. |
| 12 | Mission Results als Loop-Abschluss | Ein hochwertiges Spiel braucht Konsequenz und einen klaren Übergang aus dem Kampf. | Ergebnis, Kennzahlen, Credits/Salvage und Weiter/Retry sind vollständig spielbar. |
| 13 | Funktionaler Shipyard mit drei Trade-offs | Die Refit-Vorschau wird erst wertvoll, wenn Ausrüstung echte Kampfentscheidungen verändert. | Drei Upgrade-Pfade sind kaufbar, ausrüstbar, sichtbar und zeigen Vorher/Nachher. |
| 14 | Versionierte Persistenz | Fortschritt und Settings müssen Releases überleben. | LocalStorage-Schema, Migration, Reset und korrupter-Save-Fallback sind getestet. |
| 15 | Zweite Mission mit Terrainziel | Eine zweite Situation beweist, dass der Combat Core ein Spielsystem und kein Demo-Skript ist. | Andere Formation, mindestens ein Raumziel und ein neuer taktischer Lösungsweg. |
| 16 | Intent- und positionsbewusste Gegner-KI | Die KI kündigt bereits einen validierten Befehl an, muss aber Spieler-Ausweichrouten und Nebel-Cover gezielter bewerten. | KI bewertet projizierte Route, Facing, Arc, Cover, Überleben und Fokusziel deterministisch und testbar. |
| 17 | Performance- und Ladebudgets | Hochwertige Assets dürfen Mobile-Startzeit und stabile Framerate nicht zerstören. | Definierte JS-/Asset-Budgets, Atlanten, Lazy Loading und 30/60-fps-Qualitätsstufen auf Zielgeräten. |
| 18 | Visual Regression und Gerätematrix | UI- und VFX-Polish benötigt reproduzierbare visuelle Abnahme. | Golden Screens für 390×844, kleines Android, großes iPhone und Desktop laufen als Review-Artefakt. |
| 19 | Accessibility-, Settings- und Content-Gates | Qualität braucht lesbare Zustände und sichere Datenpipelines. | Reduced Motion, Contrast, Lautstärke, Touch-Ziele, Definitionen, Rechte, Hardpoints und Budgets sind prüfbar. |
| 20 | Externer Release-Validierungstest | Der frühe Beat-Test aus Hebel 1 prüft das Design; vor Release muss der komplette Combat→Reward→Shipyard-Loop erneut ohne Betreuung bestehen. | Mindestens fünf neue Erstspieler; Abschlussrate, Fehlklicks, Abbruchpunkte und Feedback des vollständigen Slice sind ausgewertet. |

## Empfohlene Produktionsreihenfolge

1. **Command-Beat validieren und Combat-Fidelity erhöhen:** Hebel 1–9.
2. **Feel und Verständlichkeit:** Hebel 10–11.
3. **Geschlossener Vertical Slice:** Hebel 12–16.
4. **Release-Härtung:** Hebel 17–20.

Officers und detaillierte Crew bleiben danach ein möglicher Ausbau. Sie jetzt vorzuziehen würde viel Oberfläche schaffen, aber weder den Kampf noch den entscheidenden Combat→Reward→Shipyard-Loop beweisen.
