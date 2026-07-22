// v0.5.0: bewusst kein Offline-Cache, damit GitHub-Pages-Updates sofort sichtbar werden.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key)))).then(() => self.clients.claim())));
