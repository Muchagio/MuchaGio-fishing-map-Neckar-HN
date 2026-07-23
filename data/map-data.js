'use strict';

window.MUCHA_MAP_DATA = {
  meta: {
    version: '0.7.0',
    buildDate: '2026-07-23',
    dataStatus: 'OSM waterway geometry at runtime; official section limits approximate',
    disclaimer: 'Orientierungsdarstellung. Maßgeblich sind die aktuellen Originalunterlagen, Verbotsschilder und die Gewässerordnung.'
  },
  sections: [
    {
      id: 'boeckingen', number: '01', shortTitle: 'Böckingen', title: 'Oberwasser HN-Böckingen',
      subtitle: 'km 113,53 bis km 114,11', center: [49.1485, 9.2014], zoom: 15,
      officialUrl: 'https://www.hege6.de/unser-gew%C3%A4sser/oberwasser-hn-b%C3%B6ckingen/',
      refs: [
        ['assets/reference/boeckingen-karte.png', 'Vereinskarte · Oberwasser HN-Böckingen'],
        ['assets/reference/boeckingen-detail.png', 'Fotoreferenz · Schleuse Heilbronn']
      ]
    },
    {
      id: 'horkheim', number: '02', shortTitle: 'Horkheim', title: 'Schifffahrtskanal Horkheim',
      subtitle: 'Uferseiten und Kilometergrenzen laut Hege6-Unterlagen', center: [49.1125, 9.1789], zoom: 14,
      officialUrl: 'https://www.hege6.de/unser-gew%C3%A4sser/kanal-horkheim/',
      refs: [
        ['assets/reference/horkheim-01.png', 'Vereinskarte · Horkheim 1'],
        ['assets/reference/horkheim-02.png', 'Vereinskarte · Horkheim 2'],
        ['assets/reference/horkheim-03.png', 'Fotoreferenz · oberhalb der Schleuse'],
        ['assets/reference/horkheim-04.png', 'Fotoreferenz · unterhalb der Schleuse']
      ]
    },
    {
      id: 'lauffen', number: '03', shortTitle: 'Lauffen', title: 'Neckar bei Lauffen bis Besigheim',
      subtitle: 'km 122,75 bis km 136,15', center: [49.0475, 9.1470], zoom: 12,
      officialUrl: 'https://www.hege6.de/unser-gew%C3%A4sser/neckar-bei-lauffen/',
      refs: [['assets/reference/lauffen-karte.png', 'Vereinskarte · Neckar bei Lauffen']]
    },
    {
      id: 'besigheim', number: '04', shortTitle: 'Besigheim', title: 'Mündung Enz bei Besigheim',
      subtitle: 'Enzmündung, B27 und lokale Sperrbereiche beachten', center: [49.0005, 9.1439], zoom: 16,
      officialUrl: 'https://www.hege6.de/unser-gew%C3%A4sser/m%C3%BCndung-enz-besigheim/',
      refs: [
        ['assets/reference/besigheim-01.png', 'Fotoreferenz · Enz / B27'],
        ['assets/reference/besigheim-02.png', 'Vereinskarte · Besigheim / Hege6–Hege7'],
        ['assets/reference/besigheim-03.png', 'Fotoreferenz · Grenzmarkierung'],
        ['assets/reference/besigheim-04.png', 'Fotoreferenz · Enz flussabwärts']
      ]
    }
  ],

  // Each source is queried directly from OpenStreetMap via Overpass.
  // This replaces the former hand-drawn corridors. The bbox limits the
  // visible waterway segment; official start/end points are still approximate.
  osmWaterSources: [
    {
      id: 'boeckingen-water', sectionId: 'boeckingen', title: 'Angelbereich Böckingen (GIS)',
      note: 'Wasserverlauf aus OpenStreetMap. Abschnittsgrenzen und Uferfreigabe mit der offiziellen Karte prüfen.',
      bbox: [49.1415, 9.1940, 49.1545, 9.2075],
      nameRegex: 'Neckar', types: ['river','canal']
    },
    {
      id: 'horkheim-water', sectionId: 'horkheim', title: 'Schifffahrtskanal Horkheim (GIS)',
      note: 'Kanal-/Neckar-Geometrie aus OpenStreetMap. Erlaubte Uferseite abschnittsweise in den Hege6-Unterlagen prüfen.',
      bbox: [49.0975, 9.1715, 49.1305, 9.1865],
      nameRegex: 'Neckar|Schifffahrtskanal', types: ['river','canal']
    },
    {
      id: 'lauffen-water', sectionId: 'lauffen', title: 'Neckar Lauffen–Besigheim (GIS)',
      note: 'Exakte OSM-Gewässerachse innerhalb des offiziellen Orientierungsraums. Lokale Sperrflächen separat prüfen.',
      bbox: [49.0000, 9.1370, 49.0925, 9.1715],
      nameRegex: 'Neckar', types: ['river','canal']
    },
    {
      id: 'enz-water', sectionId: 'besigheim', title: 'Enz bei Besigheim (GIS)',
      note: 'Enz-Geometrie aus OpenStreetMap. Hege6-/Hege7-Grenze und Schutzbereiche anhand der offiziellen Karte prüfen.',
      bbox: [48.9965, 9.1360, 49.0035, 9.1495],
      nameRegex: 'Enz', types: ['river','canal']
    }
  ],

  warningZones: [
    {id:'boeckingen-lock', sectionId:'boeckingen', title:'Schleusen-/Wehrbereich prüfen', center:[49.1444,9.1986], radius:90, note:'Sicherheits- und Sperrabstände vor Ort sowie Originalkarte beachten.'},
    {id:'horkheim-north', sectionId:'horkheim', title:'Nördlicher Übergangsbereich prüfen', center:[49.1280,9.1810], radius:85, note:'Übergang, Uferseite und Beschilderung anhand der Originalunterlagen prüfen.'},
    {id:'horkheim-lock', sectionId:'horkheim', title:'Schleuse Horkheim – Sperrbereich prüfen', center:[49.1003,9.1770], radius:110, note:'Rund um Schleusen-, Wehr- und Betriebsanlagen können Verbote gelten.'},
    {id:'lauffen-weir', sectionId:'lauffen', title:'Wehr-/Schleusenbereich Lauffen prüfen', center:[49.0690,9.1460], radius:115, note:'Lokale Sperrflächen und Sicherheitsabstände sind in der Originalkarte und vor Ort zu prüfen.'},
    {id:'besigheim-lock', sectionId:'besigheim', title:'Schleuse/Wehr Besigheim', center:[49.0021,9.1450], radius:105, note:'Lokale Schon- und Sperrgebiete sowie gesetzliche Abstände beachten.'},
    {id:'enz-fishpass', sectionId:'besigheim', title:'Fischtreppe / Schonbereich prüfen', center:[48.9992,9.1413], radius:85, note:'Hege6 nennt Schutzabstände an Fischtreppen. Beschilderung vor Ort ist maßgeblich.'}
  ]
};
