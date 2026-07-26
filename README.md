# MuchaGio Fishing Maps – Neckar Abschnitt 5

## Version 1.1.0 – Phase 1: GIS Audit
Build: 26.07.2026

### Änderungen
- OSM-Wasserlinien werden jetzt **vor dem Rendern auf die jeweilige Abschnitts-Bounding-Box beschnitten**. Zuvor konnten vollständige OSM-Ways über die vorgesehenen Bereiche hinaus angezeigt werden.
- Horkheim zeigt nur noch den **Schifffahrtskanal** (`waterway=canal`) und nicht zusätzlich frei verlaufende Neckar-Linien.
- Die Enz-Darstellung bei Besigheim wurde auf den kurzen offiziellen Orientierungsraum an Mündung und B27 verkleinert.
- Abschnittsmarker 01–04 bleiben reine Navigationsmarker und werden nur gesetzt, wenn eine plausible Gewässergeometrie in Reichweite gefunden wird.
- Verifizierte Bauwerksmarker werden auf die nächstgelegene Gewässerachse ausgerichtet. Dadurch liegen sie nicht mehr auf Straßen, Feldern oder in Ortslagen.
- Ein Prüfkreis wird nur noch angezeigt, wenn eine veröffentlichte Distanzregel vorliegt. Für das Wehr Besigheim werden 50 m als Orientierung gezeigt; am Böckinger Bauwerk wird bewusst kein pauschaler Kreis dargestellt.
- Satellitenansicht bleibt Standard.
- Version, Cache-Busting, Build-Datum und Info-Dialog wurden auf **v1.1.0** aktualisiert.

## GitHub Pages
Den **Inhalt** dieses Ordners in das Root-Verzeichnis des Repositorys hochladen. `index.html` muss direkt im Root liegen.

## Datenhinweis
Die Karte ist eine digitale Orientierungshilfe. Sie ersetzt weder die Hege6-Originalunterlagen noch Beschilderungen und Bestimmungen vor Ort. Die grünen Linien stellen Gewässergeometrien innerhalb der veröffentlichten Orientierungsräume dar, jedoch keine zentimetergenau vermessenen Ufer- oder Rechtsgrenzen.
