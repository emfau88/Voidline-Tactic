# Top 20 Hebel zum hochwertigen Fleet-Corridors-Spiel

Stand: 22. August 2026

Der aktuelle PoC beweist Regeln und Bedienung. Gegenüber dem Ziel eines optisch hochwertigen, sofort verständlichen Spiels liegt er grob bei **45 % funktionaler Vertical-Slice-Reife** und **30 % audiovisueller Zielqualität**. Die Zahlen sind eine Produktionsschätzung, keine Testmetrik.

| Rang | Hebel | Warum jetzt | Messbare Abnahme |
|---:|---|---|---|
| 1 | Center-Risiko balancieren | 122 s Median macht Mitte zu dominant | Center 170–230 s, ohne >7-min-P90 |
| 2 | Objective-Boni direkt zeigen | Regeln wirken, Nutzen ist noch abstrakt | Rate/Cooldown-Vorteil am Ring lesbar |
| 3 | Command-Ship-Phasen | reine HP erzeugt Tank-Gefühl | 2–3 sichtbare Phasen/Supportfenster |
| 4 | fünf Erstspieler testen | interne Klarheit ist kein Nutzernachweis | 4/5 verstehen Makro-Loop ohne Hilfe |
| 5 | originale Audio-Foundation | größter fehlender Qualitätskanal | UI-, Broadside-, Impact-, Alarm-Sets |
| 6 | Klassen-Breitseiten | Schiffe müssen sich im Feuer unterscheiden | Salve/Kadenz pro Klasse erkennbar |
| 7 | Treffer-/Damage-States | aktuelle Treffer sind zu generisch | Schild, Armor, Hull und Critical klar |
| 8 | 7v7-Rollenlesbarkeit | Flotten können visuell verschmelzen | Zielklasse in <2 s erkennbar |
| 9 | Nachkampfbericht | Sieg/Niederlage braucht Erklärung | Captures, Verluste, Druck, Wendepunkt |
| 10 | Gegnerstrategie variieren | KI ist funktional, aber vorhersehbar | 3 Doktrinen mit erkennbarem Verhalten |
| 11 | Gruppenverlegung | Einzeltransfer ist funktional, nicht elegant | Routengruppe mit einem Befehl verlegen |
| 12 | Deployment-Rollen schärfen | Kosten allein sind wenig Entscheidung | Fregatte/Zerstörer mit klarer Aufgabe |
| 13 | Objective-VFX | Capture braucht Drama und Fernlesbarkeit | Owner-Wechsel aus Überblick erkennbar |
| 14 | Kamera-Action-Framing | freie Kamera ist korrekt, aber neutral | kurze optionale Ereignis-Impulse |
| 15 | VFX-Pooling/Performance | 7v7 darf nicht skalierungsbedingt kippen | 60 FPS + 3-Restart-Soak |
| 16 | zweite sichtbare Waffe | Preflight braucht echten Build-Entscheid | 2 Waffen mit sichtbaren Hardpoints |
| 17 | Reward→Refit | Match braucht motivierende Konsequenz | Sieg führt direkt zu sichtbarer Änderung |
| 18 | Missionen 1–3 | erst nach stabilem Kern Content erweitern | klare 2v2→Objective→5v5-Eskalation |
| 19 | Accessibility | Farben/kleine Texte müssen robust sein | Farbblind-Modi, 200-%-Textzoom, Fokus |
| 20 | Legacy bereinigen | zwei Produktpfade erhöhen Wartungsrisiko | alter Modus archiviert oder entfernt |

## Reihenfolge der nächsten vier Sprints

1. **Balance/Clarity:** Hebel 1–4.
2. **Audio/Impact:** Hebel 5–7 und 13.
3. **Fleet Scale:** Hebel 8, 10–12, 15.
4. **Progression:** Hebel 9, 16–18.

Neue Schiffe, große Meta-Systeme oder zusätzliche Ressourcen werden nicht vorgezogen, solange Center-Dominanz, Audio, Trefferlesbarkeit und externe Verständlichkeit offen sind.
