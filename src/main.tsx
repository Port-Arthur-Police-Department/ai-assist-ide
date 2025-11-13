import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Clear old service workers and caches on startup
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      // Only unregister service workers from old projects or incorrect paths
      if (registration.scope.includes('scheduler') || !registration.scope.includes('ai-assist-ide')) {
        registration.unregister();
        console.log('Unregistered old service worker:', registration.scope);
      }
    });
  });
}

// Clear old caches
if ('caches' in window) {
  caches.keys().then(cacheNames => {
    cacheNames.forEach(cacheName => {
      if (cacheName.includes('scheduler') || !cacheName.includes('ai-assist-ide')) {
        caches.delete(cacheName);
        console.log('Deleted old cache:', cacheName);
      }
    });
  });
}

// Redirect if we're at the wrong path
const currentPath = window.location.pathname;
if (currentPath === '/' || currentPath === '/ai-assist-ide' || !currentPath.includes('ai-assist-ide')) {
  // If we're at root or missing the base path, redirect to correct path
  const newPath = '/ai-assist-ide/' + window.location.search + window.location.hash;
  if (window.location.href !== newPath) {
    window.history.replaceState(null, '', newPath);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
