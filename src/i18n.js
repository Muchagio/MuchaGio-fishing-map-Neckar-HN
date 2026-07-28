// Lightweight i18n. German is the default; the structure allows adding
// more languages later without touching call sites.

const STRINGS = {
  de: {
    'chrome.subtitleFallback': 'Digitale Orientierungskarte auf Basis der offiziellen Vereinsunterlagen.',
    'chrome.mapView': 'Kartenansicht',
    'chrome.layers': 'Ebenen',
    'chrome.references': 'Referenzkarten',
    'chrome.referencesSub': 'Originalunterlagen',
    'chrome.transparency': 'Transparenz',
    'chrome.legend': 'Legende',
    'chrome.switchWater': 'Gewässer wechseln',
    'chrome.prev': '‹ vorheriges',
    'chrome.next': 'nächstes ›',
    'chrome.about': 'ⓘ Über diese Karte',
    'chrome.rules': '▤ Regeln & Bestimmungen',
    'chrome.install': 'App installieren',
    'popup.openDocs': 'Unterlagen ansehen',
    'popup.verified': 'GIS-GEPRÜFT',
    'popup.allowed': 'GIS-ANGELBEREICH',
    'popup.reconcile': 'Final mit Originalunterlagen abgleichen.',
    'detail.docs': 'Originalunterlagen ansehen ↗',
    'detail.reconcile': 'Final immer mit den Originalunterlagen abgleichen.',
    'detail.source': 'Quelle',
    'detail.accuracy': 'Genauigkeit',
    'detail.type': 'Art',
    'detail.draft': 'Entwurf',
    'status.loading': 'Kartendaten werden geladen …',
    'status.error': 'Kartendaten konnten nicht vollständig geladen werden.',
    'locate.error': 'Standort konnte nicht bestimmt werden.',
    'error.leaflet': 'Karte konnte nicht geladen werden.',
    'reference.openOfficial': 'Offizielle Hege6-Seite öffnen ↗',
  },
};

let currentLang = 'de';

export function setLang(lang) {
  if (STRINGS[lang]) currentLang = lang;
}

export function t(key) {
  return STRINGS[currentLang][key] ?? STRINGS.de[key] ?? key;
}
