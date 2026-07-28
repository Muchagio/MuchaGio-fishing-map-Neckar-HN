// Registry-driven layer system. One Leaflet layerGroup per layer TYPE
// (aggregated across every water), so a single toggle controls that type
// everywhere. Adding a new water or a new layer type is a DATA change in
// registry.json + the GeoJSON files — never a code change here.

import { loadGeoJSON } from '../core/dataLoader.js';
import { boundsOf, toLatLng } from '../core/geo.js';
import { persist } from '../core/store.js';
import { STORAGE, DEFAULTS } from '../core/constants.js';
import {
  renderSection,
  renderPoint,
  renderReviewArea,
  renderSectionNav,
} from './renderers.js';

const L = window.L;

export class LayerManager {
  constructor(map, registry, { onSelectMarker, onOpenDocs }) {
    this.map = map;
    this.registry = registry;
    this.opts = { onSelectMarker, onOpenDocs };

    this.typeDefs = new Map(registry.layerTypes.map((d) => [d.id, d]));
    this.markerTypeDefs = new Map(
      registry.layerTypes.filter((d) => d.source === 'markers').map((d) => [d.id, d])
    );

    this.groups = new Map(); // typeId -> L.layerGroup
    this.counts = new Map(); // typeId -> feature count
    this.visibleState = new Map(); // typeId -> bool
    this.sectionLines = []; // top strokes for opacity control

    this.bounds = L.latLngBounds([]);
    this.opacity = persist.read(STORAGE.opacity, Math.round(DEFAULTS.sectionOpacity * 100)) / 100;

    this.warnings = [];
  }

  firstTypeForSource(source) {
    return this.registry.layerTypes.find((d) => d.source === source) || null;
  }

  groupFor(typeId) {
    if (!this.groups.has(typeId)) this.groups.set(typeId, L.layerGroup());
    return this.groups.get(typeId);
  }

  addCount(typeId, n) {
    this.counts.set(typeId, (this.counts.get(typeId) || 0) + n);
  }

  async loadAll() {
    for (const water of this.registry.waters) {
      await this.loadWater(water); // sequential keeps ordering + eases rate limits
    }
    this.applyInitialVisibility();
    return this.bounds;
  }

  async loadWater(water) {
    await this.#loadSection(water);
    await this.#loadMarkers(water);
    await this.#loadReviewAreas(water);
  }

  async #loadSection(water) {
    const type = this.firstTypeForSource('section');
    if (!water.layers?.section || !type) return;
    try {
      const fc = await loadGeoJSON(water.layers.section);
      const { layers, lines } = renderSection(fc, type, {
        water,
        onDocs: () => this.opts.onOpenDocs(water),
        opacity: this.opacity,
      });
      const group = this.groupFor(type.id);
      layers.forEach((l) => group.addLayer(l));
      group.addLayer(renderSectionNav(water, { onDocs: () => this.opts.onOpenDocs(water) }));
      this.sectionLines.push(...lines);
      this.addCount(type.id, lines.length);
      this.bounds.extend(boundsOf(fc));
      this.bounds.extend(L.latLng(water.center));
    } catch (error) {
      this.warnings.push(`${water.id}/section: ${error.message}`);
    }
  }

  async #loadMarkers(water) {
    if (!water.layers?.markers) return;
    try {
      const fc = await loadGeoJSON(water.layers.markers);
      for (const feature of fc.features) {
        const typeId = feature.properties?.type;
        const def = this.markerTypeDefs.get(typeId);
        if (!def) {
          this.warnings.push(`${water.id}: unbekannter Markertyp "${typeId}"`);
          continue;
        }
        const marker = renderPoint(feature, def, {
          water,
          onSelect: this.opts.onSelectMarker,
        });
        this.groupFor(def.id).addLayer(marker);
        this.addCount(def.id, 1);
        this.bounds.extend(toLatLng(feature.geometry.coordinates));
      }
    } catch (error) {
      this.warnings.push(`${water.id}/markers: ${error.message}`);
    }
  }

  async #loadReviewAreas(water) {
    const type = this.firstTypeForSource('review_areas');
    if (!water.layers?.review_areas || !type) return;
    try {
      const fc = await loadGeoJSON(water.layers.review_areas);
      for (const feature of fc.features) {
        const circle = renderReviewArea(feature, type, {
          onDocs: () => this.opts.onOpenDocs(water),
        });
        this.groupFor(type.id).addLayer(circle);
        this.addCount(type.id, 1);
        this.bounds.extend(toLatLng(feature.geometry.coordinates));
      }
    } catch (error) {
      this.warnings.push(`${water.id}/review_areas: ${error.message}`);
    }
  }

  applyInitialVisibility() {
    const saved = persist.read(STORAGE.layerVisibility, {});
    for (const def of this.activeTypeDefs()) {
      const visible = saved[def.id] ?? def.defaultVisible ?? true;
      this.setVisible(def.id, visible, { persistState: false });
    }
  }

  // Layer types that actually have data (drives the dynamic UI).
  activeTypeDefs() {
    return this.registry.layerTypes.filter((d) => (this.counts.get(d.id) || 0) > 0);
  }

  countFor(typeId) {
    return this.counts.get(typeId) || 0;
  }

  isVisible(typeId) {
    return this.visibleState.get(typeId) === true;
  }

  setVisible(typeId, visible, { persistState = true } = {}) {
    const group = this.groups.get(typeId);
    if (!group) return;
    this.visibleState.set(typeId, visible);
    if (visible) group.addTo(this.map);
    else this.map.removeLayer(group);
    if (persistState) {
      const saved = persist.read(STORAGE.layerVisibility, {});
      saved[typeId] = visible;
      persist.write(STORAGE.layerVisibility, saved);
    }
  }

  setSectionOpacityPercent(percent) {
    this.opacity = percent / 100;
    this.sectionLines.forEach((line) => line.setStyle({ opacity: this.opacity }));
    persist.write(STORAGE.opacity, percent);
  }

  sectionOpacityPercent() {
    return Math.round(this.opacity * 100);
  }

  hasSections() {
    return this.sectionLines.length > 0;
  }

  getBounds() {
    return this.bounds;
  }
}
