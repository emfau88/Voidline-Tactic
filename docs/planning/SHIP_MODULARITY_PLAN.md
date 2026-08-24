# Schiffswerft und sichtbare Upgrades

Stand: 24. August 2026
Status: erster spielbarer Prototyp

## Ziel

Das Schiff ist der persönlichste Fortschritt im Spiel. Es soll nicht durch zehn abstrakte Zahlen wachsen, sondern sich nach jeder wichtigen Entscheidung sichtbar verändern: breiter, schwerer, sonderbarer, besser vorbereitet – und trotzdem immer als dieselbe Aster Vale beziehungsweise Bramble lesbar bleiben.

## Startwahl

Ein neuer Spielstand beginnt mit einer einmaligen Wahl zwischen zwei einfachen Rümpfen:

| Rumpf | Rolle | Startgefühl | Langfristige Stärke |
|---|---|---|---|
| **Aster Vale** | Erkundungskutter | schlank, präzise, neugierig | Sensoren, Reichweite, Bewegung |
| **Bramble** | Bergungsschlepper | breit, robust, werkzeugartig | Fracht, Bergung, Verteidigung |

Die Wahl prägt Silhouette und spätere Synergien, sperrt aber keine ganze Inhaltskategorie. Beide können alle Kernupgrades erhalten; sie verteilen die sichtbarsten Anbauten nur unterschiedlich.

## Modulprinzipien

1. Jedes echte Upgrade hat einen physischen Platz: Nase, Rücken, Flanken, Seitenrails oder Heck.
2. Ein Modul darf die Silhouette verändern, muss aber den Rumpf noch erkennbar lassen.
3. Große Fortschritte verändern Volumen oder Ausleger, kleine Fortschritte Licht, Sensorik oder Ausrüstung.
4. Der Hangar zeigt dieselben installierten Teile wie der Expeditionsflug.
5. Die Testwerft darf alle Teile kostenlos vorführen; im Spiel werden sie später einzeln erforscht, gebaut und montiert.

## Die zehn Prototyp-Module

| Modul | Einbauort | Sichtbare Veränderung | Spätere Funktion |
|---|---|---|---|
| Breitbandarray | Nase/Rücken | zwei cyanfarbene Sensorzinken | Scanreichweite und Klassifikation |
| Frachtrücken | mittlerer Rücken | breiter Messing-Container | Frachtraum |
| Vector-Heck | Heck | zusätzliche violette Triebwerksdüsen | Beschleunigung und Bremsen |
| Aegis-Kranz | zentral | leuchtender Schutzring | Schildreserve/Notfallpuffer |
| Rail-Lanze | Nase | lange helle Schienenwaffe | präziser Fernschuss |
| Seitengeschütze | Flanken | zwei kompakte Geschütztürme | Nahbereich und Verteidigung |
| Bergungsgreifer | Flanken | goldene Gelenkarme | Wracks öffnen und schwere Funde |
| Minenlaser | seitliche Nase | amberfarbene Werkzeugausleger | Ressourcen abbauen |
| Reliktschrein | Rückenmitte | kleines gotisches Reliquiar | Anomalie-Interaktionen |
| Kernreaktor | Rumpfzentrum | violetter Energiekern | Energie- und Spezialmodul-Spielraum |

## Upgrade-Stufen und Wachstum

Die zehn Module sind die **erste Ebene**. Danach entstehen erkennbare Bauklassen:

- **Leicht:** Sensoren, Schreine, Türme; verändert Licht und kleine Ausleger.
- **Mittel:** Greifer, Laser, Rail-Lanze; verändert Nase oder Flanken deutlich.
- **Schwer:** Frachtrücken, Vector-Heck, Aegis-Kranz; vergrößert Rumpf, Spannweite oder Heck.
- **Signatur:** besondere Relikte machen ein Standardmodul einzigartig, etwa einen singenden Scanner oder eine lebende Panzerung.

Der Rumpf selbst kann in einer späteren Stufe vergrößert werden: Der Kutter erhält einen längeren Rücken-/Heckring, die Bramble zusätzliche seitliche Frachtsektionen. Das ist ein seltener, emotionaler Meilenstein, kein früher Zahlenbonus.

## Prototyp im aktuellen Build

- Startauswahl speichert den gewählten Rumpf dauerhaft.
- Die Testwerft im Hangar kann alle zehn Module ein- und ausblenden.
- Die Installation wird im Save abgelegt und am Expeditionsschiff als zusätzliche Geometrie angezeigt.
- Der Testmodus kostet nichts und ist ausdrücklich als Vorschau markiert.
- **Aster-Vale-Artpass:** Breitbandarray, Frachtrücken, Vector-Heck, Bergungsgreifer, Minenlaser, Rail-Lanze, Seitengeschütze und Reliktschrein liegen als passgenaue transparente Kunstebenen auf dem Rumpf.
- **Erste aktive Schleife:** Ein klassifizierter Erzfund wird mit installierten Minenlasern zur Kontextaktion `ABBAUEN`; der Abbau erzeugt Strahlen, Splitter und eine Frachtflug-Animation.
- **Noch Prototyp:** Bramble sowie Aegis-Kranz und Kernreaktor benötigen ihren eigenen Rumpf-spezifischen Artpass.

Die folgenden Spielwerte werden erst dann verbindlich zugeschaltet, wenn Bergung, Abbau und vollwertiger Kampf weiter ausgebaut sind. Momentan ist die Werft ein visueller und technischer Prototyp für die Silhouettenentwicklung.

## Nächste Produktionsschritte

1. Dynamische Version der Hangar-Detailansicht: gewählter Rumpf und installierte Module statt fest gemaltem Schiff.
2. Drei Module mit vollständiger Regelwirkung verbinden: Breitbandarray, Frachtrücken, Vector-Heck.
3. Bergungsgreifer und Minenlaser zusammen mit ihren Expedition-Aktionen implementieren.
4. Rail-Lanze, Seitengeschütze und Aegis erst mit telegraphierten Gegnern balancieren.
5. Rumpfvergrößerung als seltenen Außenposten-Meilenstein inszenieren.
