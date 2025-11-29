import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Emergency Cleanup: Force unregister any service workers that might have been installed
// during the PWA attempt. We wrap this in a load event listener and try/catch 
// to prevent "The document is in an invalid state" errors.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().catch(err => {
            console.debug("SW Unregister failed (harmless):", err);
          });
        }
      })
      .catch((error) => {
        // Silently catch errors like "document is in an invalid state"
        console.debug("Service Worker cleanup skipped:", error);
      });
  });
}