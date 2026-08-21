# Die nächsten 20 Top-Hebel

Stand: 21. August 2026

Dieses Dokument übersetzt die drei Konzeptbilder in eine priorisierte Produktionsfolge. Ziel ist nicht, deren konkrete Gestaltung oder mögliche fremde IP zu kopieren. Ziel ist dieselbe Qualität bei Informationshierarchie, taktischer Lesbarkeit, räumlicher Tiefe und Feedback – in der eigenständigen abyssal-nautischen Bildsprache von Voidline Tactics.

## Ehrliche Standortbestimmung

Die Prozentwerte sind Arbeitswerte, keine mathematische Messung. Sie bewerten Funktionsabdeckung, visuelle Reife, Verständlichkeit und technische Robustheit gemeinsam.

| Bereich | Stand | Begründung |
|---|---:|---|
| Kampfregeln und spielbarer Flow | 70 % | Der 2-gegen-2-Kampf ist durchgängig spielbar, deterministisch getestet und hat gemeinsame Regeln für UI und KI. |
| Mobile Verständlichkeit | 65 % | Große Touch-Ziele, Vorschauen, Hilfe und klare Ressourcen funktionieren; kontextuelles Onboarding und feinere Priorisierung fehlen. |
| Schiffe und Environment | 55 % | Vier eigenständige Silhouetten und der Nebula-Layer sind integriert; Asteroiden, Tiefenstaffelung und Damage States fehlen. |
| Combat-HUD, VFX und Audio | 35 % | Grundlegende Arcs, Projektile, Hardpoints und Trefferfeedback existieren; Choreografie, Icon-System, Audio und finales Polish fehlen. |
| Results, Shipyard und Progression | 10 % | Die Datenbasis ist vorbereitet, aber der Meta-Loop ist noch nicht als spielbare Oberfläche vorhanden. |
| Officers und detaillierte Crew | 0 % | Bewusst außerhalb des Vertical-Slice-Scopes, bis der Kernloop nachweislich trägt. |

Damit liegt der **aktuelle Combat Slice bei ungefähr 45 % des Präsentationsniveaus des Kampf-Mockups**. Über alle drei Konzeptbilder liegt das Produkt bei ungefähr **25–30 %**, weil Shipyard und Crew eine erhebliche zusätzliche Produktbreite darstellen. Der wichtigste Befund: Die technische und spielerische Grundlage ist weiter als die sichtbare Präsentation.

## Priorisierte Hebel

| # | Hebel | Warum er stark wirkt | Messbares Done |
|---:|---|---|---|
| 1 | Gekrümmte Movement-Route und Facing-Ghost | Macht die zentrale taktische Entscheidung sofort lesbar und nähert sich direkt der stärksten Mockup-Idee. | Kurve, Wegpunkte, Ghost-Silhouette und Touch-Facing stimmen mit der tatsächlich ausgeführten Bewegung überein. |
| 2 | Präzise Feuergeometrie und Zielzustände | Reichweite, Arc, gültig/ungültig und Kollateraleffekt müssen ohne Textsuche erkennbar sein. | Jede Waffe besitzt eindeutig unterscheidbare Geometrie, Farbcodierung, Zielmarke und Fehlergrund. |
| 3 | Waffen-Choreografie als VFX-System | Gestaffelte Salven statt einzelner Effekte erzeugen wahrgenommene Produktionsqualität. | Broadside, Lance und Torpedo haben je Charge, Launch, Travel, Impact und Aftermath mit Pooling. |
| 4 | Lokale Treffer- und Damage-Reaktionen | Wirkung entsteht am Ziel, nicht nur am Projektil. | Shield-Ripple, Hull-Flash, Funken, Trümmer, kritischer Zustand und dezenter Camera Impulse sind klar abgestuft. |
| 5 | Konsistentes HUD-Komponentensystem | Neun-Slice-Panels, Zustände und Abstände bringen alle Screens auf ein gemeinsames Qualitätsniveau. | Tokens für Farbe, Typografie, Radius, Rahmen und State sind dokumentiert und in Combat-HUD/Dialogs verwendet. |
| 6 | Eigenes Icon- und Typografie-Set | Provisorische Unicode-Symbole brechen die visuelle Glaubwürdigkeit. | Alle Kernaktionen besitzen originale, lizenzdokumentierte SVG-Icons und lesbare Mobile-Typografie. |
| 7 | Taktische Raumtiefe | Asteroiden, Wracks und Nebelzonen geben Maßstab und Komposition, ohne Ziele zu verdecken. | Drei Tiefenebenen, sichere Kontrastzonen und mindestens ein regelrelevantes Terrain-Element sind integriert. |
| 8 | Taktische Kamera | Fokuswechsel und kontrolliertes Zoomen machen Treffer und große Schiffe körperlicher. | Mobile Pinch/Pan und automatisches Action Framing funktionieren, während DOM-HUD und Input stabil bleiben. |
| 9 | Originales Audio mit sauberem Mobile-Unlock | Audio ist der schnellste Multiplikator für Gewicht, Bestätigung und Markenidentität. | Musik-, UI-, Weapon- und Impact-Busse, Varianten, Mute/Volume und suspend/resume sind getestet. |
| 10 | Kontextuelles First-Battle-Onboarding | Die Regeln sind vorhanden, werden aber noch nicht im Entscheidungsmoment erklärt. | Der erste Kampf lehrt Auswahl, Bewegung/Facing, Arc, Prognose und Runde ohne separates Handbuch. |
| 11 | Mission Results als Loop-Abschluss | Ein hochwertiges Spiel braucht Konsequenz und einen klaren Übergang aus dem Kampf. | Ergebnis, Kennzahlen, Credits/Salvage und Weiter/Retry sind vollständig spielbar. |
| 12 | Shipyard-MVP mit drei Trade-offs | Das zweite Mockup wird erst wertvoll, wenn Ausrüstung echte Kampfentscheidungen verändert. | Drei Upgrade-Pfade verändern Werte und Hardpoints, zeigen Vorher/Nachher und sind reversibel testbar. |
| 13 | Versionierte Persistenz | Fortschritt und Settings müssen Releases überleben. | LocalStorage-Schema, Migration, Reset und korrupter-Save-Fallback sind getestet. |
| 14 | Zweite Mission mit Terrainziel | Eine zweite Situation beweist, dass der Combat Core ein Spielsystem und kein Demo-Skript ist. | Andere Flottenaufstellung, mindestens ein Raumziel und ein neuer taktischer Lösungsweg. |
| 15 | Positionsbewusste Gegner-KI | Die KI soll Feuerwinkel planen statt nur das nächste gültige Kommando wählen. | KI bewertet Route, Facing, Arc, Überleben und Fokusziel deterministisch und testbar. |
| 16 | Performance- und Ladebudgets | Hochwertige Assets dürfen Mobile-Startzeit und stabile Framerate nicht zerstören. | Definierte JS-/Asset-Budgets, Atlanten, Lazy Loading und 30/60-fps-Qualitätsstufen auf Zielgeräten. |
| 17 | Visual Regression und Gerätematrix | UI- und VFX-Polish benötigt reproduzierbare visuelle Abnahme. | Golden Screens für 390×844, kleines Android, großes iPhone und Desktop laufen als Review-Artefakt. |
| 18 | Accessibility- und Settings-Pass | Lesbarkeit ist Teil der Qualität, nicht ein später Zusatz. | Reduced Motion, Contrast, Color-safe States, Textgröße, Lautstärke und Touch-Ziele sind prüfbar. |
| 19 | Content- und Asset-Validierung | Mehr Schiffe und Upgrades dürfen keine stillen Präsentationsfehler erzeugen. | Schema-/Test-Gates prüfen Definitionen, Runtime-Dateien, Rechte, Hardpoints und Größenbudgets. |
| 20 | Externer Verständlichkeits- und Balance-Test | Interne Tests finden keine falschen Annahmen echter Erstspieler. | Mindestens fünf Erstspieler; Time-to-first-valid-action, Fehlklicks, Abbruchpunkte und Feedback sind ausgewertet. |

## Empfohlene Produktionsreihenfolge

1. **Combat-Fidelity-Pass:** Hebel 1–8.
2. **Feel und Verständlichkeit:** Hebel 9–10.
3. **Geschlossener Vertical Slice:** Hebel 11–15.
4. **Release-Härtung:** Hebel 16–20.

Officers und detaillierte Crew bleiben danach ein möglicher Ausbau. Sie jetzt vorzuziehen würde viel Oberfläche schaffen, aber weder den Kampf noch den entscheidenden Combat→Reward→Shipyard-Loop beweisen.
