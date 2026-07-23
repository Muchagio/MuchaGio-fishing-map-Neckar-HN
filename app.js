'use strict';
if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then(items => items.forEach(item => item.unregister()));
if ('caches' in window) caches.keys().then(keys => keys.forEach(key => caches.delete(key)));

const data = window.MUCHA_MAP_DATA;
const sections = data.sections;
const byId = id => sections.find(section => section.id === id);
const sidebar = document.getElementById('sidebar');
const backdrop = document.getElementById('backdrop');
const openSidebar = () => { sidebar.classList.add('open'); backdrop.classList.add('show'); };
const closeSidebar = () => { sidebar.classList.remove('open'); backdrop.classList.remove('show'); };
document.getElementById('menuButton').addEventListener('click', openSidebar);
document.getElementById('layerButton').addEventListener('click', openSidebar);
backdrop.addEventListener('click', closeSidebar);

const dialog = document.getElementById('referenceDialog');
function openReferences(section) {
  document.getElementById('dialogTitle').textContent = section.title;
  document.getElementById('dialogSubtitle').textContent = section.subtitle;
  const officialLink = `<div class="official-link"><a href="${section.officialUrl}" target="_blank" rel="noopener">Offizielle Hege6-Seite öffnen ↗</a></div>`;
  const figures = section.refs.map(([src, caption]) => `<figure><a href="${src}" target="_blank" rel="noopener"><img src="${src}" alt="${caption}" loading="lazy"></a><figcaption>${caption} · antippen für Originalgröße</figcaption></figure>`).join('');
  document.getElementById('gallery').innerHTML = officialLink + figures;
  dialog.showModal();
}
document.getElementById('closeDialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

const infoDialog = document.getElementById('infoDialog');
document.getElementById('infoButton').addEventListener('click', () => infoDialog.showModal());
document.getElementById('rulesButton').addEventListener('click', () => infoDialog.showModal());
infoDialog.querySelector('[data-close-dialog]').addEventListener('click', () => infoDialog.close());

function setRuntimeStatus(text, state='loading') {
  const el = document.getElementById('gisRuntimeStatus');
  if (!el) return;
  el.textContent = text;
  el.dataset.state = state;
}

function popupHtml(title, note, sectionId, status) {
  return `<div class="popup-badge ${status === 'warning' ? 'warning' : ''}">${status === 'allowed' ? 'GIS-ANGELBEREICH' : 'PRÜFBEREICH CA.'}</div><div class="popup-title">${title}</div><div class="popup-copy">${note}<br><strong>Final immer mit den Originalunterlagen abgleichen.</strong></div><button class="popup-button" data-section="${sectionId}">Unterlagen ansehen</button>`;
}

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.nchc.org.tw/api/interpreter'
];

function buildOverpassQuery(source) {
  const [south, west, north, east] = source.bbox;
  const typeRegex = source.types.join('|');
  return `[out:json][timeout:30];(way["waterway"~"${typeRegex}"]["name"~"${source.nameRegex}",i](${south},${west},${north},${east}););out geom;`;
}

async function fetchOverpass(query) {
  let lastError;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
        body: `data=${encodeURIComponent(query)}`
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Overpass unavailable');
}

function osmElementsToLines(payload) {
  return (payload.elements || [])
    .filter(item => item.type === 'way' && Array.isArray(item.geometry) && item.geometry.length > 1)
    .map(item => ({
      id: item.id,
      name: item.tags?.name || 'Gewässer',
      coordinates: item.geometry.map(point => [point.lat, point.lon])
    }));
}

async function loadOsmWaterGeometry(source) {
  const cacheKey = `muchagio-osm-${data.meta.version}-${source.id}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.savedAt > Date.now() - 7 * 24 * 60 * 60 * 1000 && parsed.lines?.length) return parsed.lines;
    }
  } catch (_) {}

  const payload = await fetchOverpass(buildOverpassQuery(source));
  const lines = osmElementsToLines(payload);
  if (!lines.length) throw new Error(`Keine OSM-Wassergeometrie für ${source.id}`);
  try { localStorage.setItem(cacheKey, JSON.stringify({savedAt: Date.now(), lines})); } catch (_) {}
  return lines;
}

function initMap() {
  if (typeof L === 'undefined') { document.getElementById('loadError').hidden = false; return; }
  const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap-Mitwirkende' });
  const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Tiles &copy; Esri' });
  const labels = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, opacity: .82 });
  const map = L.map('map', { layers: [street], zoomControl: false, preferCanvas: true }).setView([49.073, 9.165], 11);
  window.appMap = map;

  const markerLayer = L.layerGroup().addTo(map);
  const allowedLayer = L.layerGroup().addTo(map);
  const warningLayer = L.layerGroup().addTo(map);
  const allBounds = L.latLngBounds([]);
  const icon = number => L.divIcon({ className: '', html: `<div class="map-pin"><span>${number}</span></div>`, iconSize: [46,46], iconAnchor: [23,42] });

  sections.forEach(section => {
    allBounds.extend(section.center);
    L.marker(section.center, { icon: icon(section.number) }).addTo(markerLayer)
      .bindPopup(`<div class="popup-badge">${section.number}</div><div class="popup-title">${section.title}</div><div class="popup-copy">${section.subtitle}</div><button class="popup-button" data-section="${section.id}">Unterlagen ansehen</button>`);
  });

  data.warningZones.forEach(zone => {
    allBounds.extend(zone.center);
    L.circle(zone.center, { radius:zone.radius, color:'#ff5361', weight:3, opacity:.98, fillColor:'#ff5361', fillOpacity:.2, dashArray:'8 6' }).addTo(warningLayer)
      .bindPopup(popupHtml(zone.title, zone.note, zone.sectionId, 'warning'));
  });

  setRuntimeStatus('GIS-Wassergeometrien werden aus OpenStreetMap geladen …');
  Promise.allSettled(data.osmWaterSources.map(async source => {
    const lines = await loadOsmWaterGeometry(source);
    lines.forEach(line => {
      line.coordinates.forEach(point => allBounds.extend(point));
      L.polyline(line.coordinates, { color:'#0a3d26', weight:18, opacity:.46, lineCap:'round', lineJoin:'round' }).addTo(allowedLayer);
      L.polyline(line.coordinates, { color:'#4ee3a0', weight:5, opacity:.98, lineCap:'round', lineJoin:'round' }).addTo(allowedLayer)
        .bindPopup(popupHtml(source.title, source.note, source.sectionId, 'allowed'));
    });
    return {source, count: lines.length};
  })).then(results => {
    const ok = results.filter(result => result.status === 'fulfilled');
    const failed = results.length - ok.length;
    if (ok.length) {
      setRuntimeStatus(`GIS aktiv: ${ok.length}/${results.length} Gewässerbereiche aus OpenStreetMap geladen${failed ? ` · ${failed} Bereich(e) konnten nicht geladen werden` : ''}.`, failed ? 'warning' : 'ok');
      map.fitBounds(allBounds.pad(.09));
    } else {
      setRuntimeStatus('GIS-Daten konnten aktuell nicht geladen werden. Es werden bewusst keine ungenauen Ersatzlinien angezeigt.', 'error');
    }
  });

  map.on('popupopen', event => {
    const button = event.popup.getElement()?.querySelector('[data-section]');
    if (button) button.addEventListener('click', () => openReferences(byId(button.dataset.section)));
  });

  map.fitBounds(allBounds.pad(.09));
  setTimeout(() => map.invalidateSize(true), 100);
  window.addEventListener('resize', () => map.invalidateSize(false));

  document.getElementById('fitAll').addEventListener('click', () => { map.fitBounds(allBounds.pad(.09)); closeSidebar(); });
  document.getElementById('markerToggle').addEventListener('change', e => e.target.checked ? markerLayer.addTo(map) : map.removeLayer(markerLayer));
  document.getElementById('allowedToggle').addEventListener('change', e => e.target.checked ? allowedLayer.addTo(map) : map.removeLayer(allowedLayer));
  document.getElementById('warningToggle').addEventListener('change', e => e.target.checked ? warningLayer.addTo(map) : map.removeLayer(warningLayer));

  document.querySelectorAll('[data-base]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-base]').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    if (button.dataset.base === 'satellite') {
      if (map.hasLayer(street)) map.removeLayer(street);
      satellite.addTo(map); labels.addTo(map);
    } else {
      if (map.hasLayer(satellite)) map.removeLayer(satellite);
      if (map.hasLayer(labels)) map.removeLayer(labels);
      street.addTo(map);
    }
  }));

  document.getElementById('zoomIn').addEventListener('click', () => map.zoomIn());
  document.getElementById('zoomOut').addEventListener('click', () => map.zoomOut());
  document.getElementById('locateButton').addEventListener('click', () => map.locate({ setView:true, maxZoom:17, enableHighAccuracy:true }));
  let userMarker, userCircle;
  map.on('locationfound', event => {
    if (userMarker) map.removeLayer(userMarker);
    if (userCircle) map.removeLayer(userCircle);
    userMarker = L.circleMarker(event.latlng, { radius:7, color:'#fff', weight:3, fillColor:'#2f9fff', fillOpacity:1 }).addTo(map).bindPopup('Dein Standort').openPopup();
    userCircle = L.circle(event.latlng, { radius:event.accuracy, color:'#2f9fff', weight:1, fillOpacity:.08 }).addTo(map);
  });
  map.on('locationerror', () => alert('Standort konnte nicht bestimmt werden. Bitte Standortzugriff im Browser erlauben.'));

  const results = document.getElementById('searchResults');
  const input = document.getElementById('searchInput');
  function showResults(query='') {
    const q = query.trim().toLowerCase();
    const matches = sections.filter(section => !q || `${section.title} ${section.shortTitle} ${section.subtitle}`.toLowerCase().includes(q));
    results.innerHTML = matches.map(section => `<button type="button" data-search-id="${section.id}"><strong>${section.number} · ${section.shortTitle}</strong><br><small>${section.subtitle}</small></button>`).join('');
    results.classList.toggle('show', matches.length > 0 && (q.length > 0 || document.activeElement === input));
    results.querySelectorAll('[data-search-id]').forEach(button => button.addEventListener('click', () => {
      const section = byId(button.dataset.searchId); map.flyTo(section.center, section.zoom, {duration:.8}); results.classList.remove('show'); input.value = section.shortTitle;
    }));
  }
  input.addEventListener('focus', () => showResults(input.value));
  input.addEventListener('input', () => showResults(input.value));
  document.addEventListener('click', event => { if (!event.target.closest('.search')) results.classList.remove('show'); });

  document.getElementById('docsButton').addEventListener('click', () => { openSidebar(); setTimeout(() => sidebar.scrollTo({top:sidebar.scrollHeight,behavior:'smooth'}),100); });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMap); else initMap();
