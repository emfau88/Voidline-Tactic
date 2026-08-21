# Voidline Tactics

Voidline Tactics ist ein rundenbasiertes 2D-Top-down-Flottentaktikspiel für den Browser. Kleine, persistente Flotten, relevante Ausrichtung, Breitseiten, klar unterscheidbare Waffensysteme und sichtbare Gefechtsfolgen bilden den Kern.

## Projektstatus

**Pre-Production / Interaction Prototype.** Das Repository enthält noch kein Produktionsspiel. Der aktuelle Stand ist ein eigenständiger Canvas-Prototyp, der den grundlegenden Kampfablauf demonstriert. Er dient als UX- und Mechanik-Spike und soll nicht zum nächsten Single-File-Monolithen ausgebaut werden.

Bereits demonstriert:

- zwei Spielerschiffe gegen zwei Gegner
- Runden, AP und Energie
- Bewegung mit Zielvorschau und Facing
- Front- und Breitseiten-Feuerwinkel
- Broadside, Lance, Torpedo und Shield
- Treffervorschau, einfacher Gegnerzug sowie Sieg/Niederlage
- rudimentärer Reward-/Upgrade-Loop

Noch nicht vorhanden sind unter anderem eine Produktionsarchitektur, echte Game-Assets, Audio, Persistenz, Tests, Build-Pipeline, Content-Pipeline und ein belastbarer Kampagnenfluss.

## Prototyp starten

Direktes Öffnen der HTML-Datei kann funktionieren; ein lokaler Webserver ist verlässlicher:

```powershell
python -m http.server 4173
```

Danach öffnen:

```text
http://127.0.0.1:4173/prototypes/vertical-slice-v2.html
```

## Kanonische Dokumente

- [Game Vision](docs/design/GAME_VISION.md) – Produktvision und verbindliche Designleitplanken
- [Art- und VFX-Richtung](docs/design/ART_AND_VFX_DIRECTION.md) – originale Bildsprache, Asset-Pipeline und Effektregeln
- [Repository Audit](docs/reviews/REPOSITORY_AUDIT.md) – belastbare Bestandsaufnahme und bekannte Risiken
- [Production Plan](docs/planning/PRODUCTION_PLAN.md) – phasenweiser Weg zum hochwertigen Vertical Slice
- [Mockup-Hinweise](docs/reference/mockups/README.md) – Rolle und Grenzen der vorhandenen Konzeptbilder
- [Prototype Notes](prototypes/README.md) – Einordnung der beiden HTML-Spikes

## Struktur

```text
docs/
  design/               Produkt-, Art- und VFX-Vorgaben
  planning/             Umsetzungsplan und Quality Gates
  reference/mockups/    visuelle Referenzen, keine Runtime-Assets
  reviews/              technische und produktbezogene Audits
prototypes/
  vertical-slice-v2.html
  archive/              ältere, nur noch referenzierte Spikes
```

Die geplante Produktionsanwendung wird später separat unter `src/`, `public/assets/` und `tests/` aufgebaut. Bis dahin bleibt der Prototyp bewusst isoliert.
