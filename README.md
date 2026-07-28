# MuchaGio Fishing Maps

Digitale Angelkarten-Plattform auf Basis von Leaflet + statischem GeoJSON.
Läuft vollständig statisch auf GitHub Pages – **kein Backend, keine Datenbank, kein Node-Server**.

Aktueller Datenstand: Neckar / Enz, Hege6 – vier Abschnitte (Böckingen, Horkheim,
Lauffen, Besigheim). Die Architektur ist auf hunderte Gewässer ausgelegt.

---

## Kernprinzip

> **Angelbereiche werden digitalisiert, nicht generiert.**

OpenStreetMap ist ausschließlich die **Hintergrundkarte**. Alle Angeldaten
(Gewässergeometrie, Marker, Prüfbereiche) sind eigenständige, versionierte
GeoJSON-Dateien. Es gibt **keine** Laufzeit-Abfrage an Overpass mehr – das war die
Ursache der bisherigen Probleme (falscher Flussarm, doppelte/verkürzte Abschnitte,
Fehler an Schleusen/Wehren).

Neue Gewässer und neue Ebenen kommen **über Daten** dazu, nicht über Code – siehe
[`docs/adding-a-water.md`](docs/adding-a-water.md).

---

## Projektstruktur

```
index.html                  App-Shell (lädt Leaflet + ein ES-Modul)
manifest.webmanifest        PWA-Manifest (installierbar)
service-worker.js           Offline-Cache (App-Shell + besuchte Kacheln)
styles/
  tokens.css                EINZIGE Farb-/Design-Quelle (CSS-Variablen)
  app.css                   Layout & Komponenten
src/
  main.js                   Bootstrap / Verdrahtung
  i18n.js                   Sprach-Strings (Deutsch)
  core/                     constants, tokens, store, dataLoader, geo
  map/                      basemaps, mapController
  layers/                   layerManager (registry-getrieben), renderers
  ui/                       ui (Sidebar/Legende/Navigation), dialogs
data/
  registry.json             Manifest: Gewässer, Ebenentypen, Basemaps
  waters/<id>/
    section.geojson         Gewässergeometrie (LineString)
    markers.geojson         Marker (Point) – nach Typ getrennt gerendert
    review-areas.geojson    Prüfbereiche (Point + radiusM)
assets/
  reference/                offizielle Hege6-Karten & Fotoreferenzen
  icons/                    PWA-Icons
docs/                       Architektur & Arbeitsabläufe
```

---

## Lokale Entwicklung

ES-Module und `fetch()` brauchen einen HTTP-Server (nicht `file://`):

```bash
cd muchagio-fishing-maps
python3 -m http.server 8080
# http://localhost:8080
```

## Deployment (GitHub Pages)

Den **Inhalt** dieses Ordners in das Repository-Root legen (`index.html` muss direkt
im Root liegen). Pages liefert alles statisch aus. Bei jedem Release die Version in
`data/registry.json` **und** `CACHE_VERSION` in `service-worker.js` erhöhen, damit
alte Caches ersetzt werden.

---

## Datenhinweis

Die Karte ist eine digitale Orientierungshilfe. Maßgeblich bleiben die offiziellen
Hege6-Unterlagen, Beschilderungen und Bestimmungen vor Ort. Die aktuell gelieferte
Gewässergeometrie ist ein **OSM-Snapshot** (`properties.verified = false`) und muss
gegen die Hege6-Karten in QGIS geprüft/nachgezeichnet werden – siehe
[`docs/gis-workflow.md`](docs/gis-workflow.md).
