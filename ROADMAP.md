# Voidline: Farhaven — Produkt-Roadmap

Stand: 27. August 2026
Status-Legende: ✅ fertig · 🚧 in Arbeit · ⬜ geplant · 🧪 validieren

### Aktueller Arbeitsblock — Stand 30. August 2026

Der [Plan für den ersten Kampf- und Fortschrittsbogen](docs/planning/FIRST_COMBAT_EXPERIENCE_PLAN.md) konkretisiert die nächsten Schritte: gemeinsame Projektil-/Trefferregeln → ein gutes Glutkutter-Gefecht → freie Fortschrittswahl und erste Rail-Lanze → vollständige UX-/Geräteprüfung → Erstspielertests. **Bulk A ist implementiert und intern geprüft:** echte Einschläge, ausweichbare Geschosse, physisches freies Feuer und Save-Kompatibilität. Bulk B (Kampfgefühl/Zielhilfe) ist als Nächstes offen. Weitere Content- und Stationsausbauten werden während dieses Blocks zurückgestellt. Ältere Zielwerte wie der feste Kampfanteil sind bis zur Auswertung der Tests keine verbindliche Abnahme dieses Blocks.

## 1. Zielbild

Ein Mobile-first-Singleplayer-Space-Explorer in 2D: Der Spieler wählt ein Schiff, fliegt frei durch zusammenhängende Sektoren, scannt unbekannte Signale, birgt Wracks, baut Rohstoffe ab, entdeckt Kontakte und entscheidet selbst, ob er Kämpfe eingeht. Jede Rückkehr lässt Farhaven und das eigene Schiff sichtbar wachsen.

Der Kernloop lautet:

> Rausfliegen → entdecken → sammeln oder konfrontieren → Beute heimbringen → Farhaven und Schiff verbessern → weiter hinausfliegen

### Nicht verhandelbare Leitplanken

- Exploration ist wichtiger als Dauercombat; Kampf bleibt überwiegend optional.
- Kein Treibstoff-Timer: Freies Fliegen wird nicht künstlich begrenzt.
- Direkte, leicht träge Schiffssteuerung auf Touch und Desktop.
- Farhaven ist die begehbare Hauptnavigation, kein Kachelmenü vor einer Kulisse.
- Upgrades verändern Werte **und** die sichtbare Form von Schiff beziehungsweise Station.
- Mobile Queransicht ist der primäre Layout-Test; Desktop bleibt vollwertig.
- Visuell: lesbares, warmes „cozy grimdark“ statt reiner Finsternis oder generischer Sci-Fi.
- Die ersten zehn Minuten müssen ohne Erklärung von außen verständlich sein.

## 2. Erfolgsmaßstab für den ersten spielbaren Ausschnitt

Der Vertical Slice gilt als tragfähig, wenn ein neuer Spieler in etwa zehn Minuten:

1. eines von zwei Schiffen wählt,
2. in Farhaven das nächste Ziel versteht,
3. selbst in einen Sektor fliegt und ein unbekanntes Signal scannt,
4. ein Wrack birgt und versteht, welche Ressource er erhalten hat,
5. mit gesicherter Fracht zurückkehrt,
6. den Hangar sichtbar an Farhaven anbaut,
7. ein erstes echtes Schiffsmodul installiert,
8. eine Erzader aktiv abbaut,
9. einen Gegner freiwillig auswählt und mindestens eine Waffe abfeuert,
10. einen Hinweis auf einen weiter entfernten Sektor oder ein besonderes Geheimnis entdeckt.

## 3. Produktions-Roadmap

### M0 — Technische Grundlage

- ✅ Persistentes Profil, Entwickler-Reset und gespeicherte Expedition
- ✅ Zwei wählbare Startschiffe mit korrekten Namen und Vorschauen
- ✅ Direkte Touch-, Maus- und Tastatursteuerung mit Trägheit
- ✅ Kamera-Zoom, Pinch-Zoom, 15%-Mobile-Startzoom und konsistente Auflösung
- ✅ Frachtraum-Limit und Niederlage bei null Hülle
- ✅ Test-Prototypen von echten, speicherbaren Upgrades getrennt
- ✅ Automatisierte Unit-, Browser- und Produktions-Build-Prüfungen
- ✅ Versionsmigration von Profilständen 2–4 auf Profilversion 5
- ⬜ Fehlertelemetrie für öffentliche Testversionen

### M1 — Die ersten zehn spielbaren Minuten

- ✅ Schiffswahl → erste Expedition → Wrack → Rückkehr
- ✅ Hangar als erstes sichtbares Farhaven-Modul
- ✅ Gewähltes Schiff am Notdock sichtbar; Hangar als verständliche erste Heimkehr-Belohnung mit Dock- und Einflugmoment
- ✅ Zweite Expedition mit Daten, Relikt und Erzader
- ✅ Erster echter Einbau: Minenlaser
- ✅ Aktiver Rohstoffabbau und begrenzter Frachtraum
- ✅ Farhaven als modulare Top-down-Station mit echten Bauzuständen
- ✅ Klare Modulzustände: gebaut, baubar, gesperrt
- ✅ Ruhige Station ohne permanente UI-Pulsanimationen
- ✅ GitHub-Pages-sichere Schiffsbilder und sichtbare echte Einbauten in der mobilen Werkstatt
- ✅ Mobile Expeditionshinweise liegen dezent an den Rändern statt übereinander in der Kartenmitte, mit antippbarem Scan-Kompass und Live-Distanz
- ✅ Künftige Farhaven-Module bleiben als ruhige, physisch angedockte Vorschau erkennbar
- ✅ Einheitliche Ressourcensprache mit vollständigen Namen und eigenen ImageGen-Icons
- ✅ Dieselben Ressourcen-Icons auf Expeditionen, in Fracht und bei Preisen
- ✅ Verständliche Hinweise, wo Ressourcen gefunden und wofür sie verwendet werden
- ✅ Allgemeine Richtungshinweise für bis zu drei klassifizierte Funde mit Ressource, Menge, Entfernung, Risiko und Werkzeug
- ✅ Sicherer oder schneller Datenweg in der zweiten Expedition
- ✅ Wiederholbarer Bergungsflug nach Abschluss der verlorenen Route
- 🧪 Ersten Zehn-Minuten-Ablauf mit neuen Spielern ohne Hilfestellung testen
- ⬜ Reibungspunkte aus mindestens drei Tests beheben

### M2 — Exploration, die Geschichten erzeugt

- ✅ Scanbare Echos mit Zuständen: unbekannt, klassifiziert, aufgelöst
- ✅ Wracks, Adern, Anomalien und Notsignale als unterschiedliche Fundtypen
- ✅ Erster Handlungsbogen „Die verlorene Versorgungsroute“: alle Kernfunde im Aschsaum führen zum Xenogate
- ✅ Übungsdummies aus dem normalen Sektor entfernt; optionaler Aschenplünderer ist der erste echte Gegner
- ✅ Wurmloch und erste Platzhalter-Region „Veloria Rift“
- 🚧 Veloria Rift als zweiten Spielraum mit sechs Funden, neutralem Kontakt und optionalen Wächtern ausarbeiten
- 🚧 12–15 kurze Entdeckungsereignisse mit kleinen Entscheidungen
- ✅ Persistentes Fundprotokoll im Sternenwerk für heimgebrachte Entdeckungen
- ⬜ Scanner-Upgrades eröffnen neue Signalebenen statt nur größerer Reichweite
- ✅ Erste neutrale Begegnung: schlafender Veloria-Pilger
- ⬜ Seltene Landmarke und ein sektorweites Geheimnis
- ⬜ Wiederholbare, aber kuratierte Sektorvarianten

### M3 — Sichtbare Schiffsprogression

- ✅ Modulares Testschiff und visuelle Upgrade-Prototypen
- ✅ Sechs funktionale Kern-Einbauten im Hangar getrennt von Studien
- ✅ Sechs hochwertige, rumpspezifische Montage-Layer für Aster Vale und Bramble
- ⬜ Zwei klar unterschiedliche Schiffsklassen spielmechanisch differenzieren
- 🚧 Waffen, Greifer, Scanner, Frachtraum und Triebwerke mit eigenem VFX (Waffen, Greifer, Laser und Scanimpuls vorhanden; Montage- und Frachtrücken-VFX folgen)
- ⬜ Rumpfvergrößerung über echte Zwischenstücke und passende Silhouetten
- ⬜ Einbauvorschau mit Vorher/Nachher und eindeutigen Anschlussstellen
- ⬜ Loadout-Grenzen für verständliche Entscheidungen statt Upgrade-Chaos
- ⬜ Reparatur, Hülle und Systemenergie klar voneinander lesbar machen

### M4 — Freiwilliger, spektakulärer Kampf

- ✅ Ziele direkt in der offenen Karte antippbar
- ✅ Manuelles Feuern während der Bewegung
- ✅ Passive, wiederkehrende Testdummies nur im getrennten Testscenario; keine Attrappen im Storysektor
- ✅ Prototypen für Breitseite, Rail-Lanze, Torpedo und Energiekugel
- ✅ Waffenrollen, Reichweiten, getrennte Cooldowns und Trefferfeedback als erster balancierbarer Stand
- ✅ Gegnertelegraphen und Ausweichfenster statt überraschender Soforttreffer
- ✅ Glutkutter als Flankenjäger und Reliquienwächter als ortsfester Raumkontroll-Gegner
- ⬜ Enterhaken/Bergungsentscheidung als seltene Nahkampfoption
- ✅ Kampfzonen können umflogen und nach Alarm wieder verlassen werden
- ✅ Aschenkantor als besonderer Wächter mit Chorschild, eigenem Asset, einzigartiger Beute und kampfloser Breitband-Alternative
- ⬜ Zielwert validieren: Kampf unter etwa 30 % der normalen Spielzeit

### M5 — Farhaven als lebende, wachsende Heimat

- ✅ Warmer Kern mit organisch angedocktem Hangar, Scanner, Labor und Sternenwerk
- ✅ Module erscheinen erst nach ihrem Bau physisch an der Station
- ✅ Direkte Modulinteraktion und kontextbezogene Raumansichten
- ✅ Spielerschiff fliegt sichtbar ein, schwebt am Notdock und öffnet per Antippen den Hangar
- ✅ Der antippbare Warmkern erklärt den Stationserhalt und die sichtbaren Anschlussplätze
- ⬜ Level-2-Ausbaustufen mit sichtbaren Formänderungen
- ⬜ Lager, Raffinerie, Werkstatt, Wohnbereich und Drohnenhub
- ⬜ Kleine Frachtdrohnen, Reparaturdrohnen und Dockverkehr als Ambient-Leben
- ✅ Bau-Moment mit Modulanflug, Schiffsandocken und kurzer Einweihungsanimation
- ⬜ Station zeigt zurückgebrachte Fracht und aktuelle Arbeiten sichtbar
- ⬜ Späte Silhouette: vom beschädigten Außenposten zur Raumfestung
- ⬜ Stationslayout auf kleinen Querformaten mit echten Geräten prüfen

### M6 — Ökonomie und Progressionsnetz

- ✅ Drei Kernressourcen: Legierungen, Daten und Relikte
- ✅ Ressourcen haben konsistente Quellen und erste konkrete Verwendungen
- ✅ Wiederholbare Quellen für Legierungen, Daten und Relikte nach dem Prolog
- ⬜ Raffinerie verwandelt Rohfunde in gezielte Baumaterialien
- ⬜ Kostenkurve für die ersten 30 Minuten simulieren und testen
- ✅ Hangar, Scannerkapelle, Reliktlabor und Sternenwerk verändern Expeditionen oder Sektorzugang
- ✅ Keine Sackgassen: Mindestressourcen bleiben erneut beschaffbar
- ⬜ Seltene Funde dienen Entdeckung und besonderen Systemen, nicht Grind
- ⬜ Händler als freiwilliges Ventil gegen ungünstige Fundverteilung

### M7 — Welt, Fraktionen und mittelfristiger Content

- ⬜ Eine Piratenfraktion mit erkennbarer visueller Sprache
- ⬜ Eine neutrale Fraktion und ein wiederkehrender Kontakt
- ⬜ Ein fremdartiges Volk in der Veloria Rift
- ⬜ Fraktionsbeziehungen durch Begegnungen, nicht durch Tabellenarbeit
- ⬜ Drei ausgearbeitete Sektoren mit eigener Stimmung und Ressourcenmischung
- ⬜ Riesiges Alienwesen oder vergleichbare „Wow“-Entdeckung
- ⬜ Begleiter, Flotten und Stationsangriffe erst nach validiertem Kernloop prüfen

### M8 — Präsentation, Audio und Veröffentlichung

- ✅ Erste Map-Sprache: Story-Fundorte und das Xenogate sind als freigestellte Spielobjekte statt als Code-Marker lesbar
- ⬜ Finale Map-Sprache: Hintergrunddeko, Interaktionen und seltene Funde klar trennen
- ⬜ Cohesive VFX-Sprache für Scan, Bergung, Abbau, Treffer und Sprung
- ⬜ Musikschichten für Farhaven, ruhige Exploration, Gefahr und fremde Regionen
- ⬜ Eigenes SFX-Set mit guter Wiedergabe auf Mobilgeräten
- ⬜ Barrierearme Farben, skalierbarer Text und reduzierte Bewegung
- ⬜ Performance-Budget für ältere Mobilgeräte
- 🚧 PWA/Installierbarkeit und Offline-Grundverhalten; sichtbarer Farhaven-Startbildschirm und bedarfsorientiertes Asset-Laden sind umgesetzt
- ⬜ Save-Export/-Import und sichere Profilmigration
- ⬜ Öffentlicher Vertical-Slice-Build mit Feedbackkanal

## 4. Empfohlene Umsetzungsreihenfolge in Bulks

1. ✅ **Bulk A – Verständliche Ressourcen:** Namen, Icons, Quellen, Fracht und Preise durchgängig verbinden.
2. 🧪 **Bulk B – Zehn-Minuten-UX:** drei externe Tests, Sackgassen und unklare Ziele beseitigen.
3. 🚧 **Bulk C – Explorationstiefe:** Veloria-Grundraum, sechs Ereignisse, neutraler Kontakt und Fundprotokoll stehen; Entscheidungen und Sektorgeheimnis werden noch vertieft.
4. 🚧 **Bulk D – Sechs echte Schiffs-Upgrades:** organische Bauteile und Funktionen stehen; die Einbau- und passiven System-VFX werden noch vervollständigt.
5. 🧪 **Bulk E – Kampf-Vertical-Slice:** Feuerkorridore, Cooldowns, Audio/VFX, zwei Gegnerrollen und der optionale Aschenkantor stehen; jetzt Mobile-Balance und Kampfanteil mit Spielern validieren.
6. ⬜ **Bulk F – Farhaven Level 2:** sichtbare Upgrades und Ambient-Leben erst auf dem validierten Loop.
7. ⬜ **Bulk G – Polish/Release:** Audio, Lesbarkeit, Performance, Speicherung und Deployment.

## 5. Definition of Done pro Feature

Ein Feature ist erst fertig, wenn:

- es auf Desktop sowie 844×390 und 667×375 im Querformat verständlich ist,
- Touch und Maus/Tastatur funktionieren,
- es einen sichtbaren Zustand, Feedback und eine verständliche Folge hat,
- zentrale Regeln durch Unit- oder Browsertests abgesichert sind,
- Produktions-Build und GitHub-Deployment erfolgreich laufen,
- und es den Kernloop stärkt, statt nur zusätzliche Oberfläche zu erzeugen.

## 6. Bewusste Scope-Grenze

Fraktionen, Begleiter, große Flotten, mehrere Universen und Stationsüberfälle bleiben Teil der langfristigen Vision. Sie werden erst produziert, wenn der zehnminütige Vertical Slice nachweislich Spaß macht. Die Vision wird nicht gestrichen; ihre Reihenfolge wird geschützt.

## 7. Vertiefende Dokumente

- [`docs/planning/FARHAVEN_MODULAR_OUTPOST_PLAN.md`](docs/planning/FARHAVEN_MODULAR_OUTPOST_PLAN.md) — modulares Stationssystem
- [`docs/planning/FARHAVEN_OPTIONAL_COMBAT_PLAN.md`](docs/planning/FARHAVEN_OPTIONAL_COMBAT_PLAN.md) — freiwilliger Kampf
- [`docs/planning/FARHAVEN_PIVOT_PLAN.md`](docs/planning/FARHAVEN_PIVOT_PLAN.md) — ursprünglicher Pivot
- [`docs/planning/SHIP_MODULARITY_PLAN.md`](docs/planning/SHIP_MODULARITY_PLAN.md) — Schiffsbauteile
- [`docs/planning/PRODUCTION_PLAN.md`](docs/planning/PRODUCTION_PLAN.md) — Produktionsstand und Gates
