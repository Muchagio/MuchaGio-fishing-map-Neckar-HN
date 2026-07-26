# MuchaGio Fishing Maps – Neckar Abschnitt 5

## Version 1.0.0
Build: 24.07.2026

### Wesentliche Änderungen
- Sichtbare und interne Version zentral auf **v1.0.0** gesetzt.
- Abschnittsmarker 01–04 werden erst nach dem Laden der Gewässergeometrie erzeugt und direkt auf den nächstgelegenen Punkt des Neckars bzw. der Enz gesetzt.
- Keine frei platzierten Stadt-, Feld- oder Mittelpunktmarker mehr.
- Unsichere Bauwerkspunkte für Horkheim und Lauffen wurden entfernt, statt ungenau dargestellt zu werden.
- Angezeigt werden nur konservativ verifizierte Bauwerke in Heilbronn und Besigheim.
- Bauwerksmarker werden zusätzlich gegen die geladene Gewässergeometrie geprüft und bei mehr als 80 m Abstand ausgeblendet.
- Prüfbereiche wurden von 90 m auf 50 m reduziert und klar als nicht amtliche Orientierung gekennzeichnet.
- Satellitenansicht bleibt Standard.
- Cache-Busting und Versionsanzeige wurden vereinheitlicht.

## GitHub Pages
Den **Inhalt** dieses Ordners in das Root-Verzeichnis des Repositorys hochladen. `index.html` muss direkt im Root liegen.

## Datenhinweis
Die Darstellung dient ausschließlich der Orientierung. Maßgeblich sind die offiziellen Hege6-Unterlagen, Beschilderungen und geltenden Bestimmungen vor Ort. Nicht eindeutig verifizierbare Punkte werden bewusst nicht angezeigt.
