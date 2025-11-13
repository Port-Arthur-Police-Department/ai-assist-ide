import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Nuclear cleanup for old projects
function nuclearCleanup() {
  console.log('Performing nuclear cleanup of old project data...');
  
  // 1. Clear all storage
  localStorage.clear();
  sessionStorage.clear();
  
  // 2. Clear all service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        console.log('Unregistering:', registration.scope);
        registration.unregister();
      });
    });
  }
  
  // 3. Clear all caches
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        console.log('Deleting cache:', cacheName);
        caches.delete(cacheName);
      });
    });
  }
  
  // 4. Clear IndexedDB
  if (window.indexedDB) {
    indexedDB.databases?.().then(databases => {
      databases.forEach(db => {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
          console.log('Deleting database:', db.name);
        }
      });
    });
  }
  
  // 5. Remove any old manifest links
  document.querySelectorAll('link[rel="manifest"]').forEach(link => {
    if (link.getAttribute('href')?.includes('scheduler')) {
      link.remove();
    }
  });
}

// Run cleanup on startup
nuclearCleanup();

// If we still detect scheduler references, force reload
if (window.location.href.includes('scheduler') || 
    document.documentElement.innerHTML.includes('scheduler')) {
  console.log('Detected scheduler references, forcing cleanup...');
  nuclearCleanup();
  setTimeout(() => {
    window.location.replace('/ai-assist-ide/');
  }, 100);
}

createRoot(document.getElementById("root")!).render(<App />);
