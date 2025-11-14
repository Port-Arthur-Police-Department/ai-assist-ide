import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Clear any old service workers and register new one
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      console.log('Unregistering old service worker:', registration.scope);
      registration.unregister();
    });
    
    // After clearing, the new service worker will auto-register via VitePWA
  });
}

createRoot(document.getElementById("root")!).render(<App />);
