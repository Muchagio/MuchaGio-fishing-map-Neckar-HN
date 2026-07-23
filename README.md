# MuchaGio Fishing Maps – Neckar Abschnitt 5

## Version 0.9.2
Build: 23.07.2026

### Änderungen
- Satellitenansicht bleibt Standard und fest integriert.
- Keine frei gesetzten Abschnitts- oder Stadtmittelpunkt-Marker mehr.
- Schleusen und Wehre werden nur angezeigt, wenn ein echtes OpenStreetMap-Bauwerksobjekt in einem eng begrenzten Suchraum gefunden wird.
- Nicht verifizierbare Punkte bleiben bewusst ausgeblendet.
- Verifizierte Fallback-Koordinaten nur für Schleuse Heilbronn und Wehr Besigheim.
- GIS-Status zeigt, wie viele Bauwerke tatsächlich verifiziert eingeblendet wurden.
- Zentrale Versionsanzeige auf v0.9.2 aktualisiert.

## Veröffentlichung auf GitHub Pages
Den Inhalt dieses Ordners in das Veröffentlichungsverzeichnis des Repositorys kopieren. `index.html` muss auf der obersten veröffentlichten Ebene liegen.

## Hinweis
Die Darstellung dient der Orientierung. Maßgeblich sind die offiziellen Hege6-Unterlagen, lokale Beschilderung und geltende Vorschriften.

### Korrekturpaket r2
- Sichtbare Versionsnummer fest auf v0.9.2 gesetzt.
- Cache-Busting fuer GitHub Pages und Browser aktualisiert.
- Alte Service-Worker-Caches werden entfernt.


## Änderungen in v0.9.2
- Prüfbereiche als violette 90-m-Prüfhinweise direkt um verifizierte Bauwerke ergänzt.
- Bauwerksmarker werden nur angezeigt, wenn sie maximal 140 m von der geladenen Gewässergeometrie entfernt liegen.
- Abschnittsnavigation wird automatisch auf den nächstgelegenen Punkt des Neckars/der Enz gesetzt.
- Keine Nummernmarker oder frei gesetzten Stadtmarker mehr.
- Satellitenansicht bleibt Standard.
