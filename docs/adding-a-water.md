# Ein neues Gewässer hinzufügen (ohne Code)

Ein Gewässer besteht aus **einem Registry-Eintrag** und **einem Datenordner**.
Kein JavaScript, kein HTML, kein CSS.

## 1. Datenordner anlegen

```
data/waters/<id>/
  section.geojson         Pflicht – die Gewässergeometrie (LineString-Features)
  markers.geojson         optional – Punkte (Schleusen, Parkplätze, …)
  review-areas.geojson    optional – Prüfbereiche (Punkt + radiusM)
```

Fehlt eine optionale Datei, lege eine leere Sammlung an:

```json
{ "type": "FeatureCollection", "features": [] }
```

### section.geojson

```json
{
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature",
      "properties": { "name": "Neckar", "verified": true, "source": "Hege6-Karte 2026" },
      "geometry": { "type": "LineString",
        "coordinates": [[9.1000, 49.1000], [9.1010, 49.1015]] } }
  ]
}
```

> GeoJSON speichert Koordinaten als **`[Längengrad, Breitengrad]`** (lng, lat).
> `verified: true` entfernt den Entwurf-Hinweis im Popup.

### markers.geojson

Jedes Feature ist ein Punkt; `properties.type` bestimmt die Ebene (muss einer
`layerType.id` mit `"source": "markers"` entsprechen, z. B. `lock`, `weir`,
`parking`, `access`, `slipway`, `viewpoint`, `information`, `warning`,
`fishing_spot`, `no_fishing`):

```json
{ "type": "Feature",
  "properties": {
    "id": "steg-nord", "type": "access", "title": "Uferzugang Nord",
    "description": "Flacher Einstieg, gut erreichbar.",
    "source": "Vor-Ort-Prüfung", "verified": true, "icon": "↧"
  },
  "geometry": { "type": "Point", "coordinates": [9.1005, 49.1008] } }
```

### review-areas.geojson

```json
{ "type": "Feature",
  "properties": { "title": "Prüfbereich Wehr", "radiusM": 50,
                  "description": "Orientierung, keine Rechtsgrenze.", "verified": true },
  "geometry": { "type": "Point", "coordinates": [9.1005, 49.1008] } }
```

## 2. Registry-Eintrag ergänzen

In `data/registry.json` unter `"waters"` ein Objekt hinzufügen:

```json
{
  "id": "neu-id",
  "number": 5,
  "name": "Vollständiger Titel",
  "short": "Kurzname",
  "subtitle": "km-Angabe o. Ä.",
  "region": "Neckar",
  "waterType": "river",
  "center": [49.1008, 9.1005],
  "zoom": 15,
  "officialUrl": "https://www.hege6.de/...",
  "references": [["assets/reference/bild.png", "Bildunterschrift"]],
  "layers": {
    "section": "data/waters/neu-id/section.geojson",
    "markers": "data/waters/neu-id/markers.geojson",
    "review_areas": "data/waters/neu-id/review-areas.geojson"
  }
}
```

> `center` ist hier `[Breitengrad, Längengrad]` (Leaflet-Konvention), weil es die
> Kameraposition steuert – nicht GeoJSON.

Fertig. Die App lädt das Gewässer automatisch, erzeugt Toggle + Legende für alle
vorhandenen Ebenentypen und nimmt es in die Gewässerauswahl auf.

## Einen neuen Ebenentyp hinzufügen

Ebenfalls nur Daten: in `registry.json` unter `"layerTypes"` einen Eintrag ergänzen
(mit `id`, `label`, `group`, `source`, `geometry`, `colorVar`, `icon`, `legend`).
Farbe zusätzlich als Variable in `styles/tokens.css` definieren (z. B.
`--layer-mein-typ: #ffcc00;`). Danach Features mit `"type": "mein-typ"` in
`markers.geojson` – der Toggle erscheint automatisch.
