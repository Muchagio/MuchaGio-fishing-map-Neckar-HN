# MuchaGio Fishing Map – Neckar HN

Private interaktive Referenzkarte auf Basis der bereitgestellten Hege6-Vereinskarten.

## Aktueller Stand: v0.1

- OpenStreetMap-Grundkarte
- Mobile und Desktop
- Abschnitte Böckingen, Horkheim, Lauffen und Besigheim/Enz
- Originale Referenzbilder direkt in der App
- Orientierungslinien und Abschnittsmarker
- PWA-Grundstruktur

> **Hinweis:** Die Orientierungslinien sind keine amtliche Grenzgeometrie. Maßgeblich bleiben Erlaubnisschein, Gewässerordnung und die in der App hinterlegten Vereinsunterlagen.

## Auf GitHub Pages veröffentlichen

1. Alle Dateien aus diesem Projekt in das Repository hochladen.
2. In GitHub: **Settings → Pages**.
3. Unter **Build and deployment**: `Deploy from a branch` wählen.
4. Branch `main`, Ordner `/ (root)` wählen und speichern.
5. Nach kurzer Wartezeit zeigt GitHub die öffentliche Pages-Adresse an.

## Lokaler Test

Wegen Browser-Sicherheitsregeln am besten über einen kleinen lokalen Server öffnen:

```bash
python3 -m http.server 8000
```

Dann `http://localhost:8000` öffnen.
