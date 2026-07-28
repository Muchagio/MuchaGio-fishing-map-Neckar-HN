// Reference gallery, info dialog and the marker detail card.
// Populates skeleton elements that live in index.html.

import { t } from '../i18n.js';

const $ = (sel) => document.querySelector(sel);

export function initDialogs(registry) {
  const referenceDialog = $('#referenceDialog');
  const infoDialog = $('#infoDialog');
  const detailCard = $('#detailCard');

  // --- wiring: reference dialog ---
  $('#closeReference').addEventListener('click', () => referenceDialog.close());
  referenceDialog.addEventListener('click', (e) => {
    if (e.target === referenceDialog) referenceDialog.close();
  });

  // --- wiring: info dialog ---
  $('#closeInfo').addEventListener('click', () => infoDialog.close());
  infoDialog.addEventListener('click', (e) => {
    if (e.target === infoDialog) infoDialog.close();
  });

  // Fill static version info from the registry.
  $('#appVersion').textContent = `v${registry.meta.version}`;
  $('#buildDate').textContent = registry.meta.buildDate.split('-').reverse().join('.');
  $('#releaseStatus').textContent = registry.meta.release || '';

  // --- wiring: detail card ---
  $('#closeDetail').addEventListener('click', () => detailCard.classList.add('hidden'));

  function openReferences(water) {
    $('#referenceTitle').textContent = water.name;
    $('#referenceSubtitle').textContent = water.subtitle;
    const figures = (water.references || [])
      .map(
        ([src, caption]) =>
          `<figure><a href="${src}" target="_blank" rel="noopener"><img src="${src}" alt="${caption}" loading="lazy"></a><figcaption>${caption}</figcaption></figure>`
      )
      .join('');
    $('#gallery').innerHTML =
      `<div class="official-link"><a href="${water.officialUrl}" target="_blank" rel="noopener">${t('reference.openOfficial')}</a></div>${figures}`;
    referenceDialog.showModal();
  }

  function openInfo() {
    infoDialog.showModal();
  }

  function showDetail(feature, latlng, water) {
    const p = feature.properties || {};
    $('#detailTitle').textContent = p.title || water.name;
    $('#detailLocation').textContent = `⌖ ${latlng[0].toFixed(5)}, ${latlng[1].toFixed(5)}`;
    $('#detailNote').textContent = p.description || '';
    $('#detailType').textContent = typeLabel(registry, p.type);
    $('#detailAccuracy').textContent = p.accuracy || (p.verified ? 'verifiziert' : t('detail.draft'));
    $('#detailSource').textContent = p.source || '—';
    $('#detailVerified').textContent = p.verified ? 'verifiziert' : t('detail.draft');
    $('#detailDocs').onclick = () => openReferences(water);
    detailCard.classList.remove('hidden');
  }

  function setStatus(text, state = 'loading') {
    const node = $('#runtimeStatus');
    if (!node) return;
    node.textContent = text;
    node.dataset.state = state;
  }

  return { openReferences, openInfo, showDetail, setStatus };
}

function typeLabel(registry, typeId) {
  return registry.layerTypes.find((d) => d.id === typeId)?.label || typeId || '—';
}
