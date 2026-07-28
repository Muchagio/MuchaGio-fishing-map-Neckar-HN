// Loads and validates JSON / GeoJSON. In-memory cache prevents duplicate
// fetches; the service worker handles the offline / disk cache layer.

const memoryCache = new Map();

export async function loadJSON(url) {
  if (memoryCache.has(url)) return memoryCache.get(url);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const data = await response.json();
  memoryCache.set(url, data);
  return data;
}

export function isFeatureCollection(value) {
  return Boolean(value) && value.type === 'FeatureCollection' && Array.isArray(value.features);
}

export async function loadGeoJSON(url) {
  const data = await loadJSON(url);
  if (!isFeatureCollection(data)) {
    throw new Error(`${url}: kein gültiges GeoJSON FeatureCollection`);
  }
  return data;
}

export async function loadRegistry(url = 'data/registry.json') {
  const registry = await loadJSON(url);
  if (!Array.isArray(registry.waters) || !Array.isArray(registry.layerTypes)) {
    throw new Error('registry.json ist unvollständig (waters / layerTypes fehlen)');
  }
  return registry;
}
