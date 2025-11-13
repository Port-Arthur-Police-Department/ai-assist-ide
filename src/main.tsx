import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Service Worker cleanup for old projects
function cleanupOldServiceWorkers() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        // Only unregister service workers from old projects
        if (registration.scope.includes('scheduler') || !registration.scope.includes('ai-assist-ide')) {
          console.log('Unregistering old service worker:', registration.scope);
          registration.unregister();
        }
      });
    });
  }

  // Clear old caches
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        if (cacheName.includes('scheduler') || !cacheName.includes('ai-assist-ide')) {
          console.log('Deleting old cache:', cacheName);
          caches.delete(cacheName);
        }
      });
    });
  }
}

// Run cleanup on startup
cleanupOldServiceWorkers();

createRoot(document.getElementById("root")!).render(<App />);
