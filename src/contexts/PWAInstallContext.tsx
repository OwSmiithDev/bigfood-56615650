import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { usePWAInstall as usePWAInstallHook } from "@/hooks/usePWAInstall";

type InstallDialogSource = "initial" | "after_auth";

type PWAInstallContextValue = {
  open: boolean;
  canInstall: boolean;
  ios: boolean;
  installed: boolean;
  openDialog: (source: InstallDialogSource) => void;
  closeDialog: () => void;
  decline: () => void;
  triggerNativeInstall: () => Promise<void>;
  onAuthSuccess: () => void;
};

const PWAInstallContext = createContext<PWAInstallContextValue | null>(null);

export function PWAInstallProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const {
    ios,
    installed,
    canInstall,
    declinedRecently,
    declinedAfterAuthRecently,
    promptInstall,
    decline: declineFlag,
  } = usePWAInstallHook();

  const [open, setOpen] = useState(false);
  const [lastSource, setLastSource] = useState<InstallDialogSource>("initial");
  const [shownThisPage, setShownThisPage] = useState(false);

  // Reset the "shown" guard on route changes so "Ao acessar qualquer página" funcione.
  useEffect(() => {
    setShownThisPage(false);
  }, [location.key]);

  const openDialog = useCallback((source: InstallDialogSource) => {
    setLastSource(source);
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => setOpen(false), []);

  const triggerNativeInstall = useCallback(async () => {
    if (ios) return; // iOS: instruções manuais
    try {
      const choice = await promptInstall();
      if (choice.outcome === "accepted") {
        setOpen(false);
      }
    } catch {
      // ignore
    }
  }, [ios, promptInstall]);

  const decline = useCallback(() => {
    declineFlag(lastSource);
    setOpen(false);
  }, [declineFlag, lastSource]);

  // Auto-show 2.5s after page load if eligible and not declined.
  useEffect(() => {
    if (shownThisPage) return;
    if (!canInstall) return;
    if (installed) return;
    if (declinedRecently) return;

    const t = window.setTimeout(() => {
      setShownThisPage(true);
      openDialog("initial");
    }, 2500);

    return () => window.clearTimeout(t);
  }, [canInstall, declinedRecently, installed, openDialog, shownThisPage]);

  const onAuthSuccess = useCallback(() => {
    // Only re-ask after auth if user declined on initial prompt and hasn't declined after auth recently.
    if (!canInstall) return;
    if (installed) return;
    if (!declinedRecently) return;
    if (declinedAfterAuthRecently) return;

    openDialog("after_auth");
  }, [canInstall, declinedAfterAuthRecently, declinedRecently, installed, openDialog]);

  const value = useMemo<PWAInstallContextValue>(
    () => ({
      open,
      canInstall,
      ios,
      installed,
      openDialog,
      closeDialog,
      decline,
      triggerNativeInstall,
      onAuthSuccess,
    }),
    [open, canInstall, ios, installed, openDialog, closeDialog, decline, triggerNativeInstall, onAuthSuccess]
  );

  return <PWAInstallContext.Provider value={value}>{children}</PWAInstallContext.Provider>;
}

export function usePWAInstall() {
  const ctx = useContext(PWAInstallContext);
  if (!ctx) throw new Error("usePWAInstall must be used within PWAInstallProvider");
  return ctx;
}
