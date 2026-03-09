"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RegisterSW() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setUpdateAvailable(true);
            }
          });
        });
      })
      .catch(() => {});
  }, []);

  if (!updateAvailable) return null;

  return (
    <div className="fixed inset-x-4 top-4 z-50 flex items-center gap-3 rounded-xl bg-card p-3 shadow-lg ring-1 ring-foreground/10 md:inset-x-auto md:right-4 md:left-auto md:w-80">
      <RefreshCw className="size-4 shrink-0 text-brand" />
      <p className="flex-1 text-sm text-text-main">새 버전이 있습니다</p>
      <Button
        size="xs"
        onClick={() => window.location.reload()}
      >
        업데이트
      </Button>
    </div>
  );
}
