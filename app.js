const sections = [
  {
    id: 'boeckingen',
    title: 'Oberwasser HN-Böckingen',
    subtitle: 'Wehr/Schleuse Heilbronn-Böckingen · km 113,53–114,11',
    center: [49.1439, 9.1915],
    zoom: 15,
    route: [[49.1465,9.1870],[49.1448,9.1892],[49.1431,9.1925],[49.1417,9.1955]],
    routeColor: '#98a5aa',
    notes: [
      'Die exakte grüne und pinke Ufermarkierung ist den beiden Vereinsbildern zu entnehmen.',
      'Unmittelbare Schleusen- und Wehrbereiche besonders beachten.'
    ],
    refs: [
      ['assets/reference/boeckingen-karte.png', 'Vereinskarte Oberwasser HN-Böckingen'],
      ['assets/reference/boeckingen-detail.png', 'Detailansicht mit markierten Uferbereichen']
    ]
  },
  {
    id: 'horkheim',
    title: 'Schifffahrtskanal Horkheim',
    subtitle: 'Rechtes Ufer km 116,92–119,98 · linkes Ufer km 117,70–119,84',
    center: [49.1114, 9.1780],
    zoom: 14,
    route: [[49.1260,9.1880],[49.1190,9.1838],[49.1120,9.1785],[49.1035,9.1710],[49.0965,9.1650]],
    routeColor: '#98a5aa',
    notes: [
      'Die vier Referenzbilder zeigen erlaubte und gesperrte Uferseiten rund um Kanal, Inselspitze und Schleuse.',
      'Exakte Übergänge bitte immer direkt in den Originalmarkierungen prüfen.'
    ],
    refs: [
      ['assets/reference/horkheim-01.png', 'Horkheim – Übersicht 1'],
      ['assets/reference/horkheim-02.png', 'Horkheim – Übersicht 2'],
      ['assets/reference/horkheim-03.png', 'Horkheim – Übersicht 3'],
      ['assets/reference/horkheim-04.png', 'Horkheim – Übersicht 4']
    ]
  },
  {
    id: 'lauffen',
    title: 'Neckar bei Lauffen',
    subtitle: 'Neckarschleife · Gewässergrenze beachten',
    center: [49.0745, 9.1515],
    zoom: 14,
    route: [[49.0910,9.1615],[49.0830,9.1550],[49.0755,9.1490],[49.0680,9.1455],[49.0600,9.1420]],
    routeColor: '#98a5aa',
    notes: [
      'Auf der Vereinskarte ist die Neckarschleife mit befischbaren und gesperrten Bereichen markiert.',
      'Der Hinweis „Gewässergrenze beachten“ wird als kritischer Kontrollpunkt geführt.'
    ],
    refs: [['assets/reference/lauffen-karte.png', 'Vereinskarte Neckar bei Lauffen']]
  },
  {
    id: 'besigheim',
    title: 'Mündung Enz bei Besigheim',
    subtitle: 'Hege6/Hege7-Grenze · Enz-Grenzpfosten ca. 150 m oberhalb B27',
    center: [48.9990, 9.1425],
    zoom: 14,
    route: [[49.0150,9.1480],[49.0060,9.1445],[48.9990,9.1425],[48.9930,9.1370]],
    routeColor: '#54a8ff',
    notes: [
      'Die blaue Markierung kennzeichnet den Übergang Hege6/Hege7 an der Schleuse Besigheim.',
      'In der Enz liegt der dokumentierte Grenzpunkt etwa 150 m oberhalb der B27-Brücke; ein Grenzpfosten ist auf den Referenzfotos erkennbar.'
    ],
    refs: [
      ['assets/reference/besigheim-01.png', 'Besigheim – Kartenübersicht'],
      ['assets/reference/besigheim-02.png', 'Enz-Grenze – Referenzfoto 1'],
      ['assets/reference/besigheim-03.png', 'Enz-Grenze – Referenzfoto 2'],
      ['assets/reference/besigheim-04.png', 'Enz-Grenze – Referenzfoto 3']
    ]
  }
];

const map = L.map('map', { zoomControl: true, preferCanvas: true }).setView([49.075, 9.165], 11);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap-Mitwirkende'
}).addTo(map);

const routeLayer = L.layerGroup().addTo(map);
const markerLayer = L.layerGroup().addTo(map);
const allBounds = L.latLngBounds([]);

sections.forEach(section => {
  const line = L.polyline(section.route, {
    color: section.routeColor,
    weight: 7,
    opacity: .62,
    dashArray: '11 9',
    lineCap: 'round'
  }).addTo(routeLayer);
  line.bindPopup(`<div class="popup-title">${section.title}</div><div class="popup-copy">Orientierungslinie – keine amtliche Grenzgeometrie.</div>`);
  section.route.forEach(p => allBounds.extend(p));

  const marker = L.circleMarker(section.center, {
    radius: 7,
    color: '#071016',
    weight: 3,
    fillColor: section.routeColor,
    fillOpacity: 1
  }).addTo(markerLayer);
  marker.bindPopup(`<div class="popup-title">${section.title}</div><div class="popup-copy">${section.subtitle}</div>`);
});

const sectionList = document.getElementById('sectionList');
sections.forEach(section => {
  const card = document.createElement('div');
  card.className = 'section-card';
  card.innerHTML = `<strong>${section.title}</strong><span>${section.subtitle}</span><div class="section-actions"><button class="mini-button primary" data-action="map">Auf Karte</button><button class="mini-button" data-action="refs">Vereinskarten</button></div>`;
  card.querySelector('[data-action="map"]').addEventListener('click', () => {
    map.flyTo(section.center, section.zoom, { duration: .8 });
    closeSidebarOnMobile();
  });
  card.querySelector('[data-action="refs"]').addEventListener('click', () => openReferences(section));
  sectionList.appendChild(card);
});

document.getElementById('fitAll').addEventListener('click', () => map.fitBounds(allBounds.pad(.12)));
document.getElementById('toggleRoutes').addEventListener('change', e => e.target.checked ? routeLayer.addTo(map) : map.removeLayer(routeLayer));
document.getElementById('toggleMarkers').addEventListener('change', e => e.target.checked ? markerLayer.addTo(map) : map.removeLayer(markerLayer));

const dialog = document.getElementById('referenceDialog');
const dialogTitle = document.getElementById('dialogTitle');
const dialogNotes = document.getElementById('dialogNotes');
const gallery = document.getElementById('referenceGallery');
function openReferences(section) {
  if (!document.getElementById('toggleRefs').checked) return;
  dialogTitle.textContent = section.title;
  dialogNotes.innerHTML = section.notes.map(note => `<p>• ${note}</p>`).join('');
  gallery.innerHTML = section.refs.map(([src, caption]) => `<figure class="reference-figure"><a href="${src}" target="_blank" rel="noopener"><img src="${src}" alt="${caption}" loading="lazy"></a><figcaption>${caption}</figcaption></figure>`).join('');
  dialog.showModal();
}
document.getElementById('closeDialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

const sidebar = document.getElementById('sidebar');
document.getElementById('menuButton').addEventListener('click', () => sidebar.classList.toggle('open'));
function closeSidebarOnMobile() { if (window.matchMedia('(max-width: 820px)').matches) sidebar.classList.remove('open'); }

map.fitBounds(allBounds.pad(.12));

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
}
