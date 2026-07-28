// Central constants — no magic numbers scattered through the codebase.

export const STORAGE = {
  basemap: 'muchagio.basemap',
  layerVisibility: 'muchagio.layerVisibility',
  opacity: 'muchagio.sectionOpacity',
  lastWater: 'muchagio.lastWater',
};

export const DEFAULTS = {
  sectionOpacity: 0.98,      // 0..1 for the visible section line
  sectionCasingOpacity: 0.55,
  reviewFillOpacity: 0.12,
  reviewStrokeOpacity: 0.95,
  locateMaxZoom: 17,
  flyDuration: 0.8,
  minOpacityPercent: 35,
  maxOpacityPercent: 100,
};

// zIndexOffset values for Leaflet markers (higher = on top)
export const Z_OFFSET = {
  reviewArea: 300,
  sectionNav: 500,
  marker: 700,
  userLocation: 900,
};
