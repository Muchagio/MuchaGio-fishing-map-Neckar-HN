# GIS-Workflow – von Entwurf zu geprüfter Geometrie

## Grundsatz

Angelbereiche folgen echter Gewässergeometrie und werden **manuell gepflegt**, nicht
zur Laufzeit generiert. Es gibt keine amtlichen GIS-Datensätze – Quellen sind die
offiziellen Hege6-Karten/PDFs, Satellitenbilder und OpenStreetMap.

## Genauigkeitsstufen (`properties.verified`)

- **`false` – Bronze/Entwurf:** aktueller Stand aller vier Abschnitte. Die Geometrie
  ist ein einmaliger OSM-Snapshot (28.07.2026), zur Reduktion vereinfacht. Die App
  markiert diese Abschnitte im Popup als Entwurf.
- **`true` – Gold/geprüft:** in QGIS gegen die Hege6-Originalunterlagen
  nachgezeichnet und gegen Satellitenbild validiert.

## Der Snapshot (wie der aktuelle Stand entstand)

Die früheren Overpass-Bounding-Boxen wurden **einmalig** abgefragt und als statisches
GeoJSON eingefroren; Overpass ist damit aus der Laufzeit entfernt. Dabei bestätigte
sich ein Altfehler: der Horkheimer Kanal heißt in OSM **„Mühlkanal"**. Der
Horkheim-Snapshot enthält daher bewusst **sowohl** die Neckar- als auch die
Kanal-Wege – beim Nachzeichnen den korrekten Verlauf auswählen und den Rest löschen.

## Gold-Schritt in QGIS (empfohlen)

1. Offizielle Hege6-Karte(n) laden (Downloads unter „Gewässer" auf hege6.de) und in
   QGIS georeferenzieren (Georeferencer, Passpunkte auf markanten Ecken).
2. Satellitenbild als Kontrolllayer (z. B. Esri World Imagery).
3. Den bestehenden `section.geojson`-Entwurf als Layer laden und entlang
   Karte + Satellit korrigieren: richtiger Uferverlauf, Anfang/Ende an den
   km-Grenzen, erlaubte Uferseite.
4. Marker (Schleuse, Wehr, Parkplatz, Zugang …) als Punktlayer digitalisieren.
5. Prüf-/Sperrbereiche als Punkte mit `radiusM` erfassen.
6. Als **GeoJSON exportieren** (CRS **EPSG:4326 / WGS84**), Koordinaten auf ~6
   Nachkommastellen. `properties.verified` auf `true` setzen.
7. Dateien in `data/waters/<id>/` ersetzen, Version in `registry.json` erhöhen,
   committen. Kein Code-Change nötig.

## Validierung vor dem Release

- GeoJSON-Struktur & Koordinatenbereich prüfen (Lng ~8–10, Lat ~48–50 für die Region).
- Im lokalen Server (`python3 -m http.server`) sichten: richtiger Verlauf, korrekte
  Uferseite, Marker am richtigen Bauwerk.
- `CACHE_VERSION` in `service-worker.js` erhöhen, damit Nutzer die neuen Daten erhalten.
