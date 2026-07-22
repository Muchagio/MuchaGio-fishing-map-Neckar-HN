'use strict';

window.MUCHA_MAP_DATA = {
  meta: {
    version: '0.4.0',
    updated: '2026-07-22',
    disclaimer: 'Orientierungsdarstellung. Maßgeblich sind die aktuellen Originalunterlagen, Verbotsschilder und die Gewässerordnung.'
  },
  sections: [
    {
      id: 'boeckingen', number: '01', title: 'Oberwasser HN-Böckingen',
      subtitle: 'km 113,53 bis km 114,11', center: [49.1478, 9.1955], zoom: 16,
      officialUrl: 'https://www.hege6.de/unser-gew%C3%A4sser/oberwasser-hn-b%C3%B6ckingen/',
      refs: [
        ['assets/reference/boeckingen-karte.png', 'Vereinskarte · Oberwasser HN-Böckingen'],
        ['assets/reference/boeckingen-detail.png', 'Fotoreferenz · Schleuse Heilbronn']
      ]
    },
    {
      id: 'horkheim', number: '02', title: 'Schifffahrtskanal Horkheim',
      subtitle: 'Rechtes und linkes Ufer mit unterschiedlichen Kilometergrenzen', center: [49.1118, 9.1767], zoom: 14,
      officialUrl: 'https://www.hege6.de/unser-gew%C3%A4sser/kanal-horkheim/',
      refs: [
        ['assets/reference/horkheim-01.png', 'Vereinskarte · Horkheim 1'],
        ['assets/reference/horkheim-02.png', 'Vereinskarte · Horkheim 2'],
        ['assets/reference/horkheim-03.png', 'Fotoreferenz · oberhalb der Schleuse'],
        ['assets/reference/horkheim-04.png', 'Fotoreferenz · unterhalb der Schleuse']
      ]
    },
    {
      id: 'lauffen', number: '03', title: 'Neckar bei Lauffen bis Besigheim',
      subtitle: 'km 122,75 bis km 136,15', center: [49.0430, 9.1535], zoom: 12,
      officialUrl: 'https://www.hege6.de/unser-gew%C3%A4sser/neckar-bei-lauffen/',
      refs: [['assets/reference/lauffen-karte.png', 'Vereinskarte · Neckar bei Lauffen']]
    },
    {
      id: 'besigheim', number: '04', title: 'Mündung Enz bei Besigheim',
      subtitle: 'Enzmündung, B27 und lokale Sperrbereiche beachten', center: [49.0002, 9.1438], zoom: 16,
      officialUrl: 'https://www.hege6.de/unser-gew%C3%A4sser/m%C3%BCndung-enz-besigheim/',
      refs: [
        ['assets/reference/besigheim-01.png', 'Fotoreferenz · Enz / B27'],
        ['assets/reference/besigheim-02.png', 'Vereinskarte · Besigheim / Hege6–Hege7'],
        ['assets/reference/besigheim-03.png', 'Fotoreferenz · Grenzmarkierung'],
        ['assets/reference/besigheim-04.png', 'Fotoreferenz · Enz flussabwärts']
      ]
    }
  ],

  // Grobe Achsen entlang des Wassers. Keine amtlich vermessenen Ufergrenzen.
  allowedCorridors: [
    {
      id: 'boeckingen-allowed', sectionId: 'boeckingen', title: 'Angelbereich Böckingen (ca.)',
      note: 'Orientierung zwischen Wehr/Schleuse und Böckinger Brücke.',
      coordinates: [[49.1446,9.1938],[49.1460,9.1943],[49.1476,9.1951],[49.1492,9.1960],[49.1508,9.1967]]
    },
    {
      id: 'horkheim-right', sectionId: 'horkheim', title: 'Rechtes Ufer Horkheim (ca.)',
      note: 'In Fließrichtung rechtes Ufer, offiziell km 116,92 bis km 119,98.',
      coordinates: [[49.1260,9.1791],[49.1225,9.1787],[49.1185,9.1780],[49.1140,9.1772],[49.1095,9.1763],[49.1050,9.1754],[49.1013,9.1747]]
    },
    {
      id: 'horkheim-left', sectionId: 'horkheim', title: 'Linkes Ufer Horkheim (ca.)',
      note: 'In Fließrichtung linkes Ufer, offiziell km 117,7 bis km 119,84.',
      coordinates: [[49.1207,9.1768],[49.1170,9.1761],[49.1130,9.1753],[49.1090,9.1745],[49.1051,9.1738],[49.1020,9.1732]]
    },
    {
      id: 'lauffen-besigheim', sectionId: 'lauffen', title: 'Neckar Lauffen–Besigheim (ca.)',
      note: 'Grober Verlauf des langen Hege6-Abschnitts; lokale Sperrbereiche separat prüfen.',
      coordinates: [[49.0815,9.1560],[49.0760,9.1515],[49.0690,9.1460],[49.0615,9.1450],[49.0540,9.1500],[49.0470,9.1570],[49.0390,9.1620],[49.0310,9.1600],[49.0230,9.1555],[49.0150,9.1510],[49.0070,9.1470],[49.0015,9.1445]]
    },
    {
      id: 'enz-mouth', sectionId: 'besigheim', title: 'Enz bei Besigheim (ca.)',
      note: 'Kurzer Orientierungsabschnitt ab Mündung in Richtung B27; offizielle Karte prüfen.',
      coordinates: [[49.0006,9.1438],[48.9997,9.1428],[48.9989,9.1415],[48.9982,9.1400]]
    }
  ],

  warningZones: [
    {id:'boeckingen-lock', sectionId:'boeckingen', title:'Schleusen-/Wehrbereich prüfen', center:[49.1444,9.1935], radius:110, note:'Sicherheits- und Sperrabstände vor Ort sowie Originalkarte beachten.'},
    {id:'horkheim-lock', sectionId:'horkheim', title:'Schleuse Horkheim – Sperrbereich prüfen', center:[49.1012,9.1744], radius:120, note:'Rund um Schleusen-, Wehr- und Betriebsanlagen können Verbote gelten.'},
    {id:'horkheim-island', sectionId:'horkheim', title:'Betriebsgelände / Inselspitze', center:[49.1024,9.1728], radius:90, note:'Eingezäuntes Betriebsgelände und ausgeschilderte Bereiche nicht betreten.'},
    {id:'besigheim-lock', sectionId:'besigheim', title:'Schleuse/Wehr Besigheim', center:[49.0021,9.1450], radius:120, note:'Lokale Schon- und Sperrgebiete sowie gesetzliche Abstände beachten.'},
    {id:'enz-fishpass', sectionId:'besigheim', title:'Fischtreppe / Schonbereich prüfen', center:[48.9992,9.1416], radius:100, note:'Hege6 nennt Schutzabstände an Fischtreppen. Beschilderung vor Ort ist maßgeblich.'}
  ]
};
