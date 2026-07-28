// Thin wrapper around the Leaflet map instance.

import { DEFAULTS } from '../core/constants.js';

const L = window.L;

export function createMap(elementId, mapCfg) {
  const map = L.map(elementId, {
    zoomControl: false,
    preferCanvas: true, // canvas rendering scales better for many vector features
    minZoom: mapCfg.minZoom,
    maxZoom: mapCfg.maxZoom,
  }).setView(mapCfg.defaultCenter, mapCfg.defaultZoom);

  // Keep sizing correct across layout / orientation changes.
  setTimeout(() => map.invalidateSize(true), 100);
  window.addEventListener('resize', () => map.invalidateSize(false));

  return map;
}

export function flyToWater(map, water) {
  map.flyTo(water.center, water.zoom, { duration: DEFAULTS.flyDuration });
}

export function enableLocate(map, { onError } = {}) {
  const locate = () =>
    map.locate({ setView: true, maxZoom: DEFAULTS.locateMaxZoom, enableHighAccuracy: true });

  map.on('locationfound', (event) => {
    L.circleMarker(event.latlng, {
      radius: 8,
      color: '#fff',
      weight: 3,
      fillColor: '#3187ed',
      fillOpacity: 1,
    })
      .addTo(map)
      .bindPopup('Dein Standort')
      .openPopup();
  });

  map.on('locationerror', () => onError && onError());

  return locate;
}
