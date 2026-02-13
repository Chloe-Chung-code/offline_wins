"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("pwa_install_dismissed")) {
      setDismissed(true);
    }

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
    <div className="w-full max-w-sm mx-auto mb-4 bg-white rounded-lg p-4 shadow-soft animate-fade_in_up">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-forest">
            Install Offline Wins
          </p>
          <p className="text-caption">
            Add to your home screen
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-forest/5 transition-colors text-muted"
          >
            <X size={16} />
          </button>
          <button
            type="button"
            onClick={handleInstall}
            className="px-4 py-2 rounded-pill bg-forest text-white text-xs font-medium min-h-[36px] transition-all duration-200"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
