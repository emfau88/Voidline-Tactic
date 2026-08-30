# Farhaven — erster überzeugender Kampf- und Fortschrittsbogen

Stand: 30. August 2026 · Ausgangspunkt: Commit `24701a9`

Status: Bulk A implementiert und intern geprüft; Bulks B–E offen.

## 1. Ziel und Umfang

Ein neuer Spieler soll ohne externe Erklärung fliegen, einen freiwilligen Kampf eingehen oder umgehen, seine Beute heimbringen und die Wirkung eines sichtbaren Waffen-Upgrades erleben. Zielgröße: ein überzeugender 10–15-Minuten-Ausschnitt, keine erzwungene Sitzungsdauer.

Leitidee: **Weltraumabenteuer mit freiwilligen, eindrucksvollen Gefechten und sichtbarem Aufbau.** Bergen ist ein alternativer Fortschrittsweg, keine lange Voraussetzung für Kampf.

Wir bauen im vorhandenen Spiel weiter. Keine zweite Spielversion, kein neuer Stationsumbau, keine neue Engine. Bestehende Saves und der spätere Routen-/Veloria-Fortschritt bleiben erhalten.

### Für diesen Arbeitsblock festgelegt

- Ein Startsektor, die vorhandene Farhaven-Station und beide vorhandenen Rümpfe.
- Breitseite als sofort verfügbare Grundwaffe; Rail-Lanze als erste gezielt angebotene Kampf-Erweiterung.
- Ein überarbeiteter Glutkutter als normales Gefecht; danach eine räumlich getrennte, optionale schwerere Begegnung aus vorhandenen Gegnern.
- Manuelles Feuern und automatische Zielhilfe; kein zusätzlicher Zielstick und kein Pflicht-Markieren.
- Freie Schüsse sind echte Projektile, keine wirkungslosen Animationen.
- Keine Treibstoffkosten; vorhandene Systemladung und getrennte Cooldowns bleiben.
- Kein Ausbau von Veloria, Fraktionen, Enterhaken, neuen Stationsräumen oder weiteren Waffentypen in diesem Block.

## 2. Ausgangslage — was wir behalten und was wir ändern

Vorhanden und wiederzuverwenden: Flugsteuerung, Zoom, modulare Schiffe und Station, Waffenbuttons, sechs echte Einbauten, Ressourcen, Expedition-Saves, Rückkehr und Gegnerassets.

Die zentralen Baustellen am Ausgangspunkt (Punkte 1 und 2 durch Bulk A behoben):

1. `fireWeapon` zieht Schaden bisher beim Auslösen ab; `ExpeditionScene` animiert den Treffer nachträglich.
2. Gegner ziehen Hülle anhand von Entfernung und Cooldown ab. Sichtbare Projektile sind noch keine verbindliche Trefferprüfung.
3. Der erste Glutkutter ist erreichbar, aber seine Wirkung und Schwierigkeit sind noch nicht mit Erstspielern validiert.
4. `scenarioForProfile` hält Spieler bis zum Frachtrücken im ersten Szenario. Das macht ein Fracht-Upgrade zum Pflichtschritt, obwohl wir früh eine Waffenentscheidung anbieten wollen.
5. Die Roadmap enthält alte Vorgaben wie sichtbare Feuerkorridore und einen starren Kampfanteil. Diese dürfen nicht unbesehen weiter als Abnahme gelten.

## 3. Gewünschter Spielerablauf

| Phase | Spieler erlebt | Verständliche nächste Handlung |
|---|---|---|
| Ankommen | Schiffswahl, eigenes Schiff am warmen Farhaven-Kern | Expedition starten |
| Losfliegen | Direktes Steuern; ein naher Fund und ein erkennbarer Gegner | Fund untersuchen oder Gegner annähern |
| Entscheiden | Sichere Wrackbeute und räumlich erkennbare Gefahrenzone | Kampf suchen oder Abstand halten |
| Kämpfen | Seitlich positionieren, Salve auslösen, Einschlag sehen, Gegenschuss ausweichen | Siegerbeute aufnehmen oder fliehen |
| Heimkehren | Fracht wird gesichert, Hangar kann gebaut werden | Hangar errichten |
| Aufrüsten | Rail-Lanze mit Preis, Montagevorschau und Erklärung ihres Frontschusses | Einbau bestätigen oder für etwas anderes sparen |
| Wirkung erleben | Weiterhin Salve plus separate Lanze; normaler Gegner und optional schwereres Ziel | Neue Waffe ausprobieren, nicht zwingend kämpfen |

Die Reihenfolge Wrack/Kampf ist frei. Eine kurze Erfolgsmeldung ersetzt keine Beutehandlung: Kampfbeute liegt als klar sichtbares Objekt am besiegten Gegner und wird bei Annäherung automatisch aufgenommen, sofern Frachtplatz vorhanden ist. Kein zusätzlicher Scan- oder Bergungsbutton für diese kleine Standard-Kampfbeute.

## 4. Bulk A — Trefferregeln als verlässliches Fundament

### Arbeitsschritte

- [x] Deterministische Projektilzustände in `src/domain/exploration/types.ts` definieren: ID, Besitzer/Seite, Waffe, Position, Geschwindigkeit, Radius, Schaden und Restlebensdauer.
- [x] Projektilbewegung und Trefferprüfung in eine kleine Domain-Datei auslagern, statt `ExpeditionScene` zur zweiten Kampf-Engine zu machen.
- [x] `fireWeapon` erzeugt Geschosse und verbraucht einmal Energie/Cooldown. Kein vorgezogener Hüllenschaden.
- [x] Gegner feuern ebenfalls Geschosse statt sofort Hülle abzuziehen. Sie schießen auf eine beim Feuern bestimmte Richtung; normale Kanonenschüsse verfolgen den Spieler danach nicht.
- [x] Bewegung zwischen vorheriger und neuer Position auf Kollision prüfen, damit schnelle Geschosse nicht durch Schiffe springen. Bei mehreren Treffern entlang der Flugbahn zählt zuerst der räumlich erste gültige Treffer.
- [x] Eigene Seite und bereits zerstörte Ziele ausschließen. Schaden pro Geschoss nur einmal anwenden; zunächst keine durchschlagenden Geschosse oder Friendly Fire.
- [x] Treffer, Abschuss und Schussauslösung als eindeutig identifizierte Ereignisse an Darstellung und Audio geben. Events nicht mehrfach pro Render-/UI-Update auslösen.
- [x] Bestehende Torpedos und interne Energiekugeln auf dieselbe Trefferbasis umstellen, ohne neue Funktionen für sie zu bauen. Vorhandene spielbare Waffen dürfen nicht auf einer widersprüchlichen Sofortschadensregel bleiben.
- [x] Save-Laden normalisieren: alte Expeditionen erhalten leere Projektilzustände. Laufende Geschosse und IDs korrekt speichern; einmalige visuelle Ereignisse beim Laden nicht wiederholen.
- [x] Pause friert die Simulation ein; Rückkehr, Niederlage und Sektorwechsel bereinigen Geschosse und Effekte definiert. Keine nachträglichen Treffer in Farhaven.

### Betroffene Systeme

`expeditionEngine.ts`, `exploration/types.ts`, neue Projektil-Domain, `gameFlow.ts`, `saveGame.ts`, `main.ts`, `ExpeditionScene.ts` und Unit-Tests.

### Abnahme

- Ein Schuss zieht vor Kontakt keinen Schaden ab.
- Freies Feuer kann ein Schiff treffen, das in die Flugbahn gelangt.
- Ein ausweichendes Schiff wird nicht durch den ehemals erfassten Schuss getroffen.
- Keine Doppeltreffer, keine verlorenen Treffer bei langen Frames, keine Geisterprojektile nach einem Szenenwechsel.
- Pause, Reload und alte Saves funktionieren; installierte Waffen bleiben verfügbar.

**Gate:** Erst weiter, wenn diese Regeln automatisiert geprüft sind und die sichtbaren Einschläge dazu passen.

### Interne Prüfung am 30. August 2026

- 86 Unit-Tests, Typecheck und Produktions-Build bestanden.
- 57 bestehende Browser-Testfälle sowie sechs neue Projektil-/Zwei-Touch-Fälle bestanden (Desktop, 844×390, 667×375).
- Die Windows-Testprozesse blieben nach Ausgabe sämtlicher bestandener Fälle beim Beenden des Testservers hängen und wurden danach gestoppt; daher kein sauberer Exit-Code für die Browser-Läufe. Kein fehlgeschlagener Test im abschließenden Lauf.
- Sichtprüfung im lokalen Browser: freie Salve als fliegendes Geschosspaket; vier Salven reduzieren den vorhandenen Glutkutter durch Einschläge von 8 auf 4 Hülle.
- Breitseite verwendet ein physisches Geschosspaket mit drei sichtbaren eng gruppierten Spuren und dem bisherigen Gesamtschaden. Keine unbemerkte Verdreifachung des Salvenschadens.
- Torpedo und Energiekugel fliegen in diesem Fundament geradlinig. Zielverfolgung, neue Waffenrollen und Balancing sind nicht Teil von Bulk A.
- Keine echte Handy-Messung oder externe Erstspielertests; diese bleiben offen. Kein Deployment dieses Stands im Rahmen dieses Bulks.

## 5. Bulk B — ein einfaches, befriedigendes Gefecht

### Arbeitsschritte

- [ ] Zielhilfe an nahe Gegner im gültigen Waffenbogen binden. Nicht am ersten noch lebenden, inzwischen weit entfernten Gegner kleben bleiben; Hysterese verhindert ständiges Zielwechseln.
- [ ] Salve bleibt immer auslösbar, solange Energie und Cooldown es erlauben. Mit Zielhilfe feuert die passende Schiffsseite; ohne Ziel abwechselnd links/rechts. Kleine Mündungsreaktion macht die Seite sichtbar.
- [ ] Rail-Lanze erzeugt genau einen Frontschuss. Keine zusätzlichen Richtungsstrahlen oder irreführenden Seitenlinien.
- [ ] Glutkutter-Begegnung mit Annäherung, kurzer Warnung, angekündigter Salve, Feuerpause und verlässlicher Fluchtgrenze abstimmen.
- [ ] Gegnerwarnung nur kurz am Schiff zeigen; keine dauerhaften roten Navigationspfeile. Kein voller neuer HUD-Block.
- [ ] Hüllenbalken und kurze Schadenszahlen direkt am getroffenen Schiff aktualisieren. Spielerhülle bei Schaden kurz hervorheben; Cooldown direkt im Waffenbutton zeigen.
- [ ] Schiff darf gleichzeitig fliegen, scannen und feuern. Touchstick und zweiter Finger dürfen sich nicht gegenseitig blockieren; Maus/Tastatur bleiben vollwertig.
- [ ] Treffereffekte, Mündungsfeuer, SFX, Explosion und kurze Nachruhe gemeinsam abstimmen. Kein Kamerawackeln bei jedem einzelnen Splitter.

### Tuning-Ziele, noch keine behaupteten Ergebnisse

- Ein normaler Kampf dauert bei brauchbarer Positionierung ungefähr 20–40 Sekunden inklusive Manöver.
- Ein einzelner Fehler ist verzeihbar; dauerhaftes Stillstehen bleibt nachteilig.
- Ausweichen verändert den erlittenen Schaden deutlich.
- Die Rail-Lanze ergänzt die Salve, statt sie obsolet zu machen.
- Keine künstliche Verlängerung allein durch einen riesigen Hüllenwert.

### Abnahme

Auf Desktop und Mobile kann man einen Glutkutter ohne vorheriges Antippen besiegen, bewusst ausweichen und durch Abstand fliehen. Ein Tester kann anschließend erklären, warum er getroffen wurde und wann seine Waffe wieder bereit war.

**Gate:** Wenn dieses Gefecht nicht trägt, wird es überarbeitet. Noch keinen zweiten Gegnertyp aufblasen.

## 6. Bulk C — Kampfbeute, Hangar und erste Waffenentscheidung verbinden

### Konkreter Ökonomie-Vorschlag

Die vorhandenen Startressourcen und Kosten bleiben zunächst unverändert. Nur die erste Glutkutter-Beute wird von zwei auf drei Legierungen angehoben und als einfache Kampfbeute ausgegeben; alter bewachter Cache und neuer Drop dürfen niemals beide belohnen.

| Weg | Rechnung | Ergebnis |
|---|---|---|
| Wrack plus erster Kampf | 2 Start-Legierungen + 3 Wrack + 3 Kampf − 4 Hangar | 4 Legierungen; zusammen mit 1 Start-Datum reicht das für die Rail-Lanze |
| Friedlicher Weg | 2 Start-Legierungen + 3 Wrack − 4 Hangar + 3 aus einer weiteren sicheren Bergung | Derselbe Zugang zur Rail-Lanze, ohne Pflichtkampf |

Das ist ein Ausgangsbalancing, kein endgültiges Verhältnis. Die erste kombinierte Ausbeute umfasst sechs Frachtplätze; Kapazitäten beider Rümpfe und zwischenzeitliche Käufe werden ausdrücklich getestet.

### Arbeitsschritte

- [ ] Eindeutige, einmalige Kampfbeute erzeugen; bei vollem Frachtraum bleibt der nicht aufgenommene Rest sichtbar liegen. Keine Kapazitätsüberschreitung und kein Verlust durch einen abgebrochenen Pickup.
- [ ] Sichere Legierungsquelle auch in der nächsten Stufe zugänglich halten. Wiederholbarkeit nicht daran koppeln, dass der Spieler den Frachtrücken absichtlich nicht kauft.
- [ ] Frachtrücken als sinnvolles, aber freiwilliges Komfort-Upgrade behandeln. Zweite Expeditionsstufe nach erfolgreicher Heimkehr und Hangarbau öffnen, nicht ausschließlich nach `cargo-spine`.
- [ ] Bereits fortgeschrittene Profile behalten ihre spätere Stufe; keine Rücksetzung durch geänderte Szenariobedingungen.
- [ ] Rail-Lanze nach Hangarbau als verständliche Kampfoption anbieten: „Frontwaffe; Salve bleibt erhalten“. Nicht ungefragt kaufen oder automatisch montieren.
- [ ] Ressourcenquellen auch nach alternativen Käufen verfügbar halten. Wer Scanner, Greifer oder Frachtrücken zuerst möchte, darf nicht feststecken.
- [ ] Missionshinweise auf freie Wahl statt Pflicht-Bergungskette umschreiben. Der spätere Minenlaser-/Routenkernbogen bleibt ein weiterer Fortschrittsweg.
- [ ] Nach dem Einbau einen erneuten freiwilligen Kampf nahelegen, ohne den Start anderer Aktivitäten zu sperren.

### Abnahme

Ein frischer Spielstand erreicht Hangar und Lanze über Kampf plus Fund oder ausschließlich über sichere Funde. Abbrechen einer Montage kostet nichts. Beute kann nicht durch Reload verdoppelt werden. Die Waffe ist im Hangar, am Farhaven-Schiff und auf Expedition sichtbar und funktional.

## 7. Bulk D — den ganzen Ausschnitt gestalten und prüfen

### Arbeitsschritte

- [ ] Farhaven-Startpunkt, sicheres Wrack, Glutkutter-Zone und spätere schwerere Begegnung räumlich lesbar anordnen. Keine Feinde direkt am sicheren Rückkehrpunkt.
- [ ] Die schwerere Begegnung aus vorhandenen Gegnern separat anbieten; kein ungeplanter Doppelkampf beim ersten Lernen.
- [ ] Normale Gegner müssen ohne vorherigen Scan visuell verständlich sein. Scan unterstützt die Navigation; er darf nicht zur Feuerfreigabe werden.
- [ ] Hinweise auf eine aktuelle Aufgabe und höchstens einen kurzen Kontextsatz begrenzen. Station und Flugfläche bleiben Mittelpunkt.
- [ ] Bestehende Assets zuerst verwenden. Nur bei konkret nachgewiesener Lesbarkeitslücke gezielt ein Asset ergänzen; kein neues Komplett-Artpaket.
- [ ] Desktop sowie 844×390 und 667×375 prüfen; zusätzlich echtes Handy im Querformat. Notch/Safe-Areas, Browserleisten, Touch und Audio beachten.
- [ ] Leistung beim gleichzeitigen Flug, Scan, zwei Gegnern und mehreren Geschossen messen. Ziel 60 FPS auf einem dokumentierten Zielgerät; nicht allein aus Desktop-Preview ableiten.
- [ ] Projektil-/VFX-Lebensdauer begrenzen und Renderobjekte wiederverwenden. Save- und HUD-Aktualisierungen nur bei gemessener Last gezielt drosseln, nicht vorsorglich die Architektur umbauen.

### Abnahme

Der vollständige Ablauf funktioniert mit beiden Rümpfen, mit und ohne Kampf sowie nach Niederlage und Reload. Keine Überlagerung zentraler Buttons, keine Szenenwechsel-Durchklicks, keine fehlenden Assetbilder und keine versehentlichen Sofortkäufe.

## 8. Bulk E — Erstspielertest und Entscheidung

- [ ] Einen versionierten Testbuild festhalten; keine wechselnden Regeln während einer Testrunde.
- [ ] Zunächst ungefähr fünf neue Spieler testen lassen, darunter Mobile-Nutzer. Kleine Stichprobe als qualitative Fehlersuche behandeln, nicht als statistischen Beweis.
- [ ] Beobachten, nicht erklären. Keine versteckte Telemetrie: zunächst ein einfaches, manuell geführtes Testprotokoll.
- [ ] Zeit bis zum ersten selbstständigen Flug, ersten bewussten Schuss, erster Beute, Heimkehr, Einbau und erneutem Start notieren.
- [ ] Fehlversuche erfassen: unklare Zielwahl, Schüsse ohne verstandenen Feuerbogen, unerklärter Schaden, verlorene Beute und nicht gefundener Upgrade-Kauf.
- [ ] Hinterher fragen: „Warum hast du Schaden genommen?“, „Was hat dein Einbau verändert?“, „Was würdest du als Nächstes tun?“ und „Möchtest du noch einmal starten?“
- [ ] Die drei häufigsten oder schwerwiegendsten Probleme beheben; mit neuen Spielern erneut testen.

### Entscheidung nach der Runde

- **Kampf trägt, Ablauf unklar:** Führung/Ökonomie verbessern, keine zusätzlichen Gegner bauen.
- **Ablauf klar, Kampf langweilig:** Bewegung, Waffenrhythmus und Gegnerentscheidungen überarbeiten, keine weiteren Sammelaufgaben hinzufügen.
- **Beides trägt:** Veloria, weitere Begegnungen und Farhaven-Level-2 wieder aufnehmen.

Wir versprechen keinen erfolgreichen Erstspielertest ohne verfügbare Tester. Bis dahin heißt der Status „intern geprüft“, nicht „mit Spielern bestätigt“.

## 9. Technische Testmatrix und Lieferung

### Automatisiert

- Unit: Treffer beim Kontakt, Fehlschuss, freie Schüsse, schnelle Geschosse, nächster Treffer, einmaliger Schaden, Cooldowns, Energie, Zielbögen und Gegnerausweichen.
- Unit: Beute einmalig, Restbeute bei voller Fracht, beide Rümpfe, friedlicher Kaufpfad, alternative Käufe, keine Fortschrittssackgasse.
- Save: alter Spielstand, laufendes Gefecht, Reload nach Abschuss, keine doppelte Beute oder wiederholte Einbaubelohnung.
- Browser: neuer Spielstand bis Hangar und Rail-Lanze; beide Wege; gleichzeitig fliegen und schießen; Waffen bleiben separat; Rückkehrschutz und Kaufabbruch.
- Regression: bestehende Minenlaser-, Routen-, Stations-, Torpedo- und Veloria-Funktionen bleiben intakt.
- Vor Freigabe `npm run check` und vollständige Browser-Suite. Infrastrukturabbrüche getrennt von bestandenen Tests dokumentieren.

### Arbeitsweise

1. Bulks A → B → C → D nacheinander umsetzen; nach jedem Bulk seinen Prüfpunkt erfüllen.
2. Pro abgeschlossenem Bulk einen nachvollziehbaren Commit vorbereiten/erstellen. Kein großer unprüfbarer Sammelumbau.
3. Deployment nur nach grüner Abnahme und im Rahmen des jeweiligen Umsetzungsauftrags; diesen Plan zu erstellen ist keine Push-Freigabe.
4. README, CHANGELOG und ROADMAP synchron halten. Diese Datei bei der Umsetzung tatsächlich abhaken.
5. Tests und Bewertungen mit Stand/Commit kennzeichnen. Ein veröffentlichter Testbuild ist nicht automatisch ein fertig validierter Vertical Slice.

## 10. Abschlusskriterium für diesen Block

Der Block ist abgeschlossen, wenn ein Erstspieler ohne Zuruf freiwillig kämpfen oder friedlich sammeln, seine Beute sichern, ein sichtbares Upgrade kaufen und dessen Nutzen im nächsten Flug erklären kann — und dieser Ablauf auf Desktop und einem echten Mobilgerät zuverlässig funktioniert.

**Der nächste Implementierungsschritt ist Bulk B: das vorhandene Glutkutter-Gefecht und seine Zielhilfe abstimmen.** Bulk A ist implementiert; Belohnungs- und Fortschrittsänderungen folgen erst in Bulk C.
