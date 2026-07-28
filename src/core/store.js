// Minimal localStorage-backed persistence. Safe if storage is unavailable
// (private mode / quota). This is the seam future features (favorites,
// notes, offline prefs) plug into.

export const persist = {
  read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (_) {
      return fallback;
    }
  },
  write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {
      /* ignore quota / disabled storage */
    }
  },
};
