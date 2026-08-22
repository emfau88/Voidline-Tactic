# Fleet Corridors – Validierung und kritische Bewertung

Stand: 22. August 2026  
Build: Map-first Mobile Redesign nach `eaec20e`

## Urteil

Der Pivot ist als spielbarer Proof of Concept technisch gelungen: Drei Korridore beeinflussen Bewegung und Feuerlösungen, zwei gleichzeitige Ziele verändern die Versorgung, Verstärkungen sind begrenzt, die Gegner-KI reagiert strategisch und der Spieler führt autonome Routengruppen statt ein Schiff per Joystick zu lenken. Das Match endet zuverlässig nach der Vernichtung eines Command Ships.

Der Stand ist noch kein hochwertiger Vertical Slice. Lesbarkeit und Makro-Loop sind belastbar; audiovisuelle Wirkung, Balance, Audio, Tutorialisierung und Content-Tiefe liegen sichtbar darunter.

## Automatischer 100-Match-Test

| Kennzahl | Ergebnis | Bewertung |
|---|---:|---|
| abgeschlossene Matches | 100/100 | stabil |
| Median Gesamtdauer | 204 s | im Zielkorridor 3–6 Minuten |
| P90 Gesamtdauer | 297 s | kein systemischer Endloskampf |
| erster Verlust, Median | 37 s | früher sichtbarer Einsatz |
| Spielersiege | 84 % | zu leicht; nächster Balancehebel |
| Objective Captures | 167 | Ziele werden tatsächlich umkämpft |
| Deployments | 1.166 | Versorgung wird aktiv umgesetzt |
| Fähigkeiten | 12.899 | Kampfsysteme greifen regelmäßig |
| maximale Schiffe | 14 | harte Grenze 7 pro Seite eingehalten |

## Drei Strategien

### 1. Direkter Mitteldruck

- 34/34 abgeschlossen
- Median: 122 s
- Stärke: kürzester Weg zum Command Ship
- Risiko: aktuell zu effizient; Spieler kann Seitensysteme häufig ignorieren

### 2. Oberes Relais

- 33/33 abgeschlossen
- Median: 215 s
- Stärke: bessere Versorgung und nachhaltiger Flottenaufbau
- Trade-off: längerer Weg, mehr Zeit für gegnerischen Druck

### 3. Untere Werft / Nebel

- 33/33 abgeschlossen
- Median: 204 s
- Stärke: schnellerer Nachschub und defensive Nebelzone
- Trade-off: Flanke bindet Kräfte abseits des gegnerischen Command Ships

Die Strategien erzeugen messbar verschiedene Zeitprofile. Das ist ein gutes Signal, aber noch kein Beweis gleichwertiger Entscheidungen: Center Push benötigt entweder mehr Risiko, während Relais und Werft kurzfristiger spürbare Vorteile brauchen.

## Mobile- und Browser-Gates

- 18/18 E2E-Läufe auf 844×390, 667×375 und Desktop
- Canvas belegt 100 % der Viewport-Breite und -Höhe; kein reservierter Bottom-Streifen
- Startansicht unter 15 % persistenter HUD-Fläche und mit höchstens fünf sichtbaren Controls
- Command-Pod ist kontextuell und minimiert nach einem Befehl auf 220×38 px
- Telemetrie und Ability-Pod erscheinen ausschließlich nach direkter Schiffsauswahl
- Deployment und Ansichtsoptionen sind temporäre Popover und überlappen die Karte nicht dauerhaft
- vier optionale Einzelaktionen mindestens 44×44 CSS-Pixel
- Routengruppen-Haltungen, Deployment, Pause, Hilfe und Pinch-Zoom verifiziert
- freie Kamera kehrt nicht automatisch zum Flaggschiff zurück

## Verständlichkeit

Erreicht:

- deutsche Alltagssprache statt Heading-/Steering-Terminologie
- klare Reihenfolge: Routengruppe wählen → Verhalten vorgeben → Versorgung einsetzen
- Haltung gilt standardmäßig für alle eigenen Schiffe der Route
- Schiffe navigieren, wählen Ziele, wenden und feuern autonom
- Einzelwahl ist als optionaler Fokus-/Systempfad gekennzeichnet
- kurze kontextuelle Einführung und ausführliche Hilfe

Offen:

- fünf externe Erstspieler müssen den Loop ohne Erklärung testen
- Niederlagenursache und Routendruck benötigen bessere Nachkampf-Metriken
- Relay-/Shipyard-Nutzen sollte direkt am Objective als Rate/Bonus visualisiert werden
- die Verlegung eines einzelnen Schiffs ist funktional, aber noch kein eleganter Gruppen-Transfer

## Technische Risiken

1. `FleetCombatScene` orchestriert weiterhin viel VFX-/Input-Code; Audio und mehr Effekte brauchen eigene Controller/Pools.
2. Command Ships nutzen für die Zielzeit stark erhöhte Lebenspunkte. Die UI zeigt bewusst Prozentwerte, die Balance sollte aber später über Armor, Support und Phasen statt reine HP entstehen.
3. 84 % Spielersiege und 122-s-Center-Push zeigen eine zu schwache strategische Gegnerantwort.
4. Deployments sind häufig; ohne stärkere Rollenlesbarkeit kann das spätere 7v7 visuell unruhig werden.
5. Die vorhandene Legacy-Kampagne bleibt im Repository, ist aber nicht mehr aktive Runtime. Sie muss vor Release entfernt oder klar archiviert werden.

## Freigabe

Freigegeben als **spielbarer Fleet-Corridors-PoC**. Nicht freigegeben als Vertical Slice oder Balancing-Benchmark. Der nächste Pass muss zuerst Center-Risiko, Objective-Feedback, Audio-/VFX-Wirkung und externe Verständlichkeit verbessern, bevor neue Missionen oder Meta-Systeme wachsen.
