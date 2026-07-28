// Basemap management driven entirely by registry.basemaps.
// OpenStreetMap / Esri are used ONLY as background tiles — never as a
// source of fishing geometry.

const L = window.L;

export class BasemapManager {
  constructor(map, definitions, maxZoom) {
    this.map = map;
    this.defs = definitions;
    this.entries = new Map(); // id -> { base, overlay|null }
    this.activeId = null;

    for (const def of definitions) {
      const base = L.tileLayer(def.url, {
        maxZoom: def.maxZoom || maxZoom,
        attribution: def.attribution,
      });
      const overlay = def.overlay
        ? L.tileLayer(def.overlay.url, {
            maxZoom: def.maxZoom || maxZoom,
            opacity: def.overlay.opacity ?? 1,
          })
        : null;
      this.entries.set(def.id, { base, overlay });
    }
  }

  ids() {
    return [...this.entries.keys()];
  }

  labelFor(id) {
    return this.defs.find((d) => d.id === id)?.label ?? id;
  }

  set(id) {
    if (!this.entries.has(id) || id === this.activeId) return;
    // Remove previously active tiles.
    if (this.activeId) {
      const prev = this.entries.get(this.activeId);
      this.map.removeLayer(prev.base);
      if (prev.overlay) this.map.removeLayer(prev.overlay);
    }
    const next = this.entries.get(id);
    next.base.addTo(this.map);
    if (next.overlay) next.overlay.addTo(this.map);
    // Keep basemap beneath data layers.
    next.base.bringToBack();
    this.activeId = id;
  }
}
