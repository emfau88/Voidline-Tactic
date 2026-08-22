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
| `ship-player-frigate` | True-Top-down-Schiff | Projektowner; Built-in ImageGen unter Projektregie | originär erzeugt; vor kommerzieller Veröffentlichung final prüfen | Source 1 / Runtime 1 | `public/assets/ships/player-frigate-v1.png` | approved |
| `ship-enemy-cruiser` | True-Top-down-Schiff | Projektowner; Built-in ImageGen unter Projektregie | originär erzeugt; vor kommerzieller Veröffentlichung final prüfen | Source 1 / Runtime 1 | `public/assets/ships/enemy-cruiser-v1.png` | approved |
| `ship-enemy-destroyer` | True-Top-down-Schiff | Projektowner; Built-in ImageGen unter Projektregie | originär erzeugt; vor kommerzieller Veröffentlichung final prüfen | Source 1 / Runtime 1 | `public/assets/ships/enemy-destroyer-v1.png` | approved |
| `battlefield-nebula` | 2:3 Environment Base | Projektowner; Built-in ImageGen unter Projektregie | originär erzeugt; vor kommerzieller Veröffentlichung final prüfen | Source 1 / Runtime 2 | `public/assets/backgrounds/battlefield-nebula-v2.jpg` | approved |
| `module-aegis-emitter` | transparentes Shield-Emitter-Layer | Projektowner; originäres SVG unter Projektregie | originär erstellt | Runtime 2 | `public/assets/modules/aegis-emitter-v1.svg` | approved |
| `module-vector-drive` | transparentes Engine-Layer | Projektowner; originäres SVG unter Projektregie | originär erstellt | Runtime 2 | `public/assets/modules/vector-drive-v1.svg` | approved |

Abnahme `ship-player-cruiser`: 21. August 2026; 390×844 und 1423×800, Bewegung/Rotation, dunkler und heller Kontrastgrund, Engine-Emissive, Lance-Hardpoint und Schildkontakt geprüft.

Abnahme übrige Flotte: 21. August 2026; echte Alpha-Transparenz technisch geprüft, Silhouettenvergleich auf dunklem/hellem Grund, 390×844-Flottenansicht, Fraktions-/Klassenlesbarkeit, Selection-/Shield-Geometrie und alle Weapon-/Engine-Hardpoints geprüft.

Abnahme `battlefield-nebula`: 21. August 2026; 390×844 mit kompletter Flotte, HUD, Status-Bars und taktischem Overlay geprüft; zentraler Korridor bleibt kontrastarm, Randnebel überstrahlen keine Schiffe. Runtime 2 exportiert die volle 1024×1536-Source-Auflösung als rund 100-KB-JPEG, damit Pinch-Zoom nicht mehr den 512×768-Export hochskaliert.

Abnahme `module-aegis-emitter` und `module-vector-drive`: 22. August 2026; echte SVG-Transparenz, Montage auf beiden aktuellen Spielerhüllen, Menü-Preview bei 844×390 sowie Phaser-Layer im 1v1 geprüft. Runtime 2 entfernt die massive dunkle Verbindungsplatte zugunsten getrennter Pods und schmaler offener Halter, damit die Hülle sichtbar bleibt. Zwei Built-in-ImageGen-Explorationen wurden wegen als Pixel gerendertem Schachbrett statt echter Alpha-Transparenz verworfen und nicht ins Repository übernommen.

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
