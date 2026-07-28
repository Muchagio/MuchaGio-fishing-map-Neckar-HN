# Architektur – MuchaGio Fishing Maps v2.0

## Ausgangslage (v1.1.1) und warum sie umgebaut wurde

Die alte App bestand aus einer einzigen Closure (`app.js`) und einem globalen
Datenobjekt. Angelbereiche wurden **zur Laufzeit** aus OpenStreetMap über die
Overpass-API erzeugt: pro Abschnitt eine Bounding-Box + Namens-Regex, das Ergebnis
wurde als Polylinie gezeichnet und Marker auf die nächste Wasserlinie „gesnappt".

Das war die Wurzel aller gemeldeten Probleme:

- **Falscher Flussarm / falscher Kanal:** die Regex traf mehrere OSM-Wege. Konkret
  belegt: der Horkheimer Kanal heißt in OSM **„Mühlkanal"**, nicht „Neckar" – die
  alte Abfrage (`name ~ Neckar|Schifffahrtskanal`, `waterway=canal`) fand dort
  **gar nichts**.
- **Doppelte / verkürzte Abschnitte:** mehrere OSM-Wege bzw. Beschnitt an den
  Bounding-Box-Kanten.
- **Fehler an Schleusen/Wehren:** OSM-Tagging ist dort uneinheitlich.
- **Verschwindende Abschnitte:** schlug die Abfrage fehl, wurde nur `console.warn`
  ausgegeben und der Abschnitt fiel weg. Da auch der Navigationsmarker auf die
  geladene Geometrie gesnappt wurde, degradierte bei langsamer/fehlender Overpass-
  Antwort der ganze Abschnitt.
- **PWA faktisch deaktiviert:** der alte Service Worker löschte bei `install`/
  `activate` alle Caches, und `app.js` deregistrierte zusätzlich bei jedem Laden
  alle Worker und leerte alle Caches. Es gab kein Manifest und keine Icons – also
  weder Offline-Fähigkeit noch Installierbarkeit.
- **Nicht datengetrieben:** ein neues Gewässer erforderte Änderungen im Code; ein
  neuer Ebenentyp sogar Änderungen in HTML, CSS und JS gleichzeitig.

## Zielbild

Eine datengetriebene GIS-Plattform: **die App ist eine Render-Engine, die Gewässer
liegen als Daten vor.** Neue Gewässer/Ebenen = neue Daten, kein Code.

## Bausteine

```
                         registry.json
                              │  (Gewässer, Ebenentypen, Basemaps)
                              ▼
main.js ──► dataLoader ──► LayerManager ──► renderers ──► Leaflet
   │                          │                              ▲
   ├──► BasemapManager ───────┼──────────────────────────────┘
   ├──► initDialogs           │
   └──► initUI ◄──────────────┘  (Sidebar/Legende dynamisch aus aktiven Ebenen)
```

### Datenschicht

- **`registry.json`** ist das Manifest: Liste der Gewässer, der **Ebenentypen**
  (Farbe, Icon, Legende, Geometrieart, Quelle) und der Basemaps.
- Pro Gewässer drei GeoJSON-Dateien: `section.geojson` (Linien),
  `markers.geojson` (Punkte, per `properties.type` einem Ebenentyp zugeordnet),
  `review-areas.geojson` (Punkte mit `radiusM`).
- **Marker sind nie in der Abschnittsgeometrie eingebettet** – jede Sorte liegt in
  eigenen Dateien, aber alles im selben, werkzeug-neutralen GeoJSON-Format
  (QGIS-kompatibel, kein Eigenformat).

### Ebenensystem (Kern)

`LayerManager` erzeugt **eine Leaflet-`layerGroup` pro Ebenentyp**, aggregiert über
alle Gewässer. Ein Toggle steuert diesen Typ damit überall. Beim Laden werden
Marker-Features anhand `properties.type` automatisch dem passenden Ebenentyp
zugeordnet. Die Sidebar-Toggles und die Legende werden **nur für Ebenentypen mit
tatsächlichen Daten** erzeugt (`activeTypeDefs()`), d. h. sobald neue Daten
hinzukommen, erscheinen die Bedienelemente von selbst.

### Styling / Design-Tokens

Alle Farben stehen **ausschließlich** in `styles/tokens.css` als CSS-Variablen.
`src/core/tokens.js` liest exakt dieselben Variablen zur Laufzeit – JS und CSS
können nicht mehr auseinanderlaufen. Ebenentypen referenzieren ihre Farbe über
`colorVar` (z. B. `--layer-lock`). Keine hartcodierten Hex-Werte im Code.

### Karte

`OpenStreetMap`/`Esri` sind reine Kachel-Hintergründe (`BasemapManager`).
`preferCanvas: true` für performantes Vektor-Rendering. Die Navigationsmarker sitzen
jetzt auf `water.center` aus der Registry – **kein Laufzeit-Snapping mehr**.

### PWA

Echtes, installierbares PWA: Manifest + Icons + ein Service Worker mit
*stale-while-revalidate* für die App-Shell/Daten und *network-first* für
Kartenkacheln (besuchte Kacheln werden gecacht → Grundlage für „Offline Maps").

## Wie die Analyse-Befunde adressiert wurden

| Befund (v1.1.1) | Lösung (v2.0) |
|---|---|
| Laufzeit-Overpass, unzuverlässig | Statisches, versioniertes GeoJSON; Overpass entfernt |
| Falscher Kanal (Horkheim) | Digitalisierung statt Namens-Regex; Snapshot als Entwurf markiert |
| Marker verschwinden bei Snap-Distanz | Marker haben feste Koordinaten, kein Verstecken |
| Kaputte PWA (Cache-Löschung) | Neuer SW mit echtem Offline-Cache, Manifest, Icons |
| Nicht datengetrieben | Registry + GeoJSON; neue Gewässer/Ebenen ohne Code |
| Farben doppelt (CSS+JS) | Ein Token-Satz, von beiden gelesen |
| Ein globaler Closure, Globals | ES-Module, klare Verantwortlichkeiten, kaum Globals |
| Magische Zahlen | `constants.js` + Tokens |

## Roadmap-Anschluss

Jedes künftige Feature ist ein Ebenentyp + eine Datei-Konvention und braucht keine
Architekturänderung:

- **Offline Maps** – SW-Kachel-Cache existiert; nur UI zum Vorab-Download nötig.
- **GPX Import/Export, Tracks** – Ebenentyp `gpx_track`, GeoJSON-LineStrings.
- **Fotos / Tiefen- / Heatmaps** – Ebenentypen `photos` / `depth_map` / `heat_map`.
- **Favoriten / Notizen / Fangmeldungen** – `core/store.js` ist der Persistenz-Seam.
- **Regeln, Schonzeiten, Mindestmaße, Fischarten** – als `properties` an Gewässern/
  Markern bzw. eigene Datendateien, im Detail-Panel darstellbar.
- **Mehrsprachigkeit** – `i18n.js` ist vorbereitet.
