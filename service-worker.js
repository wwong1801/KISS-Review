// This service worker is intentionally designed to unregister itself.
// This ensures that anyone who visited the PWA version will have it removed automatically.

self.addEventListener('install', (event) => {
  // Take over immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Unregister this service worker immediately
  self.registration.unregister()
    .then(() => {
      return self.clients.matchAll();
    })
    .then((clients) => {
      // Reload all open pages to ensure they use the fresh network version
      clients.forEach((client) => client.navigate(client.url));
    });
});