import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Handle routing and service worker cleanup
function initializeApp() {
  console.log('Initializing AI-Assist-IDE...');
  
  const currentPath = window.location.pathname;
  const basePath = '/ai-assist-ide';
  
  // Fix routing for HashRouter
  if ((currentPath === basePath || currentPath === basePath + '/') && !window.location.hash) {
    const newUrl = basePath + '/#/' + window.location.search;
    console.log('Redirecting to hash route:', newUrl);
    window.history.replaceState(null, '', newUrl);
  }
  
  // Clear old service workers from other projects
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        if (registration.scope.includes('scheduler') || !registration.scope.includes('ai-assist-ide')) {
          console.log('Unregistering old service worker:', registration.scope);
          registration.unregister();
        }
      });
    });
  }
}

initializeApp();

createRoot(document.getElementById("root")!).render(<App />);
