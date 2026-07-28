// Geometry helpers. GeoJSON stores [lng, lat]; Leaflet wants [lat, lng].

const L = window.L;

export function toLatLng([lng, lat]) {
  return [lat, lng];
}

// Accepts a GeoJSON LineString coordinate array -> array of [lat,lng]
export function lineToLatLngs(coordinates) {
  return coordinates.map(toLatLng);
}

// Returns an L.latLngBounds for a whole FeatureCollection (Points + LineStrings).
export function boundsOf(featureCollection) {
  const bounds = L.latLngBounds([]);
  for (const feature of featureCollection.features) {
    const { type, coordinates } = feature.geometry || {};
    if (type === 'Point') {
      bounds.extend(toLatLng(coordinates));
    } else if (type === 'LineString') {
      coordinates.forEach((c) => bounds.extend(toLatLng(c)));
    } else if (type === 'MultiLineString' || type === 'Polygon') {
      coordinates.flat().forEach((c) => bounds.extend(toLatLng(c)));
    }
  }
  return bounds;
}
