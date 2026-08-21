# Art- und VFX-Richtung

## Ziel

Voidline Tactics soll wie ein eigenständiges, hochwertiges 2D-Taktikspiel wirken: schwere Kriegsschiffe, kalter leerer Raum, kontrollierte Energieeffekte und eine präzise militärische Oberfläche. Spektakel unterstützt Entscheidungen; es darf Feuerwinkel, Zielstatus oder geplante Bewegung niemals verdecken.

## Eigenständige visuelle Identität

Die Mockups sind nützlich, liegen aber zu nahe an bekannten Gothic-Sci-Fi-Motiven. Für die Produktionsfassung gelten deshalb folgende Leitplanken:

- keine übernommenen Fraktionsembleme oder unmittelbar wiedererkennbaren Aquila-/Imperium-Symbole
- keine direkte Kopie etablierter Schiffssilhouetten, Uniformen, Rangabzeichen oder UI-Ornamente
- weniger sakral-imperial, stärker **abgründig-nautisch und astronomisch**
- Voidline-Motiv: dunkle Rumpfplatten mit schmalen leuchtenden Gravitationsnähten, gebrochene Kreis-/Horizont-Symbole, kartografische Sternlinien
- Messing als Akzent, nicht als flächige Dekoration
- Fraktionen werden zuerst durch Silhouette, dann durch Material und zuletzt durch Farbe unterscheidbar

Vor kommerzieller Nutzung ist eine dokumentierte IP-/Trademark-Prüfung erforderlich.

## Lesbarkeitshierarchie

In dieser Reihenfolge muss der Spieler Informationen erfassen:

1. ausgewähltes Schiff und aktuelle Phase
2. Position, Facing, gültige Bewegung und Feuerwinkel
3. gültiges Ziel und erwarteter Effekt
4. Hull, Shield, AP und Energy
5. laufender Treffer- oder Schadenszustand
6. Atmosphäre und dekorative Details

## Farb- und Effektgrammatik

| Bedeutung | Primärfarbe | Einsatz |
|---|---|---|
| Spieler / Navigation | kühles Cyan-Blau | Auswahl, Pfad, Movement Range |
| Gültige Bestätigung | entsättigtes Grün | Facing-Griff, Confirm, positive Statusänderung |
| Gegner / Gefahr | tiefes Rot | Zielmarkierung, hostile arcs, kritische Warnung |
| Lance / Energiepräzision | Violett-Magenta | Beam, Ladezustand, Schildpenetration |
| Kinetik / Broadside | warmes Orange-Gold | Muzzle Flash, Tracer, Hull Impact |
| Torpedo | Amber-Weiß | Antrieb, Trail, Lock-on |
| Schild | elektrisches Blau | Bubble, Ripple, Absorption |
| Hull Critical | Orange zu Weiß | interne Brände, Funken, Explosion |

Farben erhalten zusätzlich Form, Richtung, Icon und Text; keine Mechanik darf ausschließlich über Farbe kommuniziert werden.

## Schiffs-Asset-Pipeline

Jede Klasse beginnt als klar lesbare True-Top-down-Silhouette. Mikrodetails werden erst ergänzt, nachdem Silhouette, Facing und Größenverhältnis bei Zielzoom funktionieren.

Pro Schiff werden gepflegt:

- hochauflösende, geschichtete Quelldatei mit eindeutiger Lizenz/Urheberschaft
- Base Color/Albedo mit transparentem Hintergrund
- Emissive-Maske für Triebwerke, Fenster, Waffenladung und Schadensfeuer
- Material-/Tint-Maske für Fraktionsvarianten
- optionale Normal Map nur dort, wo sie im tatsächlichen Zoom sichtbar hilft
- drei Damage Masks beziehungsweise Decal-Sets: damaged, critical, disabled
- definierte Hardpoints als Daten: engines, lance origin, port/starboard batteries, torpedo bays
- vereinfachte Selection-/Hit-Geometrie unabhängig von sichtbaren Pixeln
- Thumbnail und UI-Porträt als eigener Export

Quellauflösung soll mindestens die doppelte maximal sichtbare Größe abdecken. Runtime-Exporte werden als Atlas gepackt; visuell verlustfreie UI/Masken bleiben PNG, großflächige Hintergründe können WebP/AVIF verwenden. Originalquellen gehören nicht unkontrolliert in den Runtime-Build.

## Mindestinventar für den Vertical Slice

### Schiffe

- Spieler-Cruiser
- Spieler-Frigate
- Gegner-Cruiser
- Gegner-Destroyer
- je Schiff: Base, Emissive, Tint, Damage und Thumbnail

### Umgebung

- dreischichtiger Stern-/Nebula-Hintergrund für langsames Parallax
- 6–10 Asteroiden mit zwei Größenstufen
- 2 dezente Weltraumstaub-/Debris-Texturen
- Missionsgrenze und optionale taktische Marker

### UI

- ein vollständiges Panel-/Frame-System mit Nine-Slice-Exports
- konsistente Icons für alle sechs Slice-Aktionen, AP, Energy, Hull, Shield, Range und Status
- Reticles, Arc-Ränder, Pfadsegmente, Facing-Griff und Auswahlring
- Bitmap-/Webfont mit klarer Lizenz und einer separaten Display-Schrift nur für Überschriften

### VFX

- Engine idle und Engine thrust
- Selection pulse und Target lock
- Movement trail und Destination ghost
- Broadside: gestaffelte Muzzle Flashes, Tracer, Impact-Varianten
- Lance: charge, beam core, glow, shield/hull contact
- Torpedo: launch flash, projectile, smoke/ion trail, interception und impact
- Shield: lokale Impact-Welle, kurze Verzerrung, Break-Event
- Hull: sparks, debris, scorch, smoke und critical fire
- Destruction: Vorblitz, Hauptexplosion, Trümmer und ausklingendes Wrack

## Effekt-Choreografie

Jeder Angriff folgt derselben lesbaren Dramaturgie:

1. **Anticipation** – 80–250 ms Lade-, Lock- oder Muzzle-Signal
2. **Travel** – Waffentyp und Flugbahn sind sofort erkennbar
3. **Contact** – Schild- und Hull-Treffer unterscheiden sich deutlich
4. **Consequence** – Zahlen, Balken, Status und Schadenszustand aktualisieren sich synchron
5. **Recovery** – Effekt klingt schnell aus; Kontrolle kehrt zurück

Screen Shake bleibt kamerarelativ, sehr kurz und in den Einstellungen reduzierbar. Bloom, Blur und Additive Blend werden budgetiert und nie flächig dauerhaft eingesetzt.

## Audio-Richtung

Der Mix soll Gewicht vermitteln, ohne den Weltraum realistisch still simulieren zu wollen. UI bleibt trocken und präzise; Waffen besitzen klar getrennte Frequenzprofile.

Für den Slice werden mindestens benötigt:

- UI: hover/focus, click, confirm, cancel, invalid, end turn
- Schiff: select, move start, engine loop, low-hull warning
- Broadside: 3–5 Muzzle-Varianten plus shield/hull impacts
- Lance: charge, beam, shield contact, hull contact
- Torpedo: launch, travel, interception, impact
- Zustände: shield break, critical hit, destruction, victory, defeat
- Musik: ein ruhiger Tactical Loop und eine intensivere Combat-Schicht

Lautheit, Ducking und simultane Stimmen werden zentral gesteuert. Wiederholte Salven verwenden Varianten und leichte Pitch-/Timing-Streuung, damit nichts maschinengewehrartig identisch klingt.

## Qualitätsregeln

- VFX werden mit deaktiviertem HUD und anschließend mit vollständigem HUD geprüft.
- Jeder Effekt besitzt eine reduzierte Variante für Mobile/Low Quality.
- Keine zufällige Partikelerzeugung pro Frame; alle Systeme arbeiten mit Delta Time und festen Budgets.
- Damage States entstehen aus Spielzustand, nicht aus rein dekorativem Zufall.
- Der Asset-Manifest-Eintrag enthält Owner, Quelle, Lizenz, Version, Exportdatum und Runtime-Pfad.
- Ein Asset gilt erst als fertig, wenn es im tatsächlichen Spielzoom, auf hellem/dunklem Hintergrund und bei Bewegung geprüft wurde.
