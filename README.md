# MuchaGio Fishing Map – v0.4.0

Erste langfristig strukturierte Orientierungsversion für Neckar Abschnitt 5.

## Neu

- grobe grüne Angelkorridore direkt auf dem Wasser
- rote Sperr-/Prüfbereiche rund um sensible Anlagen
- getrennte Layer-Schalter für Angelbereiche, Prüfzonen und Marker
- Marker näher am Wasser
- Originalunterlagen und offizielle Hege6-Seiten direkt aus jedem Abschnitt erreichbar
- zentrale Datenhaltung in `data/map-data.js`, damit weitere Gewässer später modular ergänzt werden können

## Wichtiger Hinweis

Die dargestellten Linien und Kreise sind bewusst als **ca.** gekennzeichnet. Sie dienen der schnellen Orientierung und sind keine amtlich vermessenen Grenzen. Maßgeblich bleiben die aktuellen Originalunterlagen, Verbotsschilder, gesetzlichen Schutzabstände und die Gewässerordnung.

## Installation auf GitHub Pages

1. ZIP entpacken.
2. Den kompletten Inhalt des Ordners in das Repository hochladen.
3. Gleichnamige Dateien überschreiben.
4. Committen.
5. Danach die Seite mit `?v=040` öffnen oder einen Hard-Reload ausführen.

## Datenstruktur

- `data/map-data.js`: Abschnitte, grobe Angelkorridore und Prüfzonen
- `assets/reference/`: Originalunterlagen
- `app.js`: Kartenlogik und UI
- `styles.css`: Design
