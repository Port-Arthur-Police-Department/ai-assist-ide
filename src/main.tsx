import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Enhanced cleanup and routing fix
function initializeApp() {
  console.log('Initializing AI-Assist-IDE...');
  
  // Clear old service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        console.log('Unregistering service worker:', registration.scope);
        registration.unregister();
      });
    });
  }

  // Clear old caches
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        console.log('Deleting cache:', cacheName);
        caches.delete(cacheName);
      });
    });
  }

  // Fix routing - ensure we're at the correct base path
  const currentPath = window.location.pathname;
  const basePath = '/ai-assist-ide';
  
  // If we're not at the correct path, redirect
  if (!currentPath.startsWith(basePath + '/') && currentPath !== basePath) {
    const newUrl = basePath + '/' + window.location.search + window.location.hash;
    console.log('Redirecting to correct path:', newUrl);
    window.history.replaceState(null, '', newUrl);
  }
}

// Run initialization
initializeApp();

// Render the app
const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

createRoot(container).render(<App />);
