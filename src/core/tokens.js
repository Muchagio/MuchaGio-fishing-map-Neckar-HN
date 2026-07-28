// Reads design tokens from tokens.css so JS and CSS share ONE color source.

function rootStyle() {
  return getComputedStyle(document.documentElement);
}

export function cssVar(name) {
  return rootStyle().getPropertyValue(name).trim();
}

export function colorFor(varName, fallback = '#49e59d') {
  return cssVar(varName) || fallback;
}

export function numberVar(name, fallback) {
  const value = parseFloat(cssVar(name));
  return Number.isFinite(value) ? value : fallback;
}
