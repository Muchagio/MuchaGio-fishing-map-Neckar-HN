'use strict';

if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then(items => items.forEach(item => item.unregister()));
if ('caches' in window) caches.keys().then(keys => keys.forEach(key => caches.delete(key)));

const data = window.MUCHA_MAP_DATA;
const sections = data.sections;
const byId = id => sections.find(section => section.id === id);

const drawer = document.getElementById('drawer');
const backdrop = document.getElementById('backdrop');
const openDrawer = () => { drawer.classList.add('open'); backdrop.classList.add('show'); };
const closeDrawer = () => { drawer.classList.remove('open'); backdrop.classList.remove('show'); };
document.getElementById('menuButton').addEventListener('click', openDrawer);
document.getElementById('sectionsButton').addEventListener('click', openDrawer);
document.getElementById('closeDrawer').addEventListener('click', closeDrawer);
backdrop.addEventListener('click', closeDrawer);

const dialog = document.getElementById('referenceDialog');
function openReferences(section) {
  document.getElementById('dialogTitle').textContent = section.title;
  document.getElementById('dialogSubtitle').textContent = section.subtitle;
  const officialLink = `<div class="official-link"><a href="${section.officialUrl}" target="_blank" rel="noopener">Hege6-Seite öffnen ↗</a></div>`;
  const figures = section.refs.map(([src, caption]) => `<figure><a href="${src}" target="_blank" rel="noopener"><img src="${src}" alt="${caption}" loading="lazy"></a><figcaption>${caption} · antippen für Originalgröße</figcaption></figure>`).join('');
  document.getElementById('gallery').innerHTML = officialLink + figures;
  dialog.showModal();
}
document.getElementById('closeDialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

const cards = document.getElementById('sectionCards');
sections.forEach(section => {
  const el = document.createElement('article');
  el.className = 'card';
  el.innerHTML = `<div class="card-top"><div class="card-num">${section.number}</div><div><strong>${section.title}</strong><small>${section.subtitle}</small></div></div><div class="card-actions"><button class="mini primary" data-map type="button">Auf Karte</button><button class="mini" data-refs type="button">Unterlagen</button></div>`;
  el.querySelector('[data-map]').addEventListener('click', () => { window.appMap?.flyTo(section.center, section.zoom, { duration: .8 }); closeDrawer(); });
  el.querySelector('[data-refs]').addEventListener('click', () => openReferences(section));
  cards.appendChild(el);
});

function popupHtml(title, note, sectionId, status) {
  return `<div class="popup-badge ${status}">${status === 'allowed' ? 'ANGELBEREICH CA.' : 'PRÜFBEREICH CA.'}</div><div class="popup-title">${title}</div><div class="popup-copy">${note}<br><strong>Final immer mit den Originalunterlagen abgleichen.</strong></div><button class="popup-button" data-section="${sectionId}">Unterlagen öffnen</button>`;
}

function initMap() {
  if (typeof L === 'undefined') { document.getElementById('loadError').hidden = false; return; }

  const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap-Mitwirkende' });
  const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Tiles &copy; Esri' });
  const map = L.map('map', { layers: [street], zoomControl: true, preferCanvas: true }).setView([49.073, 9.165], 11);
  window.appMap = map;

  const markerLayer = L.layerGroup().addTo(map);
  const allowedLayer = L.layerGroup().addTo(map);
  const warningLayer = L.layerGroup().addTo(map);
  const allBounds = L.latLngBounds([]);

  const icon = number => L.divIcon({ className: '', html: `<div class="map-pin"><span>${number}</span></div>`, iconSize: [38, 38], iconAnchor: [19, 35] });
  sections.forEach(section => {
    allBounds.extend(section.center);
    L.marker(section.center, { icon: icon(section.number) }).addTo(markerLayer)
      .bindPopup(`<div class="popup-title">${section.title}</div><div class="popup-copy">${section.subtitle}</div><button class="popup-button" data-section="${section.id}">Unterlagen öffnen</button>`);
  });

  data.allowedCorridors.forEach(corridor => {
    corridor.coordinates.forEach(point => allBounds.extend(point));
    L.polyline(corridor.coordinates, { color: '#25cf83', weight: 14, opacity: .28, lineCap: 'round' }).addTo(allowedLayer);
    L.polyline(corridor.coordinates, { color: '#55efa8', weight: 5, opacity: .95, lineCap: 'round', dashArray: '12 7' }).addTo(allowedLayer)
      .bindPopup(popupHtml(corridor.title, corridor.note, corridor.sectionId, 'allowed'));
  });

  data.warningZones.forEach(zone => {
    allBounds.extend(zone.center);
    L.circle(zone.center, { radius: zone.radius, color: '#ff5868', weight: 3, opacity: .95, fillColor: '#ff5868', fillOpacity: .18, dashArray: '8 6' }).addTo(warningLayer)
      .bindPopup(popupHtml(zone.title, zone.note, zone.sectionId, 'warning'));
  });

  map.on('popupopen', event => {
    const button = event.popup.getElement()?.querySelector('[data-section]');
    if (button) button.addEventListener('click', () => openReferences(byId(button.dataset.section)));
  });

  map.fitBounds(allBounds.pad(.12));
  setTimeout(() => map.invalidateSize(true), 100);
  window.addEventListener('resize', () => map.invalidateSize(false));

  document.getElementById('fitAll').addEventListener('click', () => { map.fitBounds(allBounds.pad(.12)); closeDrawer(); });
  document.getElementById('markerToggle').addEventListener('change', e => e.target.checked ? markerLayer.addTo(map) : map.removeLayer(markerLayer));
  document.getElementById('allowedToggle').addEventListener('change', e => e.target.checked ? allowedLayer.addTo(map) : map.removeLayer(allowedLayer));
  document.getElementById('warningToggle').addEventListener('change', e => e.target.checked ? warningLayer.addTo(map) : map.removeLayer(warningLayer));

  document.querySelectorAll('[data-base]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-base]').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    if (button.dataset.base === 'satellite') { if (map.hasLayer(street)) map.removeLayer(street); satellite.addTo(map); }
    else { if (map.hasLayer(satellite)) map.removeLayer(satellite); street.addTo(map); }
  }));

  document.getElementById('locateButton').addEventListener('click', () => map.locate({ setView: true, maxZoom: 17, enableHighAccuracy: true }));
  let userMarker;
  let userCircle;
  map.on('locationfound', event => {
    if (userMarker) map.removeLayer(userMarker);
    if (userCircle) map.removeLayer(userCircle);
    userMarker = L.circleMarker(event.latlng, { radius: 7, color: '#fff', weight: 3, fillColor: '#2f9fff', fillOpacity: 1 }).addTo(map).bindPopup('Dein Standort').openPopup();
    userCircle = L.circle(event.latlng, { radius: event.accuracy, color: '#2f9fff', weight: 1, fillOpacity: .08 }).addTo(map);
  });
  map.on('locationerror', () => alert('Standort konnte nicht bestimmt werden. Bitte Standortzugriff im Browser erlauben.'));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMap); else initMap();
