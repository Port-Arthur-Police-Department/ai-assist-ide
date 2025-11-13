import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Enhanced initialization for HashRouter
function initializeApp() {
  console.log('Initializing AI-Assist-IDE...');
  
  // Clear old service workers and caches
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        console.log('Unregistering service worker:', registration.scope);
        registration.unregister();
      });
    });
  }

  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        console.log('Deleting cache:', cacheName);
        caches.delete(cacheName);
      });
    });
  }

  // Handle GitHub Pages routing with HashRouter
  const currentPath = window.location.pathname;
  const basePath = '/ai-assist-ide';
  
  // If we're at the base path without hash, redirect to hash route
  if (currentPath === basePath || currentPath === basePath + '/') {
    if (!window.location.hash) {
      const newUrl = basePath + '/#/' + window.location.search;
      console.log('Redirecting to hash route:', newUrl);
      window.location.replace(newUrl);
    }
  }
  
  // If we're at root, redirect to base path with hash
  if (currentPath === '/' || !currentPath.includes('ai-assist-ide')) {
    const newUrl = basePath + '/#/' + window.location.search;
    console.log('Redirecting from root to base path:', newUrl);
    window.location.replace(newUrl);
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
