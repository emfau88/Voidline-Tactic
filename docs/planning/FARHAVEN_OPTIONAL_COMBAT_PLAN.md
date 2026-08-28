# Farhaven – optionaler, spektakulärer Combat

Stand: 24. August 2026
Status: erster Vertical Slice umgesetzt; Ausbau und Balancing laufen
Ziel: Kämpfe sollen zu den spannenden Geschichten einer Expedition gehören, aber nie Exploration, Bergung oder Rückkehr verdrängen.

## Leitentscheidung

`Voidline: Farhaven` wird kein Twin-Stick-Shooter und kein Dauercombat-Spiel. Der Spieler steuert sein Schiff weiterhin direkt, wählt aber bewusst, **ob** ein Kontakt vermieden, beobachtet, ausgetrickst, beraubt oder bekämpft wird.

Combat entsteht aus **Flugposition, Waffenbögen, Energie und Timing**:

```text
Kontakt früh erkennen
        ↓
ausweichen / fliehen / Einsatz vorbereiten
        ↓
Winkel und Abstand selbst erfliegen
        ↓
Salve, Torpedo oder Spezialmodul bewusst auslösen
        ↓
Schaden, Beute oder Rettung einschätzen
        ↓
weiter erkunden oder mit beschädigtem Schiff heimkehren
```

Der Kampf ist folglich keine Wand, die den Fortschritt blockiert. Er ist eine riskante Abkürzung, eine Rettungsaktion, eine Quelle besonderer Funde oder manchmal schlicht ein Fehler, aus dem man rechtzeitig aussteigen kann.

## Designpfeiler

### Wahl vor Zwang

- Der erste Sektor bleibt vollständig ohne zerstörte Gegner abschließbar.
- Feinde sind vor dem Schusswechsel auf Scanner oder Sichtkontakt erkennbar.
- Jede Standardbegegnung hat mindestens eine verlässliche Flucht- oder Ausweichoption.
- Seltene Ressourcen können über Kampf, Bergung, Anomalien **oder** Hilfe gefunden werden; Combat ist nie die einzig sinnvolle Quelle.

### Positionierung vor Dauerfeuer

Standardwaffen zielen verständlich auf den ausgewählten Kontakt, aber sie sind nicht überall gleich stark. Der Spieler erzeugt gute Schüsse durch seine Flugbahn:

- **Breitseiten** brauchen einen Gegner an Backbord oder Steuerbord.
- **Rail-Lanzen** brauchen die Nase zum Ziel.
- **Torpedos** brauchen Lock und freien Raum.
- **Greifer/Enterhaken** funktionieren nur an einem langsamen, geschwächten oder unbeweglichen Ziel.

Damit bleibt das Steuern wichtig. Der Spieler muss nicht gleichzeitig mit zwei virtuellen Sticks zielen.

### Lesbare Gefahr und große Momente

Jede starke Aktion erhält Ankündigung, Aufladung, klaren Auslöser und Nachwirkung. Ein Kampf fühlt sich nicht wie permanentes Blinken an, sondern wie wenige, gut lesbare Entscheidungen mit spektakulären Impulsen.

## Der mobile Combat-Controller

Der Flugstick bleibt links unten. Rechts stehen maximal vier große Kontextaktionen; sie verändern sich nur, wenn der ausgewählte Gegner bzw. das installierte Modul es begründet.

```text
┌────────────────────────────────────┐
│ Ziel: Aschenpatrouille  ·  68 %     │
│ [SCAN] [SALVE / Lanze]              │
│ [ORDNANZ] [FLUCHT / AEGIS]          │
│                                    │
│ Flugstick                           │
└────────────────────────────────────┘
```

| Aktion | Immer? | Aufgabe |
|---|---|---|
| `SCAN` | ja | Kontakt klassifizieren, Schwachstelle oder Fluchtroute erkennen |
| `SALVE` | bei Feuerlösung | Breitseiten, Rail-Lanze oder Türme auslösen |
| `ORDNANZ` | nur mit System | Torpedo, Energiekugel oder später Täuschkörper |
| `FLUCHT` / `AEGIS` | kontextuell | Rückzugskurs, Vector-Boost oder Schutzpuffer |

Ein kurzer Ziel-Lock genügt. Es gibt kein permanentes Fadenkreuz und keine Pflicht, auf einem kleinen Display präzise zu drehen.

## Waffen und ihre Rollen

### 1. Breitseitenkanonen – Kernwaffe

- **Position:** sichtbare Seitentürme, später große Rumpfbatterien.
- **Bedienung:** `SALVE`, wenn der Kontakt im seitlichen Feuerbogen liegt.
- **Moment:** Türme drehen sich, Ladeglühen, zwei bis vier Geschosse, Rückstoß und Trefferfunken.
- **Stärke:** verlässlich, energieeffizient, stark im richtigen Winkel.
- **Schwäche:** gegen Ziele direkt vor oder hinter dem Schiff ungeeignet.

Breitseiten sind die bevorzugte Grundwaffe, weil sie direkte Schiffssteuerung und spektakuläres Schiff-gegen-Schiff-Gefühl verbinden.

### 2. Rail-Lanze – präziser Frontangriff

- **Position:** zentral am Bug.
- **Bedienung:** `SALVE` nur bei enger Frontausrichtung; kurze Aufladung.
- **Moment:** Cyan-Kondensatoren füllen sich, kräftiger Rückstoß, langer einzelner Durchschlag.
- **Stärke:** hoher Schaden an einer sichtbaren Schwachstelle, große Reichweite.
- **Schwäche:** verlangt ruhige Nase und kostet viel Energie.

### 3. Torpedos – geplante Ordnanz

- **Position:** seitliche oder ventrale Rohre.
- **Bedienung:** `ORDNANZ` nach Lock; begrenzte Nachladezeit statt einer zusätzlichen Währung.
- **Moment:** Klappe öffnet, Torpedo driftet kurz an, Motor zündet, Abwehrfeuer kann ihn zerstören.
- **Stärke:** hoher Schaden, erzwingt Ausweichmanöver, kann schwere Ziele öffnen.
- **Schwäche:** Telegrafiert, kann ausmanövriert oder abgefangen werden.

### 4. Energiekugel – Relikt-System

- **Position:** Reliktschrein oder Kernreaktor.
- **Bedienung:** `ORDNANZ`; langsame, sichtbare Kugel folgt dem Ziel nur schwach.
- **Moment:** violette Glyphen, summender Kern, Einschlag als kurzer Störimpuls.
- **Stärke:** stört Schilde, Motoren oder Scanner statt nur Hülle zu entfernen.
- **Schwäche:** sehr hoher Energiebedarf und später Risiko durch Anomaliebelastung.

### 5. Laser – Werkzeug und Präzisionswaffe

- **Minenlaser:** primär Abbau, gegen Schiffe nur schwache Notschneide.
- **Defensivlaser (später):** kurze präzise Pulse gegen Minen, Raketen oder offene Systeme.
- **Moment:** keine Dauerstrahlen im Leerlauf; nur kurze sichtbare Arbeits-/Abwehrimpulse.

### 6. Enterhaken und Bergungsgreifer – Abschluss statt Minispiel

- **Bedingung:** Gegner ist fluchtunfähig, entwaffnet, immobilisiert oder ein verlassenes Schiff.
- **Bedienung:** Kontextaktion `ANHAKEN` / `ENTERN` in kurzer Reichweite.
- **Moment:** Greifer fahren aus, Tether spannt sich, kleine Funken und Frachtkapsel löst sich.
- **Ergebnis:** Fracht bergen, einen Systemkern stehlen, Gefangene retten oder ein Ziel kampfunfähig machen.
- **Scope:** kein eigenes Boarding-Minispiel im ersten Slice; die Entscheidung ist taktisch und erzählerisch.

## Energiesystem und Schäden

Combat wird nicht mit separater Munition überladen. Die wichtigsten Spannungen entstehen aus denselben Expeditionressourcen.

| System | Spielerentscheidung |
|---|---|
| Energie | in Schub, Schild/Aegis, Scan oder starke Waffen investieren |
| Hülle | dauerhafter Expeditionsschaden; Rückkehr wird dringlicher |
| Waffenwärme | starke Salven sperren die gleiche Waffe kurz, statt zu spammen |
| Frachtraum | Beute mitnehmen oder Platz für den nächsten Fund freihalten |

Ein Totalschaden ist kein Save-Reset: Das Schiff driftet ab, Farhaven schleppt es ein, ungesicherte Fracht geht weitgehend verloren und Reparaturen verzögern die nächste Expedition.

## Gegner und Begegnungen

### Gegnerzustände

Alle Gegner kommunizieren ihren Zustand sichtbar:

- `patrouilliert` – gelber Sichtbereich, noch kein Angriff.
- `misstrauisch` – Scannerimpuls/Telegraph, der Spieler kann noch Abstand gewinnen.
- `verfolgt` – klare Antriebs- und Waffenanzeichen.
- `beschädigt` – Motoren, Schilde oder Waffen sichtbar gestört.
- `flieht` / `wehrlos` – Enterhaken, Bergung oder Loslassen wird möglich.

### Erste zwei Gegnerrollen

| Gegner | Verhalten | Spielerantwort |
|---|---|---|
| Aschenpatrouille | leichter Jäger, bewacht Routen, feuert kurze Breitseiten | umfliegen, Rail-Lanze, Salve, Flucht |
| Trümmerfresser | langsamer Bergungsräuber, klammert sich an Wracks | Wrack vorher bergen, Torpedo abschrecken, Enterhaken gegen ihn verwenden |

Ein schwerer Wächter, Minenfelder und Gruppen kommen erst danach. Zwei lesbare Gegnertypen sind wertvoller als fünf unklare.

## Kampfbeute und friedliche Alternativen

| Begegnung | Kampfabschluss | friedliche Alternative |
|---|---|---|
| Patrouille | seltenes Systemteil / freie Route | Umweg, Schleichflug, schneller Vector-Boost |
| Räuber am Wrack | Fracht zurückholen / Greiferteil | anderes Wrack wählen, Notsignal beantworten |
| Anomalie-Wächter | Reliktkern | Scanner-/Schreinlösung mit Energie- und Datenkosten |

Die Gewinn-Erwartung eines riskanten Kampfes darf höher sein, aber nicht deutlich effizienter als gute Exploration. Sonst wird jede Begegnung zum Pflichtschießen.

## VFX- und Audio-Signatur

| Ereignis | Bild | Ton |
|---|---|---|
| Breitseite | Turmdrehung, Rückstoß, 2–4 Projektile, Schrapnell | tiefer Kanonenschlag, Nachhall im Funk |
| Rail-Lanze | Kondensatorladung, heller Frontimpuls, Rückstoß | hoher Ladeton, scharfer Durchschlag |
| Torpedo | Schachtklappe, Drift, Zündung, Rauch/Trümmer | mechanisches Ausklinken, Motorheulen |
| Energiekugel | violette Glyphen, langsamer Kern, Störwelle | Chorfragment, tiefer Subton |
| Enterhaken | ausfahrender Greifer, gespannter Tether, Frachtkapsel | Seilzug, Metallknacken, Funkgeräusche |
| Flucht | Vector-Flare, gestreckte Sterne, ausfadernde Verfolger | Triebwerksspitze, gedämpfter Herzschlag |

Die VFX werden gepoolt und nur im tatsächlichen Einsatz erzeugt. Keine blinkenden Dauerlinien oder persistenten Geschoss-Spam-Effekte.

## Umsetzungsphasen

### C0 – Combat-Fundament

- Ziel-Lock und sichtbare Feuerbögen ergänzen.
- Aschenpatrouille erhält Patrouille, Erkennung, Verfolgung und Rückzug.
- Spielerhülle, Aegis-Puffer, einfacher Gegnerschaden und sicherer Fluchtkurs.
- Breitseiten als erste vollständige Waffe: Winkel, Salve, Cooldown, VFX und Audio.

**Gate:** Eine Begegnung lässt sich ohne Erklärung sichtbar umfliegen, fliehen oder mit einer Breitseitenentscheidung gewinnen.

### C1 – Drei Waffen, drei Flugprobleme

- Rail-Lanze mit Frontwinkel und Aufladung.
- Torpedo mit Lock, Nachladezeit und gegnerischem Ausweichen.
- Seitengeschütze als halbautomatische, vom Spieler ausgelöste Salve.

**Gate:** Ein Spieler kann nach einem Flug erklären, wann Breitseite, Lanze und Torpedo jeweils sinnvoll waren.

### C2 – Combat als Explorationserweiterung

- Bergungsgreifer/Enterhaken an hilflosen Zielen und Wracks.
- Reliktschrein mit Energiekugel und Anomalie-Interaktion.
- Trümmerfresser als zweiter Gegnertyp.
- Kampfbeute gegen friedliche Fundwege balancieren.

**Gate:** Combat erzeugt neue Geschichten und Optionen, nicht bloß mehr Hüllenschaden.

### C3 – Langfristige Progression

- Aegis, Kernreaktor, Rumpf-Mk-II und sichtbare Torpedorohre.
- Systemschäden, Reparaturprioritäten und seltene Signaturmodule.
- Zweiter Sektor mit optionalen harten Kontakten.

**Gate:** Zwei unterschiedliche Loadouts erzeugen nachvollziehbar unterschiedliche Risiko- und Kampfstrategien.

## Messbare Abnahme

- Mindestens 70 % der Expeditionszeit bleiben außerhalb von Combat.
- Mindestens 80 % der Erstspieler erkennen vor dem ersten Schuss eine Fluchtoption.
- Keine Standardbegegnung verhindert den Fortschritt ohne alternative Route.
- Jede Waffe ist im Flug an Position, Aufladung und Projektilbild unterscheidbar.
- Ein Spieler kann nach dem Kampf erklären, warum er Schaden nahm oder gewann.
- Bei einer 8–12-Minuten-Expedition gibt es höchstens ein bis zwei Kämpfe, außer der Spieler sucht sie aktiv.
- 60 FPS auf Zielgeräten mit zwei Gegnern, VFX und Scanradius.

## Bewusste Grenzen

Vor C2 entstehen nicht:

- kein Twin-Stick-Zielen
- kein Boarding-Minispiel
- keine Flottenbefehle oder Crewverwaltung
- keine Munitionswährungen oder Craftingketten für jede Rakete
- keine dauerhaften Laserstrahlen oder Bullet-Hell-Muster
- keine untelegraphierten Hinterhalte im ersten Sektor

## Empfohlener nächster konkreter Schritt

Mit **C0 und der Breitseitenkanone** beginnen: Feuerbögen am Aschenpatrouillen-Kontakt sichtbar machen, der Patrouille eine ruhige Verfolgungslogik geben und `SALVE` zu einem klaren seitlichen Kanonenschlag mit Rückstoß, Cooldown und Fluchtfenster ausbauen. Das etabliert die Kampfsprache, ohne Exploration um Combat herumzubauen.
