"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    if (typeof window !== "undefined" && sessionStorage.getItem("pwa_install_dismissed")) {
      setDismissed(true);
    }

    // Check if already installed
    if (typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  if (!show || dismissed || !deferredPrompt) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setDismissed(true);
    setShow(false);
    sessionStorage.setItem("pwa_install_dismissed", "true");
  }

  return (
    <div className="w-full max-w-sm mx-auto mb-4 bg-white/70 rounded-card p-4 shadow-sm animate-fade_in_up">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-forest">
            Install Offline Wins
          </p>
          <p className="text-xs text-forest/50">
            Add to your home screen for the full experience
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="text-xs text-forest/40 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            Later
          </button>
          <button
            type="button"
            onClick={handleInstall}
            className="px-4 py-2 rounded-pill bg-forest text-cream text-xs font-medium min-h-[44px]"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
