// Builds the dynamic chrome from the registry + LayerManager state.
// Layer toggles and the legend are GENERATED from whichever layer types
// actually have data — so adding data makes new controls appear by itself.

import { colorFor } from '../core/tokens.js';
import { persist } from '../core/store.js';
import { STORAGE, DEFAULTS } from '../core/constants.js';
import { flyToWater } from '../map/mapController.js';
import { fetchWaterLevel, formatWaterLevel } from '../features/waterLevel.js';
import { t } from '../i18n.js';

/* tiny DOM helper */
function h(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === 'class') node.className = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key === 'text') node.textContent = value;
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value != null) node.setAttribute(key, value);
  }
  (Array.isArray(children) ? children : [children])
    .filter(Boolean)
    .forEach((c) => node.append(c));
  return node;
}

export function initUI({ registry, map, layerManager, basemapManager, dialogs }) {
  const $ = (sel) => document.querySelector(sel);
  const sidebar = $('#sidebar');

  let currentIndex = clampIndex(persist.read(STORAGE.lastWater, 0));
  let levelToken = 0; // guards async water-level updates against fast section switches
  const waters = registry.waters;
  const currentWater = () => waters[currentIndex];

  buildSidebar();
  buildLegend();
  buildWaterSwitcher();
  wireMobileMenu();
  wireFooterButtons();
  updateWaterMeta();

  /* ---------------- Sidebar ---------------- */
  function buildSidebar() {
    sidebar.replaceChildren();
    sidebar.append(
      h('button', { class: 'close-mobile', type: 'button', 'aria-label': 'Menü schließen', text: '×', onClick: closeSidebar }),
      h('div', { id: 'sbMeta' }),
      h('div', { id: 'sbLayers' }),
      h('div', { id: 'sbBase' }),
      h('div', { id: 'sbOpacity' }),
      h('button', {
        class: 'accordion',
        type: 'button',
        onClick: () => dialogs.openReferences(currentWater()),
      }, [
        h('span', { text: '▧' }),
        h('div', { class: 'accordion-body' }, [
          h('b', { text: t('chrome.references') }),
          h('small', { text: t('chrome.referencesSub') }),
        ]),
        h('span', { text: '›' }),
      ])
    );
    buildLayerControls();
    buildBasemapToggle();
    buildOpacityControl();
  }

  function buildLayerControls() {
    const host = $('#sbLayers');
    host.replaceChildren(h('div', { class: 'layer-group-title', text: t('chrome.layers') }));
    // Group active layer types by their `group` field, preserving registry order.
    const groups = new Map();
    for (const def of layerManager.activeTypeDefs()) {
      if (!groups.has(def.group)) groups.set(def.group, []);
      groups.get(def.group).push(def);
    }
    for (const [groupName, defs] of groups) {
      host.append(h('div', { class: 'layer-group-title', text: groupName }));
      for (const def of defs) host.append(layerRow(def));
    }
  }

  function layerRow(def) {
    const input = h('input', {
      type: 'checkbox',
      ...(layerManager.isVisible(def.id) ? { checked: 'checked' } : {}),
      onChange: (e) => layerManager.setVisible(def.id, e.target.checked),
    });
    return h(
      'label',
      { class: 'layer-row', style: `--layer-color:${colorFor(def.colorVar)}` },
      [
        h('span', { class: 'layer-icon', text: def.icon || '•' }),
        h('span', { class: 'layer-label', text: def.label }),
        h('span', { class: 'layer-count', text: String(layerManager.countFor(def.id)) }),
        input,
        h('span', { class: 'toggle' }),
      ]
    );
  }

  function buildBasemapToggle() {
    const host = $('#sbBase');
    host.replaceChildren(h('div', { class: 'layer-group-title', text: t('chrome.mapView') }));
    const row = h('div', { class: 'base-toggle' });
    for (const id of basemapManager.ids()) {
      row.append(
        h('button', {
          type: 'button',
          'data-base': id,
          class: basemapManager.activeId === id ? 'active' : '',
          onClick: () => setBasemap(id),
        }, [
          h('span', { class: `base-preview ${id}` }),
          document.createTextNode(basemapManager.labelFor(id)),
        ])
      );
    }
    host.append(row);
  }

  function setBasemap(id) {
    basemapManager.set(id);
    persist.write(STORAGE.basemap, id);
    document.querySelectorAll('[data-base]').forEach((b) =>
      b.classList.toggle('active', b.dataset.base === id)
    );
  }

  function buildOpacityControl() {
    const host = $('#sbOpacity');
    host.replaceChildren();
    if (!layerManager.hasSections()) return;
    const value = layerManager.sectionOpacityPercent();
    const label = h('b', { text: `${value} %` });
    host.append(
      h('div', { class: 'opacity-control' }, [
        h('div', { class: 'row' }, [h('span', { text: t('chrome.transparency') }), label]),
        h('input', {
          type: 'range',
          min: DEFAULTS.minOpacityPercent,
          max: DEFAULTS.maxOpacityPercent,
          value,
          'aria-label': t('chrome.transparency'),
          onInput: (e) => {
            const v = +e.target.value;
            label.textContent = `${v} %`;
            layerManager.setSectionOpacityPercent(v);
          },
        }),
      ])
    );
  }

  function updateWaterMeta() {
    const w = currentWater();
    const children = [
      h('div', { class: 'eyebrow', text: w.region.toUpperCase() }),
      h('h1', { text: w.name }),
      h('div', { class: 'subtitle', text: w.subtitle }),
      h('p', { text: t('chrome.subtitleFallback') }),
    ];
    if (w.rules) children.push(rulesBlock(w.rules));
    if (w.pegel) children.push(h('div', { class: 'water-level', id: 'waterLevel', text: 'Pegel wird geladen …' }));
    $('#sbMeta').replaceChildren(...children);
    if (w.pegel) loadWaterLevel(w);
  }

  // Live gauge reading (PEGELONLINE). Token guards against fast section switches.
  async function loadWaterLevel(w) {
    const token = ++levelToken;
    try {
      const data = await fetchWaterLevel(w.pegel.uuid);
      if (token !== levelToken) return;
      const el = $('#waterLevel');
      if (el) {
        el.innerHTML = formatWaterLevel(w.pegel.name, data);
        el.dataset.state = data.state;
      }
    } catch (_) {
      if (token !== levelToken) return;
      const el = $('#waterLevel');
      if (el) el.textContent = `Pegel ${w.pegel.name}: nicht verfügbar`;
    }
  }

  // Official Hege6 fishable / closed rules for the current water.
  function rulesBlock(rules) {
    const rows = [];
    if (rules.fishable)
      rows.push(h('div', { class: 'rule-row fishable' }, [
        h('span', { class: 'rule-dot' }), h('span', { text: rules.fishable }),
      ]));
    if (rules.closed)
      rows.push(h('div', { class: 'rule-row closed' }, [
        h('span', { class: 'rule-dot' }), h('span', { text: rules.closed }),
      ]));
    if (rules.note) rows.push(h('div', { class: 'rule-note', text: rules.note }));
    return h('div', { class: 'rules-block' }, rows);
  }

  /* ---------------- Legend ---------------- */
  function buildLegend() {
    const host = $('#legendItems');
    host.replaceChildren();
    for (const def of layerManager.activeTypeDefs()) {
      const swatchClass =
        def.geometry === 'line' ? 'legend-swatch line'
        : def.geometry === 'circle' ? 'legend-swatch circle'
        : 'legend-swatch';
      const swatch = h('span', {
        class: swatchClass,
        style: `--layer-color:${colorFor(def.colorVar)}`,
        text: def.geometry === 'point' ? def.icon || '' : '',
      });
      host.append(
        h('div', { class: 'legend-item' }, [
          swatch,
          h('p', {}, [h('b', { text: def.label }), h('small', { text: def.legend || '' })]),
        ])
      );
    }
  }

  /* ---------------- Water switcher ---------------- */
  function buildWaterSwitcher() {
    const select = $('#waterSelect');
    select.replaceChildren(
      ...waters.map((w) =>
        h('option', { value: w.id, text: `${String(w.number).padStart(2, '0')} · ${w.short}` })
      )
    );
    select.value = currentWater().id;
    select.addEventListener('change', () => {
      currentIndex = waters.findIndex((w) => w.id === select.value);
      go(currentIndex);
    });
    $('#prevWater').addEventListener('click', () => go(currentIndex - 1));
    $('#nextWater').addEventListener('click', () => go(currentIndex + 1));
  }

  function go(index) {
    currentIndex = ((index % waters.length) + waters.length) % waters.length;
    const w = currentWater();
    $('#waterSelect').value = w.id;
    persist.write(STORAGE.lastWater, currentIndex);
    updateWaterMeta();
    flyToWater(map, w);
  }

  /* ---------------- Mobile menu ---------------- */
  function openSidebar() {
    sidebar.classList.add('open');
    $('#backdrop').classList.add('show');
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    $('#backdrop').classList.remove('show');
  }
  function wireMobileMenu() {
    $('#menuButton').addEventListener('click', openSidebar);
    $('#backdrop').addEventListener('click', closeSidebar);
  }

  /* ---------------- Footer buttons ---------------- */
  function wireFooterButtons() {
    $('#aboutButton').addEventListener('click', dialogs.openInfo);
    $('#rulesButton').addEventListener('click', dialogs.openInfo);
  }

  function clampIndex(i) {
    const n = registry.waters.length;
    return Number.isInteger(i) && i >= 0 && i < n ? i : 0;
  }

  return { go, currentWater };
}
