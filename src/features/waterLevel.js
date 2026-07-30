// Live water levels from the official PEGELONLINE REST API (WSV).
// Free, no key. Current gauge reading in cm per section.

const API = 'https://www.pegelonline.wsv.de/webservices/rest-api/v2/stations/';

const STATE_LABELS = {
  low: 'niedrig',
  normal: 'normal',
  high: 'hoch',
  unknown: '',
};

export async function fetchWaterLevel(uuid) {
  const response = await fetch(`${API}${uuid}/W/currentmeasurement.json`);
  if (!response.ok) throw new Error(`Pegel HTTP ${response.status}`);
  const data = await response.json();
  return {
    value: data.value,
    unit: 'cm',
    timestamp: data.timestamp,
    state: data.stateNswHsw || 'unknown',
  };
}

export function formatWaterLevel(name, data) {
  let time = '';
  try {
    time = new Date(data.timestamp).toLocaleString('de-DE', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  } catch (_) { /* ignore */ }
  const state = STATE_LABELS[data.state] || '';
  return `Pegel ${name}: <b>${data.value} ${data.unit}</b>${state ? ` · ${state}` : ''}${time ? ` · ${time}` : ''}`;
}
