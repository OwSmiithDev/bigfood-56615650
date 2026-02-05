import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// PWA: registra service worker com auto-update (sem UX de offline)
registerSW({
  immediate: true,
  onRegisteredSW(swUrl) {
    if (import.meta.env.DEV) console.log("[PWA] SW registered:", swUrl);
  },
  onRegisterError(error) {
    if (import.meta.env.DEV) console.warn("[PWA] SW register error:", error);
  },
});

createRoot(document.getElementById("root")!).render(<App />);
