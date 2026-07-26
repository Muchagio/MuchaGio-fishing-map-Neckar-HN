'use strict';
window.MUCHA_MAP_DATA={
 meta:{version:'1.0.0',buildDate:'2026-07-24',disclaimer:'Orientierungsdarstellung. Maßgeblich sind Originalunterlagen und Beschilderung.'},
 sections:[
  {id:'boeckingen',number:'01',shortTitle:'Böckingen',title:'Oberwasser HN-Böckingen',subtitle:'km 113,53 bis km 114,11',center:[49.1485,9.2014],zoom:15,officialUrl:'https://www.hege6.de/unser-gew%C3%A4sser/oberwasser-hn-b%C3%B6ckingen/',refs:[['assets/reference/boeckingen-karte.png','Vereinskarte · Oberwasser HN-Böckingen'],['assets/reference/boeckingen-detail.png','Fotoreferenz · Schleuse Heilbronn']]},
  {id:'horkheim',number:'02',shortTitle:'Horkheim',title:'Schifffahrtskanal Horkheim',subtitle:'Uferseiten und Kilometergrenzen laut Hege6',center:[49.1125,9.1789],zoom:14,officialUrl:'https://www.hege6.de/unser-gew%C3%A4sser/kanal-horkheim/',refs:[['assets/reference/horkheim-01.png','Vereinskarte · Horkheim 1'],['assets/reference/horkheim-02.png','Vereinskarte · Horkheim 2'],['assets/reference/horkheim-03.png','Fotoreferenz · oberhalb der Schleuse'],['assets/reference/horkheim-04.png','Fotoreferenz · unterhalb der Schleuse']]},
  {id:'lauffen',number:'03',shortTitle:'Lauffen',title:'Neckar bei Lauffen bis Besigheim',subtitle:'km 122,75 bis km 136,15',center:[49.0475,9.1470],zoom:12,officialUrl:'https://www.hege6.de/unser-gew%C3%A4sser/neckar-bei-lauffen/',refs:[['assets/reference/lauffen-karte.png','Vereinskarte · Neckar bei Lauffen']]},
  {id:'besigheim',number:'04',shortTitle:'Besigheim',title:'Mündung Enz bei Besigheim',subtitle:'Enzmündung, B27 und lokale Sperrbereiche beachten',center:[49.0005,9.1439],zoom:16,officialUrl:'https://www.hege6.de/unser-gew%C3%A4sser/m%C3%BCndung-enz-besigheim/',refs:[['assets/reference/besigheim-01.png','Fotoreferenz · Enz / B27'],['assets/reference/besigheim-02.png','Vereinskarte · Besigheim / Hege6–Hege7'],['assets/reference/besigheim-03.png','Fotoreferenz · Grenzmarkierung'],['assets/reference/besigheim-04.png','Fotoreferenz · Enz flussabwärts']]}
 ],
 osmWaterSources:[
  {id:'boeckingen-water',sectionId:'boeckingen',title:'Angelbereich Böckingen (GIS)',note:'Gewässergeometrie aus OpenStreetMap. Abschnittsgrenzen mit Originalkarte prüfen.',bbox:[49.1330,9.1940,49.1555,9.2075],nameRegex:'Neckar',types:['river','canal']},
  {id:'horkheim-water',sectionId:'horkheim',title:'Schifffahrtskanal Horkheim (GIS)',note:'Kanal-/Neckar-Geometrie aus OpenStreetMap. Erlaubte Uferseite prüfen.',bbox:[49.0975,9.1715,49.1305,9.1865],nameRegex:'Neckar|Schifffahrtskanal',types:['river','canal']},
  {id:'lauffen-water',sectionId:'lauffen',title:'Neckar Lauffen–Besigheim (GIS)',note:'OSM-Gewässerachse innerhalb des offiziellen Orientierungsraums.',bbox:[49.0000,9.1370,49.0925,9.1715],nameRegex:'Neckar',types:['river','canal']},
  {id:'enz-water',sectionId:'besigheim',title:'Enz bei Besigheim (GIS)',note:'Enz-Geometrie aus OpenStreetMap. Grenzen anhand der offiziellen Karte prüfen.',bbox:[48.9965,9.1360,49.0045,9.1505],nameRegex:'Enz',types:['river','canal']}
 ],
 structurePoints:[
  {id:'heilbronn-lock',sectionId:'boeckingen',title:'Schleuse / Wehr Heilbronn',anchor:[49.13752,9.20000],fallback:[49.13752,9.20000],fallbackVerified:true,maxWaterDistanceM:80,reviewRadiusM:50,accuracy:'hoch',source:'OpenStreetMap-Bauwerk + Hege6-Referenz',note:'Geprüfter Bauwerksstandort am Beginn des Böckinger Oberwassers. Sperr- und Sicherheitsabstände anhand der Originalkarte und Beschilderung beachten.'},
  {id:'besigheim-weir',sectionId:'besigheim',title:'Wehr Besigheim',anchor:[49.00334,9.14781],fallback:[49.00334,9.14781],fallbackVerified:true,maxWaterDistanceM:80,reviewRadiusM:50,accuracy:'hoch',source:'OpenStreetMap waterway=weir + Hege6-Karte',note:'Geprüfter Wehrstandort an der Enz. Schon-, Sperr- und Sicherheitsabstände vor Ort beachten.'}
 ]
};
