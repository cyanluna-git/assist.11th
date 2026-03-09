"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already in standalone or dismissed this session
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
    setDismissed(true);
  };

  return (
    <div className="fixed inset-x-4 bottom-20 z-50 flex items-center gap-3 rounded-xl bg-brand p-3 shadow-lg md:hidden">
      <Download className="size-5 shrink-0 text-white" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">앱으로 설치하기</p>
        <p className="text-xs text-white/70">홈 화면에 추가하여 더 빠르게 사용하세요</p>
      </div>
      <Button
        size="xs"
        variant="secondary"
        onClick={handleInstall}
        className="shrink-0"
      >
        설치
      </Button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-full p-1 text-white/60 hover:text-white"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
