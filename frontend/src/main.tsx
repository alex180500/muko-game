import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { cleanupStaleSessions } from "./lib/session";

// Purge sessions older than 24h on app boot
cleanupStaleSessions();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
