import { createRoot } from "react-dom/client";
import SimpleApp from "./App.simple.tsx"; // Use simple version
import "./index.css";

createRoot(document.getElementById("root")!).render(<SimpleApp />);
