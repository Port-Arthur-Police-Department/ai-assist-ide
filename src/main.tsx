import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Simple initialization - no service worker cleanup
function initializeApp() {
  console.log('Initializing AI-Assist-IDE...');
  
  // Simple path correction for GitHub Pages
  const currentPath = window.location.pathname;
  const basePath = '/ai-assist-ide';
  
  // If we're at the base path without hash, add hash for HashRouter
  if ((currentPath === basePath || currentPath === basePath + '/') && !window.location.hash) {
    const newUrl = basePath + '/#/' + window.location.search;
    console.log('Adding hash for routing:', newUrl);
    window.history.replaceState(null, '', newUrl);
  }
}

initializeApp();

createRoot(document.getElementById("root")!).render(<App />);
