import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Service Worker cleanup for GitHub Pages
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister();
      console.log('ServiceWorker unregistered:', registration.scope);
    });
  });

  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        // Only delete caches that don't belong to current project
        if (!cacheName.includes('ai-assist-ide')) {
          caches.delete(cacheName);
          console.log('Cache deleted:', cacheName);
        }
      });
    });
  }
}

// Clear any existing service workers and reload if needed
if (location.href.includes('scheduler')) {
  // If we're still referencing the old project, do a hard redirect
  location.replace('/ai-assist-ide/');
}

createRoot(document.getElementById("root")!).render(<App />);
