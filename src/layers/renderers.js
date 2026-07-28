// Turns GeoJSON features into styled Leaflet layers. All colors come from
// design tokens (via layerType.colorVar), so styling is declared in
// registry.json + tokens.css — never hard-coded here.

import { colorFor, numberVar } from '../core/tokens.js';
import { DEFAULTS } from '../core/constants.js';
import { lineToLatLngs, toLatLng } from '../core/geo.js';
import { t } from '../i18n.js';

const L = window.L;

/* ---------- Popups & tooltips ---------- */

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html != null) node.innerHTML = html;
  return node;
}

// Builds a popup DOM element. `onDocs` (optional) wires the documents button.
export function buildPopup({ title, note, status = 'allowed', meta = '', onDocs }) {
  const root = el('div');
  const badge = el('div', `popup-badge ${status === 'warning' ? 'warning' : ''}`);
  badge.textContent = status === 'warning' ? t('popup.verified') : t('popup.allowed');
  root.appendChild(badge);
  root.appendChild(el('div', 'popup-title', title));
  const copy = el(
    'div',
    'popup-copy',
    `${note}${meta ? `<br><span class="popup-meta">${meta}</span>` : ''}<br><strong>${t('popup.reconcile')}</strong>`
  );
  root.appendChild(copy);
  if (onDocs) {
    const button = el('button', 'popup-button');
    button.textContent = t('popup.openDocs');
    button.addEventListener('click', onDocs);
    root.appendChild(button);
  }
  return root;
}

/* ---------- Section (LineString) rendering ---------- */

// Returns { layers:[...], lines:[...] } — `lines` are the top strokes whose
// opacity the transparency slider controls.
export function renderSection(featureCollection, layerType, { water, onDocs, opacity }) {
  const color = colorFor(layerType.colorVar);
  const casingColor = colorFor('--section-casing', '#052d20');
  const casingWeight = numberVar('--section-casing-weight', 22);
  const lineWeight = numberVar('--section-line-weight', 6);

  const layers = [];
  const lines = [];

  for (const feature of featureCollection.features) {
    if (feature.geometry?.type !== 'LineString') continue;
    const latlngs = lineToLatLngs(feature.geometry.coordinates);

    const casing = L.polyline(latlngs, {
      color: casingColor,
      weight: casingWeight,
      opacity: DEFAULTS.sectionCasingOpacity,
      lineCap: 'round',
      lineJoin: 'round',
      interactive: false,
    });
    const line = L.polyline(latlngs, {
      color,
      weight: lineWeight,
      opacity: opacity ?? DEFAULTS.sectionOpacity,
      lineCap: 'round',
      lineJoin: 'round',
    });
    line.bindPopup(() =>
      buildPopup({
        title: water.name,
        note: water.subtitle,
        status: 'allowed',
        meta: feature.properties?.verified
          ? ''
          : `${t('detail.draft')}: OSM-Snapshot – in QGIS gegen Hege6-Karte prüfen.`,
        onDocs,
      })
    );
    layers.push(casing, line);
    lines.push(line);
  }
  return { layers, lines };
}

/* ---------- Point marker rendering ---------- */

function markerIcon(layerType) {
  const color = colorFor(layerType.colorVar);
  const glyph = layerType.icon ?? '•';
  return L.divIcon({
    className: '',
    html: `<div class="dot-pin" style="--pin-color:${color}"><span>${glyph}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

export function renderPoint(feature, layerType, { water, onSelect }) {
  const latlng = toLatLng(feature.geometry.coordinates);
  const marker = L.marker(latlng, {
    icon: markerIcon(layerType),
    zIndexOffset: 700,
  }).bindTooltip(feature.properties?.title ?? layerType.label, {
    direction: 'top',
    offset: [0, -18],
  });
  marker.on('click', () => onSelect(feature, latlng, water));
  return marker;
}

/* ---------- Section navigation marker ---------- */

export function renderSectionNav(water, { onDocs }) {
  const icon = L.divIcon({
    className: '',
    html: `<div class="section-pin"><span>${String(water.number).padStart(2, '0')}</span></div>`,
    iconSize: [38, 46],
    iconAnchor: [19, 42],
  });
  const marker = L.marker(water.center, { icon, zIndexOffset: 500 }).bindTooltip(
    `${String(water.number).padStart(2, '0')} · ${water.short}`,
    { direction: 'top', offset: [0, -40] }
  );
  marker.bindPopup(() =>
    buildPopup({
      title: water.name,
      note: water.subtitle,
      status: 'allowed',
      meta: 'Navigationsmarker – keine amtliche Abschnittsgrenze.',
      onDocs,
    })
  );
  return marker;
}

/* ---------- Review area (circle) rendering ---------- */

export function renderReviewArea(feature, layerType, { onDocs }) {
  const color = colorFor(layerType.colorVar);
  const latlng = toLatLng(feature.geometry.coordinates);
  const radius = feature.properties?.radiusM || 50;
  const circle = L.circle(latlng, {
    radius,
    color,
    weight: 2,
    dashArray: '7 7',
    opacity: DEFAULTS.reviewStrokeOpacity,
    fillColor: color,
    fillOpacity: DEFAULTS.reviewFillOpacity,
  });
  circle.bindPopup(() =>
    buildPopup({
      title: feature.properties?.title ?? layerType.label,
      note: feature.properties?.description ?? '',
      status: 'warning',
      meta: feature.properties?.source ?? '',
      onDocs,
    })
  );
  return circle;
}
