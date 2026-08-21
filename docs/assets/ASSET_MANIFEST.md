# Asset Manifest

Dieses Manifest dokumentiert Herkunft, Status und Runtime-Verwendung aller Produktionsassets. Ein Eintrag ist erst `approved`, wenn das Asset im tatsächlichen Spielzoom auf Mobile und Desktop geprüft wurde.

## Status

- `planned` – spezifiziert, aber noch nicht erzeugt
- `review` – erzeugt oder integriert, visuelle/technische Abnahme läuft
- `approved` – im Spielzoom, in Bewegung und auf hellem/dunklem Grund abgenommen
- `rejected` – nicht für den Runtime-Build verwenden

## Produktionsassets

| ID | Typ | Owner/Quelle | Rechte-/IP-Status | Version | Runtime-Pfad | Status |
|---|---|---|---|---:|---|---|
| `ship-player-cruiser` | True-Top-down-Schiff | Projektowner; Built-in ImageGen unter Projektregie | originär erzeugt; vor kommerzieller Veröffentlichung final prüfen | Source 1 / Runtime 2 | `public/assets/ships/player-cruiser-v2.png` | approved |

Abnahme `ship-player-cruiser`: 21. August 2026; 390×844 und 1423×800, Bewegung/Rotation, dunkler und heller Kontrastgrund, Engine-Emissive, Lance-Hardpoint und Schildkontakt geprüft.

## Referenzen

Die Bilder unter `docs/reference/mockups/` sind keine Produktionsassets und dürfen nicht in den Runtime-Build kopiert werden. Generierte Assets verwenden ausschließlich die eigenständige abgründig-nautische Voidline-Formensprache aus der [Art- und VFX-Richtung](../design/ART_AND_VFX_DIRECTION.md).

## Abnahme pro Schiffsasset

- transparente, saubere Außenkante ohne Hintergrund oder Schattenplatte
- strikt orthografische Draufsicht; Bugrichtung bei 390×844 sofort lesbar
- eigenständige Silhouette ohne bekannte Fraktionszeichen
- große Werteformen vor Mikrodetails; keine flimmernden Ein-Pixel-Strukturen
- Hardpoints für Engine, Lance, Torpedo sowie Port/Starboard datenbezogen definierbar
- Originaldatei mindestens doppelt so groß wie die maximale Runtime-Darstellung
- Runtime-Bild, Herkunft, Prompt, Datum und Version im Manifest nachvollziehbar
