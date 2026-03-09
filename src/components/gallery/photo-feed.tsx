"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhotoFeedSkeleton } from "./photo-feed-skeleton";
import { PhotoLightbox } from "./photo-lightbox";
import { usePhotos } from "@/hooks/use-gallery";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { PhotoDetail } from "@/types/gallery";

const PAGE_SIZE = 40;

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"] as const;

function formatDateHeading(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const dayName = DAY_NAMES[d.getDay()];
  return `${year}년 ${month}월 ${day}일 (${dayName})`;
}

function getDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface DateGroup {
  key: string;
  label: string;
  photos: PhotoDetail[];
}

export function PhotoFeed() {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const { data: photos, isLoading, isError } = usePhotos(limit);
  const { data: currentUser } = useCurrentUser();
  const [lightboxPhotoId, setLightboxPhotoId] = useState<string | null>(null);

  const allPhotos = photos ?? [];
  const hasMore = allPhotos.length >= limit;

  // Group photos by date
  const groups: DateGroup[] = useMemo(() => {
    const map = new Map<string, DateGroup>();
    for (const photo of allPhotos) {
      const key = getDateKey(photo.createdAt);
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: formatDateHeading(photo.createdAt),
          photos: [],
        });
      }
      map.get(key)!.photos.push(photo);
    }
    return Array.from(map.values());
  }, [allPhotos]);

  // Lightbox navigation
  const lightboxIndex = useMemo(
    () =>
      lightboxPhotoId
        ? allPhotos.findIndex((p) => p.id === lightboxPhotoId)
        : -1,
    [lightboxPhotoId, allPhotos],
  );

  const handleLightboxNav = useCallback(
    (direction: "prev" | "next") => {
      if (lightboxIndex < 0) return;
      const nextIdx =
        direction === "prev" ? lightboxIndex - 1 : lightboxIndex + 1;
      if (nextIdx >= 0 && nextIdx < allPhotos.length) {
        setLightboxPhotoId(allPhotos[nextIdx].id);
      }
    },
    [lightboxIndex, allPhotos],
  );

  if (isLoading) return <PhotoFeedSkeleton />;

  if (isError) {
    return (
      <div className="rounded-lg border border-error/20 bg-error/5 p-4 text-center text-sm text-error">
        사진을 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  if (allPhotos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg bg-muted p-12 text-center">
        <div className="size-10 text-text-muted opacity-40">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-text-muted">
            아직 사진이 없습니다
          </p>
          <p className="mt-1 text-xs text-text-muted">
            첫 번째 사진을 올려보세요!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {groups.map((group) => (
          <section key={group.key}>
            {/* Date heading */}
            <h2 className="mb-3 text-sm font-semibold text-text-strong">
              {group.label}
            </h2>

            {/* Masonry grid */}
            <div className="columns-2 gap-2 sm:columns-3 lg:columns-4">
              {group.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group mb-2 cursor-pointer break-inside-avoid overflow-hidden rounded-lg"
                  onClick={() => setLightboxPhotoId(photo.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      setLightboxPhotoId(photo.id);
                  }}
                >
                  <div className="relative">
                    <Image
                      src={photo.thumbnailUrl || photo.imageUrl}
                      alt={photo.caption || "사진"}
                      width={400}
                      height={300}
                      className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                    {/* Overlay info */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      {photo.caption && (
                        <p className="truncate text-xs text-white">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                    {/* Comment count badge */}
                    {photo.commentCount > 0 && (
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded-full bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                        <MessageCircle className="size-2.5" />
                        {photo.commentCount}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Load more */}
        {hasMore && (
          <div className="pt-2 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLimit((prev) => prev + PAGE_SIZE)}
            >
              더 보기
            </Button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxPhotoId && lightboxIndex >= 0 && (
        <PhotoLightbox
          photoId={lightboxPhotoId}
          currentUserId={currentUser?.id}
          currentUserRole={currentUser?.role}
          hasPrev={lightboxIndex > 0}
          hasNext={lightboxIndex < allPhotos.length - 1}
          onPrev={() => handleLightboxNav("prev")}
          onNext={() => handleLightboxNav("next")}
          onClose={() => setLightboxPhotoId(null)}
          onDeleted={() => setLightboxPhotoId(null)}
        />
      )}
    </>
  );
}
