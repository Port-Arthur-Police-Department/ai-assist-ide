import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Service worker handling
if ('serviceWorker' in navigator) {
  // Clear old service workers
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      if (!registration.scope.includes('ai-assist-ide')) {
        registration.unregister();
      }
    });
  });

  // Listen for service worker updates
  navigator.serviceWorker.ready.then((registration) => {
    console.log('Service Worker is ready:', registration);
  });

  // Listen for controller change (when new SW takes control)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('New Service Worker is controlling the page');
  });
}

// BeforeInstallPrompt event for custom install button
let deferredPrompt: any;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('PWA install prompt available');
  
  // You can show your own install button here
  // and call deferredPrompt.prompt() when clicked
});

createRoot(document.getElementById("root")!).render(<App />);