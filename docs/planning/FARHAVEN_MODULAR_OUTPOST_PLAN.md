# Farhaven – modularer Außenposten-Plan

Stand: 24. August 2026
Status: vorgeschlagen
Ziel: Farhaven soll sich wie ein sichtbarer, persönlicher Aufbau anfühlen – nicht wie ein Menü vor einem statischen Bild.

## Kurzentscheidung

Farhaven wird als **wachsendes 2D-Diorama aus festen Andockplätzen und aufrüstbaren Modulen** gebaut. Jede Einrichtung hat drei Dinge, die immer zusammenkommen:

1. **ein sichtbares Stationsmodul** im Überblick,
2. **eine eigene atmosphärische Detailansicht** beim Antippen,
3. **eine neue konkrete Spielmöglichkeit** in der nächsten Expedition.

Der Spieler baut also nicht bloß einen Zahlenwert von 1 auf 2 aus: Er sieht zuerst einen freien Anschluss, errichtet dort ein Modul, erlebt eine kurze Inbetriebnahme und kann den neuen Raum anschließend als kleinen Ort besuchen.

## Erlebnisziel

Die emotionale Reihenfolge nach einer Rückkehr lautet:

```text
Beute sichern → neuer Bauplatz wird möglich → Modul wird errichtet
→ Licht geht an / Maschinen starten → Detailraum entdecken
→ neue Fähigkeit in der nächsten Expedition einsetzen
```

Farhaven bleibt cozy-grimdark: dunkles Metall, gotische Formen und alte Technik, aber mit warmen Fenstern, kleinen Pflanzen, Werkzeug, funkelnden Leitungen und hilfreichen Wartungsdrohnen. Es ist ein Zuhause am Rand des Fremden, keine finstere Ruine.

## Aufbau des Dioramas

### Fester Kern

Der Kern ist von Beginn an sichtbar und erklärt die Karte:

- **Zentraler Andockring:** Heimkehr, Frachtentladung und später Trophäen.
- **Aster-Vale-Liegeplatz:** das eigene Schiff; Reparaturspuren und montierte Module werden hier sichtbar.
- **Vier klar erkennbare Anschlüsse:** zunächst verschlossen oder leer, später bebaubar.
- **Außenstreben:** reserviert für spätere, besondere Fundstücke und Sektor-Trophäen.

Die vorhandene Stationsillustration ist die Farb- und Formreferenz. Für die modulare Variante wird sie jedoch nicht mehr als ein unantastbares Vollbild behandelt: Kern, Anschlüsse und Module werden als getrennte Ebenen gezeichnet.

### Bauplätze und Einrichtungen

| Bauplatz | Einrichtung | Bildsprache | Gameplay-Folge |
|---|---|---|---|
| Unterer Dockarm | Hangar | breite Schleuse, Kran, warmes Werklicht | Reparatur, Loadout, Frachtraum und Utility-Slots |
| Linkes Seitenmodul | Reliktlabor | Glaskuppel, schwebende Fundstücke, Pflanzen | Relikte deuten, Anomalie-Optionen, Technologien |
| Rechtes Seitenmodul | Scannerkapelle | Antenne, blaues Glas, sanfte Impulse | Signale früher erkennen und besser einschätzen |
| Oberer Turm | Sternenwerk | Kartenprojektor, Navigationsfenster, Banner | neue Sektoren und sichere Routen |
| Äußerer Ring (später) | Raffinerie | kompakte Öfen, Rohre, amberfarbene Wärme | Rohfunde in Bauressourcen umwandeln |

Ein leerer Platz ist kein grauer Knopf: Er zeigt eine glaubwürdige verschlossene Schleuse, abgestellte Bauteile oder ein kleines Gerüst. Erst nach dem Bau ersetzt ein sichtbares Modul diesen Zustand.

## Detailansichten: der "Wow"-Moment

Ein Tipp auf ein gebautes Modul öffnet keine gewöhnliche Karte, sondern eine eigene kurze Szene als Fullscreen-Overlay. Der Außenposten bleibt im Hintergrund gedimmt sichtbar; der Raum wirkt wie ein Ort, nicht wie ein Menü.

### Gemeinsames Layout

```text
┌──────────────────────────────────────────┐
│  ← FARHAVEN / HANGAR        Level 2       │
│                                          │
│        illustrierte Detailansicht         │
│      (Diorama, kleine Animationen)        │
│                                          │
│  Status / Fund / neue Möglichkeit         │
│                                          │
│  [Kernaktion]  [Entdecken]  [Schließen]   │
└──────────────────────────────────────────┘
```

Auf kleinen Displays bleibt die Illustration der große Teil der Ansicht. Aktionen erscheinen als maximal drei große, klar beschriftete Tasten. Lange Tabellen sind ausdrücklich ausgeschlossen.

### Raumspezifische Inhalte

| Raum | Detailbild | Interaktive Entdeckungen | Hauptaktion |
|---|---|---|---|
| Hangar | Aster Vale auf einer Kranliege, Mechanikdrohne, warme Lampen | Schiff antippen: Schadensdetails; Modulsteckplätze; eingebrachte Trophäen | reparieren oder Modul montieren |
| Reliktlabor | sanft leuchtendes Fundstück hinter Glas, kleine Bibliothek | Fundstücke drehen/antippen; Analyseprotokolle; entdeckte Lore | Relikt analysieren |
| Scannerkapelle | große Antenne und Sternenkarte, pulsierende Signalfäden | freigeschaltete Signale/Sektoren; letzte Scan-Erkenntnis | Scan-System verbessern |
| Sternenwerk | Kartentisch und Fenster zum Sektor | erreichbare Sektoren; Routen und Sperren | Zielsektor wählen |
| Raffinerie | kompakte Schmelzöfen und Materialbehälter | Rohstoffproben; Rezept-Hinweise | Ressourcen verarbeiten |

Jede Ansicht bekommt mindestens ein rein atmosphärisches, antippbares Detail ohne Menüwert: z. B. eine Teetasse der Mechanikerin, ein summendes Gerät, ein seltsames Fundstück oder eine kleine Pflanze. Das erzeugt Entdeckung ohne Content-Overhead.

## Bau- und Aufwertungsablauf

### Zustand 0 – Leerer Anschluss

- sichtbare Schleuse/Gerüst, aber kein Raum
- Antippen erklärt in einem Satz, was hier entstehen könnte
- zeigt eindeutig Kosten und fehlende Voraussetzung
- keine "Upgrade fehlgeschlagen"-Toast-Meldung ohne Kontext

### Zustand 1 – Errichtet

- einmalige 1–2-sekündige Inbetriebnahme: Gerüst weg, Lichter gehen an, kurze Kamerafahrt/Pulseffekt
- Modul erscheint dauerhaft im Überblick
- Detailansicht wird freigeschaltet
- eine neue Expedition-Fähigkeit oder Auswahlmöglichkeit wird sofort erklärt

### Zustand 2 – Ausgebaut

- deutlicher, aber kein riesiger Ersatzbau: zusätzliche Antenne, Kran, Fenster, Leitung oder Seitentrakt
- ein neuer kleiner Blickfang in der Detailansicht
- neue Handlung statt nur eines Prozentbonus

### Zustand 3 – Signaturmodul (später)

- seltenes Relikt oder Sektorabschluss verändert eine Einrichtung individuell
- Beispiel: Eine geborgene Sternenorgel macht aus der Scannerkapelle einen einzigartigen Langstreckenscanner
- keine Pflicht für den ersten Vertical Slice; diese Stufe dient der langfristigen Persönlichkeit des Saves

## Visuelle Produktionsstrategie

### Ebenen statt eines einzelnen Hintergrundbildes

```text
FarhavenScene
  ├─ Sternfeld / Nebel (statisch, gedimmt)
  ├─ Stationskern
  ├─ Bauplatz-Schleusen und Gerüste
  ├─ errichtete Module je Bauplatz und Level
  ├─ Schiffs-Liegeplatz + sichtbare Aster-Vale-Upgrades
  ├─ Licht-, Partikel- und Dockingeffekte
  └─ dezente, positionsgebundene Textlabels
```

Die Klickfläche gehört zu der sichtbaren Modul-Silhouette. Es gibt keine Kreise, Pins oder frei im Bild schwebenden Menüpunkte. Text erscheint als kleines Stationsschild nur beim Hover/Fokus oder dauerhaft sehr dezent neben dem jeweiligen Modul.

### Asset-Scope für den ersten Ausbaupass

- 1 vereinfachter Stationskern als breite 2D-Illustration
- 5 modulare Einrichtungen × 2 sichtbare Ausbaustufen
- 5 Detailraum-Illustrationen
- 1 Gerüst-/Schleusen-Set, wiederverwendbar für alle Bauplätze
- 1 Satz kleine VFX: warme Fenster, Antennen-Puls, Schweißfunken, Dockinglicht
- 3–5 Trophäen/Fundstücke als Zusatzobjekte

Die Module müssen in Form, Höhe und Lichtfarbe schon bei kleiner Mobilauflösung erkennbar sein. Detailtexturen sind nachrangig gegenüber lesbaren Silhouetten.

## Technische Umsetzung

### Datenmodell

`FacilityLevel` wird vom reinen Zahlenwert zu einem Bauzustand erweitert:

```ts
type FacilityState = {
  id: FacilityId;
  level: 0 | 1 | 2 | 3;
  construction: 'empty' | 'ready' | 'building' | 'online';
  discoveredDetails: string[];
  installedRelic?: string;
};
```

Zusätzlich erhält das Profil `outpostTrophies`, `shipCosmetics` und `seenMoments`. So können erste Inbetriebnahmen nur einmal gezeigt und persönliche Fundstücke gespeichert werden.

### Präsentation

- `OutpostScene` zeichnet Kern, Bauplätze und vorhandene Module aus dem Save.
- `OutpostModuleView` kapselt Position, Hit-Area, Lichtzustand und Bauanimation eines Moduls.
- `FacilityDetailScene` oder ein DOM-Overlay stellt die Raumillustration und die drei maximalen Aktionen dar.
- `OutpostMomentController` spielt Bau-, Rückkehr- und Fund-Momente einmalig ab.
- Alle Kosten, Voraussetzungen und Freischaltungen bleiben im reinen Domain-Code und sind unit-testbar.

### Mobile-Regeln

- Bauplatz und Hauptaktion mindestens 44 × 44 CSS-Pixel.
- Ein Tippen öffnet erst den Raum; kein ungewollter Kauf direkt auf der Übersicht.
- Kaufen/Errichten erfordert eine klare zweite Aktion: `MODUL ERRICHTEN`.
- Animationsdauer maximal zwei Sekunden; jederzeit überspringbar.
- Die Übersicht bleibt auch ohne Text verständlich: leer, Baustelle, online und ausgebaut haben klar verschiedene Silhouetten.

## Reihenfolge der Umsetzung

### M1 – Übersicht glaubwürdig modular machen

1. Stationskern, vier Bauplätze und Gerüstzustände als getrennte Ebenen anlegen.
2. Bestehende Kreis-/Pin-Interaktion endgültig durch Modul-Hit-Areas ersetzen.
3. Hangar als erstes sichtbares Level-0/1/2-Modul umsetzen.
4. Rückkehrmoment und einmalige Bauanimation implementieren.

**Abnahme:** Ein neuer Spieler erkennt ohne Erklärung, dass der Hangar gebaut oder erweitert wurde.

### M2 – Ersten Ort spielbar machen: Hangar

1. Hangar-Detailansicht mit Aster Vale, Reparatur und Loadout bauen.
2. Ein echter Hangar-Ausbau schaltet einen sichtbaren zweiten Modulslot und mehr Frachtraum frei.
3. Der montierte Slot erscheint anschließend auch am Schiff in der Expedition.

**Abnahme:** Der Spieler baut im Hangar etwas und erkennt diese Verbesserung am Schiff im nächsten Flug wieder.

### M3 – Drei weitere Orte mit eigener Identität

1. Scannerkapelle: Signal- und Sektorentdeckung.
2. Reliktlabor: Fundstücke, Analyse und Lore.
3. Sternenwerk: Zielsektor und Routen.
4. Raffinerie erst ergänzen, wenn Rohstoffverarbeitung eine echte Entscheidung erzeugt.

**Abnahme:** Jede Einrichtung hat ein eigenes Bild, eine eigene Kernhandlung und mindestens eine sichtbare Veränderung pro Level.

### M4 – Persönlichkeit und langfristige Entdeckung

1. Trophäen aus Expeditionen an Außenstreben oder in Detailräumen platzieren.
2. Kleine interaktive Atmosphärendetails und kurze Rückkehr-Texte hinzufügen.
3. Seltene Signaturmodule durch besondere Relikte einführen.

**Abnahme:** Zwei Spielstände mit unterschiedlichen Entscheidungen sehen im Außenposten unterschiedlich aus.

## Nichtziele für diesen Pass

- kein frei platzierbares Baumenü mit Raster; die festen Anschlüsse sichern mobile Lesbarkeit und eine starke Komposition
- keine Bauzeit, keine Timer und keine Echtgeld-Beschleunigung
- kein Management von Bewohnern oder Produktionsketten
- keine leeren Detailräume: Ein Raum wird erst umgesetzt, wenn er mindestens eine Aktion, eine sichtbare Veränderung und ein Entdeckungsdetail besitzt

## Qualitätskriterien

- Ein Spieler kann im Überblick auf Anhieb zwischen leerem, gebautem und ausgebautem Modul unterscheiden.
- Jeder Ausbau hat vor und nach dem Kauf eine sichtbare Veränderung.
- Jede Einrichtung zeigt nach dem Antippen einen hochwertigen Raum statt einer abstrakten Upgrade-Liste.
- Jeder erste Bau schaltet innerhalb desselben Spielzyklus eine nutzbare Funktion frei.
- Farhaven wirkt wärmer und klarer als der Expeditionsraum, ohne seine gothic-sci-fi-Identität zu verlieren.

## Empfohlener nächster Produktionsschritt

Mit **M1 plus dem Hangar-Teil aus M2** beginnen. Der Hangar ist emotional am stärksten, weil Spieler dort ihre eigene Aster Vale sehen, Schäden beheben und die direkt vor ihnen liegende nächste Verbesserung montieren. Erst wenn dieser Ablauf "Beute → Hangarbau → sichtbares Schiffsupgrade" überzeugt, sollten die weiteren Räume produziert werden.
