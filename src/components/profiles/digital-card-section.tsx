"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DigitalCard } from "./digital-card";
import type { ProfileDetail } from "@/types/profile";

export function DigitalCardSection({ profile }: { profile: ProfileDetail }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://assist11th.vercel.app";

  async function handleDownload() {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `${profile.name ?? "profile"}-card.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("PNG download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text-strong">디지털 명함</h3>
      <div className="overflow-x-auto pb-1">
        <DigitalCard ref={cardRef} profile={profile} baseUrl={baseUrl} />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">
          QR 코드 스캔 시 프로필 페이지로 이동합니다
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          <Download className="size-3.5" />
          {isDownloading ? "저장 중..." : "PNG 저장"}
        </Button>
      </div>
    </div>
  );
}
