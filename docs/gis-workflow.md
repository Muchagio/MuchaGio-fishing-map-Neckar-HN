# GIS workflow – MuchaGio Fishing Maps

## Goal
Fishing overlays must follow real water geometry. Hand-drawn substitute lines are not allowed in stable releases.

## v0.7.0 implementation
1. The app requests `waterway=river|canal` geometries from the OpenStreetMap Overpass API.
2. Queries are limited to section-specific bounding boxes and names (`Neckar`, `Enz`, `Schifffahrtskanal`).
3. Returned OSM way geometries are rendered directly as Leaflet polylines.
4. Results are cached locally for seven days.
5. If GIS data cannot be loaded, the app shows no approximate replacement line.

## Accuracy status
- Water-course geometry: **Silver / GIS-based**
- Official section start/end: **Beta / approximate bounding boxes**
- Allowed bank side: **must be checked in official Hege6 documents**
- Restricted areas: **orientation only until georeferenced**

## Next Gold step
Georeference the official Hege6 maps in QGIS, digitize start/end and bank-side rules, validate against satellite imagery, then export static versioned GeoJSON files.
