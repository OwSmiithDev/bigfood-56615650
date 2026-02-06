import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Minimal typing for the native event (not in standard TS lib)
export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const LS_DECLINED_AT = "pwa-install-declined-at"; // ISO string
const LS_DECLINED_AFTER_AUTH_AT = "pwa-install-declined-after-auth-at"; // ISO string

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function readRecentFlag(key: string) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const ts = Date.parse(raw);
    if (Number.isNaN(ts)) return false;
    return Date.now() - ts < ONE_DAY_MS;
  } catch {
    return false;
  }
}

function writeNow(key: string) {
  try {
    localStorage.setItem(key, new Date().toISOString());
  } catch {
    // ignore
  }
}

function isIos() {
  // iPadOS can report as Mac; we rely on touch points as well
  const ua = navigator.userAgent || "";
  const isAppleMobile = /iPad|iPhone|iPod/.test(ua);
  const isIpadOs = ua.includes("Mac") && (navigator as any).maxTouchPoints > 1;
  return isAppleMobile || isIpadOs;
}

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    (navigator as any).standalone === true
  );
}

export function usePWAInstall() {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  const [hasInstallEvent, setHasInstallEvent] = useState(false);
  const [installed, setInstalled] = useState(false);

  const [declinedRecently, setDeclinedRecently] = useState(() => readRecentFlag(LS_DECLINED_AT));
  const [declinedAfterAuthRecently, setDeclinedAfterAuthRecently] = useState(() =>
    readRecentFlag(LS_DECLINED_AFTER_AUTH_AT)
  );

  const ios = useMemo(() => isIos(), []);

  useEffect(() => {
    setInstalled(isStandalone());

    const onAppInstalled = () => {
      setInstalled(true);
      deferredPromptRef.current = null;
      setHasInstallEvent(false);
    };

    // Chrome/Edge
    window.addEventListener("appinstalled", onAppInstalled);

    // Detect standalone changes where supported
    const mql = window.matchMedia?.("(display-mode: standalone)");
    const onMql = () => setInstalled(isStandalone());
    mql?.addEventListener?.("change", onMql);

    return () => {
      window.removeEventListener("appinstalled", onAppInstalled);
      mql?.removeEventListener?.("change", onMql);
    };
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      // Prevent mini-infobar on mobile
      e.preventDefault?.();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setHasInstallEvent(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  const canInstall = useMemo(() => {
    if (installed) return false;
    // iOS: no beforeinstallprompt, but we can still show instructions
    if (ios) return true;
    return hasInstallEvent;
  }, [hasInstallEvent, installed, ios]);

  const promptInstall = useCallback(async () => {
    const evt = deferredPromptRef.current;
    if (!evt) return { outcome: "dismissed" as const };

    await evt.prompt();
    const choice = await evt.userChoice;

    // Clear after prompting
    deferredPromptRef.current = null;
    setHasInstallEvent(false);

    return choice;
  }, []);

  const decline = useCallback((mode: "initial" | "after_auth") => {
    if (mode === "initial") {
      writeNow(LS_DECLINED_AT);
      setDeclinedRecently(true);
      return;
    }

    writeNow(LS_DECLINED_AFTER_AUTH_AT);
    setDeclinedAfterAuthRecently(true);
  }, []);

  return {
    ios,
    installed,
    canInstall,
    declinedRecently,
    declinedAfterAuthRecently,
    promptInstall,
    decline,
  };
}
