const sections = [
  {
    id: 'boeckingen',
    number: '01',
    title: 'Oberwasser HN-Böckingen',
    subtitle: 'Schleuse Heilbronn-Böckingen · km 113,53 bis 114,11',
    center: [49.1442, 9.1914],
    zoom: 15,
    facts: [
      'Blickrichtung der Fotoreferenz: flussabwärts zur Schleuse Heilbronn.',
      'Dokumentierte Orientierungspunkte: km 113,53 und km 114,11.',
      'Grün markierte Uferabschnitte sind befischbar; pink markierte Abschnitte sind gesperrt.',
      'Die exakte Abgrenzung ist ausschließlich aus der Vereinskarte zu übernehmen.'
    ],
    refs: [
      ['assets/reference/boeckingen-karte.png', 'Vereinskarte · Oberwasser HN-Böckingen'],
      ['assets/reference/boeckingen-detail.png', 'Fotoreferenz · Blick zur Schleuse Heilbronn']
    ]
  },
  {
    id: 'horkheim',
    number: '02',
    title: 'Schifffahrtskanal Horkheim',
    subtitle: 'Schleuse und Kanal Horkheim',
    center: [49.1099, 9.1761],
    zoom: 14,
    facts: [
      'Unterhalb der Schleuse Horkheim ist laut Fotoreferenz das linke Ufer gesperrt und das rechte Ufer befischbar.',
      'Oberhalb der Schleuse ist außerhalb der Schleusenanlage das Angeln möglich.',
      'Grün markierte Uferabschnitte sind befischbar; pink markierte Abschnitte sind gesperrt.',
      'Richtungsangaben Heilbronn und Lauffen sind auf den Originalkarten dokumentiert.'
    ],
    refs: [
      ['assets/reference/horkheim-01.png', 'Vereinskarte · Staustufe Horkheim'],
      ['assets/reference/horkheim-02.png', 'Vereinskarte · Wehr und Kanal Horkheim'],
      ['assets/reference/horkheim-03.png', 'Fotoreferenz · oberhalb der Schleuse'],
      ['assets/reference/horkheim-04.png', 'Fotoreferenz · unterhalb der Schleuse']
    ]
  },
  {
    id: 'lauffen',
    number: '03',
    title: 'Neckar bei Lauffen',
    subtitle: 'Neckarschleife · Gewässergrenze beachten',
    center: [49.0753, 9.1523],
    zoom: 14,
    facts: [
      'Die Vereinskarte kennzeichnet befischbare Bereiche grün und gesperrte Bereiche pink.',
      'Im nördlichen Bereich der Neckarschleife ist ein Schild „Gewässergrenze“ zu beachten.',
      'Der Bereich rund um Schleuse und Staustufe Lauffen ist entsprechend der Originalmarkierung gesperrt.',
      'Die exakte Grenze darf nicht aus der vereinfachten Bildschirmkarte abgeleitet werden.'
    ],
    refs: [
      ['assets/reference/lauffen-karte.png', 'Vereinskarte · Neckar bei Lauffen']
    ]
  },
  {
    id: 'besigheim',
    number: '04',
    title: 'Mündung Enz bei Besigheim',
    subtitle: 'Hege6/Hege7 · Enz-Grenze ca. 150 m oberhalb B27',
    center: [48.9987, 9.1428],
    zoom: 15,
    facts: [
      'Die Grenze in der Enz liegt laut Unterlagen etwa 150 m oberhalb der B27-Brücke.',
      'Ein Grenzpfosten ist auf den Fotoreferenzen sichtbar.',
      'An der Schleuse Besigheim ist der Übergang Hege6/Hege7 dokumentiert.',
      'Siehe Beiblatt Punkt d) der Vereinsunterlagen.'
    ],
    refs: [
      ['assets/reference/besigheim-01.png', 'Fotoreferenz · Enz flussaufwärts ab B27'],
      ['assets/reference/besigheim-02.png', 'Vereinskarte · Schleuse Besigheim / Hege6–Hege7'],
      ['assets/reference/besigheim-03.png', 'Fotoreferenz · Grenzmarkierung ca. 150 m nach B27'],
      ['assets/reference/besigheim-04.png', 'Fotoreferenz · Enz flussabwärts ab B27']
    ]
  }
];

const documentedBorders = [
  {
    title: 'Gewässergrenze Lauffen',
    position: [49.0847, 9.1527],
    text: 'Schild „Gewässergrenze“ gemäß Vereinskarte beachten.',
    sectionId: 'lauffen'
  },
  {
    title: 'Enz-Grenze',
    position: [48.9972, 9.1397],
    text: 'Dokumentierter Grenzpunkt etwa 150 m oberhalb der B27-Brücke.',
    sectionId: 'besigheim'
  },
  {
    title: 'Hege6 / Hege7',
    position: [49.0014, 9.1458],
    text: 'Dokumentierter Übergang an der Schleuse Besigheim.',
    sectionId: 'besigheim'
  }
];

const street = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap-Mitwirkende'
});

const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 19,
  attribution: 'Tiles &copy; Esri'
});

const map = L.map('map', {
  zoomControl: true,
  preferCanvas: true,
  layers: [street]
}).setView([49.071, 9.165], 11);

L.control.scale({ imperial: false, position: 'bottomright' }).addTo(map);

const sectionLayer = L.layerGroup().addTo(map);
const borderLayer = L.layerGroup().addTo(map);
const allBounds = L.latLngBounds([]);

function markerIcon(number, kind = 'section') {
  return L.divIcon({
    className: '',
    html: `<div class="map-pin ${kind}">${number}</div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21]
  });
}

sections.forEach(section => {
  allBounds.extend(section.center);
  const marker = L.marker(section.center, { icon: markerIcon(section.number) }).addTo(sectionLayer);
  marker.bindPopup(`
    <div class="popup-kicker">ABSCHNITT ${section.number}</div>
    <div class="popup-title">${section.title}</div>
    <div class="popup-copy">${section.subtitle}</div>
    <button class="popup-button" data-open-section="${section.id}">Vereinsunterlagen öffnen</button>
  `);
});

documentedBorders.forEach((border, index) => {
  allBounds.extend(border.position);
  const marker = L.marker(border.position, { icon: markerIcon('!', 'border') }).addTo(borderLayer);
  marker.bindPopup(`
    <div class="popup-kicker">DOKUMENTIERTER GRENZPUNKT</div>
    <div class="popup-title">${border.title}</div>
    <div class="popup-copy">${border.text}</div>
    <button class="popup-button" data-open-section="${border.sectionId}">Originalreferenz öffnen</button>
  `);
});

map.on('popupopen', e => {
  const button = e.popup.getElement()?.querySelector('[data-open-section]');
  if (!button) return;
  button.addEventListener('click', () => {
    const section = sections.find(item => item.id === button.dataset.openSection);
    if (section) openReferences(section);
  });
});

const sectionList = document.getElementById('sectionList');
sections.forEach(section => {
  const card = document.createElement('article');
  card.className = 'section-card';
  card.innerHTML = `
    <div class="section-number">${section.number}</div>
    <div class="section-content">
      <strong>${section.title}</strong>
      <span>${section.subtitle}</span>
      <div class="section-actions">
        <button class="mini-button primary" data-action="map" type="button">Auf Karte</button>
        <button class="mini-button" data-action="refs" type="button">Unterlagen</button>
      </div>
    </div>`;
  card.querySelector('[data-action="map"]').addEventListener('click', () => {
    map.flyTo(section.center, section.zoom, { duration: .85 });
    closeSidebarOnMobile();
  });
  card.querySelector('[data-action="refs"]').addEventListener('click', () => openReferences(section));
  sectionList.appendChild(card);
});

document.getElementById('fitAll').addEventListener('click', () => {
  map.fitBounds(allBounds.pad(.16));
  closeSidebarOnMobile();
});

document.getElementById('toggleMarkers').addEventListener('change', event => {
  event.target.checked ? sectionLayer.addTo(map) : map.removeLayer(sectionLayer);
});

document.getElementById('toggleBorders').addEventListener('change', event => {
  event.target.checked ? borderLayer.addTo(map) : map.removeLayer(borderLayer);
});

document.querySelectorAll('[data-basemap]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-basemap]').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const nextLayer = button.dataset.basemap === 'satellite' ? satellite : street;
    const previousLayer = button.dataset.basemap === 'satellite' ? street : satellite;
    if (map.hasLayer(previousLayer)) map.removeLayer(previousLayer);
    if (!map.hasLayer(nextLayer)) nextLayer.addTo(map);
  });
});

const dialog = document.getElementById('referenceDialog');
const dialogTitle = document.getElementById('dialogTitle');
const dialogSubtitle = document.getElementById('dialogSubtitle');
const dialogNotes = document.getElementById('dialogNotes');
const gallery = document.getElementById('referenceGallery');

function openReferences(section) {
  dialogTitle.textContent = section.title;
  dialogSubtitle.textContent = section.subtitle;
  dialogNotes.innerHTML = section.facts.map(fact => `<div class="official-note"><span>✓</span><p>${fact}</p></div>`).join('');
  gallery.innerHTML = section.refs.map(([src, caption]) => `
    <figure class="reference-figure">
      <a href="${src}" target="_blank" rel="noopener" aria-label="${caption} in voller Größe öffnen">
        <img src="${src}" alt="${caption}" loading="lazy">
      </a>
      <figcaption><span>${caption}</span><small>Antippen für Originalgröße</small></figcaption>
    </figure>`).join('');
  dialog.showModal();
}

document.getElementById('closeDialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

const sidebar = document.getElementById('sidebar');
const menuButton = document.getElementById('menuButton');
const mobileSections = document.getElementById('mobileSections');
function toggleSidebar() { sidebar.classList.toggle('open'); }
menuButton.addEventListener('click', toggleSidebar);
mobileSections.addEventListener('click', toggleSidebar);
function closeSidebarOnMobile() {
  if (window.matchMedia('(max-width: 860px)').matches) sidebar.classList.remove('open');
}

let userMarker;
let userAccuracy;
document.getElementById('locateButton').addEventListener('click', () => {
  map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
});
map.on('locationfound', event => {
  if (userMarker) map.removeLayer(userMarker);
  if (userAccuracy) map.removeLayer(userAccuracy);
  userMarker = L.circleMarker(event.latlng, {
    radius: 7,
    color: '#fff',
    weight: 3,
    fillColor: '#2c9cff',
    fillOpacity: 1
  }).addTo(map).bindPopup('Dein aktueller Standort');
  userAccuracy = L.circle(event.latlng, {
    radius: event.accuracy,
    color: '#2c9cff',
    weight: 1,
    fillColor: '#2c9cff',
    fillOpacity: .1
  }).addTo(map);
});
map.on('locationerror', () => alert('Der Standort konnte nicht bestimmt werden. Bitte Standortfreigabe im Browser erlauben.'));

map.fitBounds(allBounds.pad(.16));

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
}
