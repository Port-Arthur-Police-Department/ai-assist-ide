import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Clear any old service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.unregister());
  });
}

// Handle GitHub Pages routing
const currentPath = window.location.pathname;
const basePath = '/ai-assist-ide';

// If we're at the base path without hash, redirect to hash route
if ((currentPath === basePath || currentPath === basePath + '/') && !window.location.hash) {
  const newUrl = basePath + '/#/' + window.location.search;
  window.history.replaceState(null, '', newUrl);
}

// If we're at root or wrong path, redirect to correct path
if (currentPath === '/' || !currentPath.includes('ai-assist-ide')) {
  const newUrl = basePath + '/#/' + window.location.search;
  window.location.replace(newUrl);
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}
