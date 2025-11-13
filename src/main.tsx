import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Handle GitHub Pages routing
function initializeApp() {
  console.log('Initializing AI-Assist-IDE...');
  
  const currentPath = window.location.pathname;
  const basePath = '/ai-assist-ide';
  
  // If we're at root, redirect to the base path
  if (currentPath === '/' || !currentPath.includes('ai-assist-ide')) {
    const newUrl = basePath + '/' + window.location.search + window.location.hash;
    console.log('Redirecting to base path:', newUrl);
    window.location.replace(newUrl);
    return false; // Don't render the app, let redirect happen
  }
  
  // If we're at /ai-assist-ide (without trailing slash), add it
  if (currentPath === basePath) {
    const newUrl = basePath + '/' + window.location.search + window.location.hash;
    window.history.replaceState(null, '', newUrl);
  }
  
  return true; // Safe to render the app
}

// Only render if we're at the correct path
if (initializeApp()) {
  createRoot(document.getElementById("root")!).render(<App />);
}
