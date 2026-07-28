# Deployment über GitHub Web (ohne Terminal)

Ziel: Der **Inhalt** dieses Projekts liegt im **Root** des Repos
`MuchaGio-fishing-map-Neckar-HN`, sodass `index.html` direkt unter
`https://muchagio.github.io/MuchaGio-fishing-map-Neckar-HN/` erreichbar ist.

## Schritt 1 – ZIP entpacken
`muchagio-fishing-maps.zip` herunterladen und entpacken. Du erhältst den Ordner
`muchagio-fishing-maps/` mit `index.html`, `manifest.webmanifest`,
`service-worker.js`, `README.md`, `DEPLOY.md` und den Ordnern
`src/`, `data/`, `styles/`, `assets/`, `docs/`.

## Schritt 2 – Alte Dateien im Repo löschen
Damit sich Alt und Neu nicht mischen, im Repo diese Dateien entfernen
(GitHub-Web: Datei öffnen → Papierkorb-Symbol → „Commit changes"):

- `app.js`
- `data/map-data.js`
- `styles.css`
- das **alte** `service-worker.js` (wird in Schritt 3 durch das neue ersetzt)
- das **alte** `index.html` (wird ebenfalls ersetzt)

> `assets/reference/` (die Vereinskarten/Fotos) **behalten** – die werden weiter genutzt.

## Schritt 3 – Neue Dateien hochladen
1. Im Repo auf **„Add file" → „Upload files"**.
2. Aus dem entpackten `muchagio-fishing-maps/` **alle Elemente gemeinsam
   markieren** – also `index.html`, `manifest.webmanifest`, `service-worker.js`,
   `README.md`, `DEPLOY.md` **und** die Ordner `src`, `data`, `styles`,
   `assets`, `docs` – und in das Upload-Feld ziehen.
   (Chrome überträgt die Unterordner-Struktur automatisch mit.)
   **Wichtig:** nicht den Ordner `muchagio-fishing-maps` selbst ziehen, sondern
   seinen Inhalt – `index.html` muss im Root landen.
3. Commit-Nachricht z. B. `v2.1.0 – datengetriebene Architektur` eintragen und
   **„Commit changes"**.

## Schritt 4 – GitHub Pages prüfen
Repo → **Settings → Pages**:
- Source: **Deploy from a branch**
- Branch: **main** (oder dein Standardbranch), Ordner **/(root)** → Save.

Nach ~1 Minute ist die neue Version live. Zum Prüfen einmal **hart neu laden**
(Strg/Cmd + Shift + R), damit der alte Service-Worker-Cache ersetzt wird.

## Bei jedem künftigen Update
In `data/registry.json` das Feld `meta.version` **und** in `service-worker.js`
die Konstante `CACHE_VERSION` erhöhen – sonst sehen Nutzer wegen des Caches
weiter die alte Version.

## Kontrolle: läuft es?
- Karte lädt, Satellit-Hintergrund, vier Abschnitte in der Auswahl unten.
- Sidebar zeigt Ebenen-Schalter (Angelbereiche, Prüfbereiche, Schleusen, Wehre)
  und die grün/rot markierten Regeln je Abschnitt.
- Info-Dialog (ⓘ) zeigt „GIS aktiv: 4 Gewässer geladen …".
- Auf dem Handy im Browser-Menü „Zum Startbildschirm hinzufügen" → installierbar.
