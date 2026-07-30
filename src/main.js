// Application bootstrap. Wires the registry, map, layers, UI and PWA
// together. This is the only place that knows about ALL the pieces;
// everything else stays decoupled and independently testable.

import { loadRegistry } from './core/dataLoader.js';
import { persist } from './core/store.js';
import { STORAGE } from './core/constants.js';
import { createMap, enableLocate } from './map/mapController.js';
import { BasemapManager } from './map/basemaps.js';
import { LayerManager } from './layers/layerManager.js';
import { enableDepthQuery } from './layers/depthQuery.js';
import { initDialogs } from './ui/dialogs.js';
import { initUI } from './ui/ui.js';
import { registerServiceWorker, initInstallPrompt } from './pwa/register.js';
import { t } from './i18n.js';

async function boot() {
  const errorEl = document.getElementById('loadError');

  if (typeof window.L === 'undefined') {
    errorEl.hidden = false;
    errorEl.textContent = t('error.leaflet');
    return;
  }

  registerServiceWorker();
  initInstallPrompt('installButton');

  try {
    const registry = await loadRegistry();
    document.getElementById('versionBadge').textContent = `v${registry.meta.version}`;

    const map = createMap('map', registry.map);

    const basemapManager = new BasemapManager(map, registry.basemaps, registry.map.maxZoom);
    basemapManager.set(persist.read(STORAGE.basemap, registry.map.defaultBasemap));

    const dialogs = initDialogs(registry);
    dialogs.setStatus(t('status.loading'), 'loading');

    const layerManager = new LayerManager(map, registry, {
      onSelectMarker: (feature, latlng, water) => dialogs.showDetail(feature, latlng, water),
      onOpenDocs: (water) => dialogs.openReferences(water),
    });
    await layerManager.loadAll();

    initUI({ registry, map, layerManager, basemapManager, dialogs });

    const bounds = layerManager.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds.pad(registry.map.fitBoundsPadding));

    const locate = enableLocate(map, { onError: () => alert(t('locate.error')) });
    document.getElementById('locateButton').addEventListener('click', locate);

    // Tap-to-depth on the official WSV depth chart layer.
    const depthDef = registry.layerTypes.find((l) => l.id === 'depth_ienc' && l.wms);
    if (depthDef) {
      enableDepthQuery(map, {
        isActive: () => layerManager.isVisible('depth_ienc'),
        wms: depthDef.wms,
      });
    }

    // Runtime status for the info dialog.
    const activeTypes = layerManager.activeTypeDefs().length;
    const warnings = layerManager.warnings;
    dialogs.setStatus(
      `GIS aktiv: ${registry.waters.length} Gewässer geladen · ${activeTypes} Ebenentypen mit Daten.` +
        (warnings.length ? ` ${warnings.length} Hinweis(e) – siehe Konsole.` : ' Keine Ladefehler.'),
      warnings.length ? 'warning' : 'ok'
    );
    if (warnings.length) console.warn('Ladehinweise:', warnings);
  } catch (error) {
    console.error(error);
    errorEl.hidden = false;
    errorEl.textContent = `${t('status.error')} (${error.message})`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
