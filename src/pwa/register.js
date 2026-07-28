// Registers the service worker and handles the install prompt.
// NOTE: unlike the old build, we no longer unregister workers or wipe
// caches on load — that had disabled offline support entirely.

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('service-worker.js')
      .catch((error) => console.warn('Service-Worker-Registrierung fehlgeschlagen:', error));
  });
}

export function initInstallPrompt(buttonId) {
  const button = document.getElementById(buttonId);
  if (!button) return;
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    button.hidden = false;
  });

  button.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    button.hidden = true;
  });

  window.addEventListener('appinstalled', () => {
    button.hidden = true;
  });
}
