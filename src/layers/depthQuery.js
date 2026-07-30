// Tap-to-depth: when the depth chart layer is active, clicking the map
// queries the official WSV Inland-ENC WMS (GetFeatureInfo) and shows the
// depth range at that point. Data: WSV/GDWS — orientation only, not for navigation.

const L = window.L;

function comma(x) {
  return String(x).replace('.', ',');
}

function formatDepth(raw) {
  // Strip HTML tags / entities so labels and values sit next to each other,
  // then match tolerantly (the service separates label/value with tabs or tags).
  const text = raw.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ');
  const d1 = text.match(/Tiefenbereichswert\s*1[^\d-]*([\d.]+)/i) || text.match(/DRVAL1[^\d-]*([\d.]+)/i);
  const d2 = text.match(/Tiefenbereichswert\s*2[^\d-]*([\d.]+)/i) || text.match(/DRVAL2[^\d-]*([\d.]+)/i);
  if (d1 && d2) {
    return `<div class="popup-title">Tiefe hier</div><div class="popup-copy"><b>${comma(d1[1])} – ${comma(d2[1])} m</b><br><span class="popup-meta">Amtliche Inland-ENC (WSV) · nur Orientierung, nicht zur Navigation</span></div>`;
  }
  const sounding = raw.replace(/<[^>]+>/g, ' ').match(/(?:Lotung|Tiefe|SOUNDG)[^\d-]*([\d.]+)\s*m/i);
  if (sounding) {
    return `<div class="popup-title">Tiefe hier</div><div class="popup-copy"><b>ca. ${comma(sounding[1])} m</b><br><span class="popup-meta">Amtliche Inland-ENC (WSV)</span></div>`;
  }
  if (/DEPARE|Tiefen/i.test(text)) {
    return '<div class="popup-copy">Tiefenbereich hier nicht eindeutig – bitte direkt auf eine gefärbte Tiefenfläche tippen.</div>';
  }
  return '<div class="popup-copy">Keine Tiefenangabe an dieser Stelle.<br><span class="popup-meta">Bitte im Fahrwasser bzw. auf einer Tiefenfläche tippen.</span></div>';
}

export function enableDepthQuery(map, { isActive, wms }) {
  const popup = L.popup({ maxWidth: 280, className: 'depth-popup' });

  map.on('click', async (event) => {
    if (!isActive()) return; // only when the depth layer is switched on
    const size = map.getSize();
    const pixel = map.latLngToContainerPoint(event.latlng);
    const bounds = map.getBounds();
    const sw = map.options.crs.project(bounds.getSouthWest());
    const ne = map.options.crs.project(bounds.getNorthEast());

    const params = new URLSearchParams({
      SERVICE: 'WMS', VERSION: '1.3.0', REQUEST: 'GetFeatureInfo',
      LAYERS: wms.layers, QUERY_LAYERS: wms.layers, CRS: 'EPSG:3857',
      BBOX: [sw.x, sw.y, ne.x, ne.y].join(','),
      WIDTH: size.x, HEIGHT: size.y,
      I: Math.round(pixel.x), J: Math.round(pixel.y),
      INFO_FORMAT: 'text/html', FEATURE_COUNT: '8', STYLES: '',
    });

    popup.setLatLng(event.latlng).setContent('Tiefe wird abgefragt …').openOn(map);
    try {
      const text = await fetch(`${wms.url}?${params.toString()}`).then((r) => r.text());
      popup.setContent(formatDepth(text));
    } catch (_) {
      popup.setContent('<div class="popup-copy">Tiefenabfrage nicht möglich (offline?).</div>');
    }
  });
}
