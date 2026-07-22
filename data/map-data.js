'use strict';

window.MUCHA_MAP_DATA = {
  meta: {
    version: '0.5.0',
    updated: '2026-07-22',
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
  allowedCorridors: [
    {
      id: 'boeckingen-allowed', sectionId: 'boeckingen', title: 'Angelbereich Böckingen (ca.)',
      note: 'Digitale Orientierung entlang des Neckars. Exakte Anfangs- und Endpunkte bitte mit der Originalkarte prüfen.',
      coordinates: [[49.1444,9.1989],[49.1454,9.1995],[49.1465,9.2000],[49.1477,9.2008],[49.1489,9.2015],[49.1501,9.2020],[49.1512,9.2024]]
    },
    {
      id: 'horkheim-channel', sectionId: 'horkheim', title: 'Schifffahrtskanal Horkheim (ca.)',
      note: 'Orientierung entlang des Kanals. Welche Uferseite freigegeben ist, muss abschnittsweise in den Hege6-Unterlagen geprüft werden.',
      coordinates: [[49.1280,9.1811],[49.1252,9.1808],[49.1222,9.1804],[49.1192,9.1800],[49.1160,9.1795],[49.1128,9.1790],[49.1096,9.1785],[49.1064,9.1780],[49.1031,9.1775],[49.1002,9.1770]]
    },
    {
      id: 'lauffen-besigheim', sectionId: 'lauffen', title: 'Neckar Lauffen–Besigheim (ca.)',
      note: 'Der Verlauf wurde als Orientierung enger an den sichtbaren Neckar gelegt. Lokale Sperrbereiche und Uferfreigaben separat prüfen.',
      coordinates: [[49.0890,9.1640],[49.0860,9.1580],[49.0820,9.1520],[49.0770,9.1470],[49.0720,9.1440],[49.0680,9.1460],[49.0640,9.1520],[49.0590,9.1580],[49.0540,9.1590],[49.0500,9.1550],[49.0460,9.1490],[49.0420,9.1430],[49.0370,9.1390],[49.0320,9.1370],[49.0270,9.1390],[49.0220,9.1440],[49.0170,9.1490],[49.0120,9.1510],[49.0070,9.1480],[49.0020,9.1450]]
    },
    {
      id: 'enz-mouth', sectionId: 'besigheim', title: 'Enz bei Besigheim (ca.)',
      note: 'Kurzer Orientierungsabschnitt von der Mündung in Richtung B27. Die offizielle Hege6-Karte ist maßgeblich.',
      coordinates: [[49.0007,9.1438],[49.0002,9.1429],[48.9997,9.1419],[48.9992,9.1408],[48.9987,9.1398]]
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
