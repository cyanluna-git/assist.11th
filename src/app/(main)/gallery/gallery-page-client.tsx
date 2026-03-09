"use client";

import { PhotoFeed } from "@/components/gallery/photo-feed";
import { UploadPhotosDialog } from "@/components/gallery/upload-photos-dialog";

export function GalleryPageClient() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-strong">갤러리</h1>
          <p className="mt-1 text-sm text-text-muted">
            ASSIST 11기 사진 갤러리
          </p>
        </div>
        <UploadPhotosDialog />
      </div>

      {/* Photo feed */}
      <PhotoFeed />
    </div>
  );
}
