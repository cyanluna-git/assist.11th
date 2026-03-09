import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Photo, PhotoDetail, PhotoComment } from "@/types/gallery";
import { useState } from "react";

// ════════════════════════════════════════════════════════
// Photo-centric hooks
// ════════════════════════════════════════════════════════

// ── List Photos (paginated) ──

export function usePhotos(limit = 20, offset = 0) {
  return useQuery<PhotoDetail[]>({
    queryKey: ["photos", limit, offset],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });
      const res = await fetch(`/api/photos?${params}`);
      if (!res.ok) throw new Error("Failed to fetch photos");
      const data = await res.json();
      return data.photos;
    },
  });
}

// ── Single Photo ──

export function usePhoto(id: string) {
  return useQuery<PhotoDetail>({
    queryKey: ["photo", id],
    queryFn: async () => {
      const res = await fetch(`/api/photos/${id}`);
      if (!res.ok) throw new Error("Failed to fetch photo");
      const data = await res.json();
      return data.photo;
    },
    enabled: !!id,
  });
}

// ── Upload Photos (standalone, XMLHttpRequest for progress) ──

interface UploadPayload {
  files: File[];
  captions?: Record<string, string>; // filename -> caption
}

export function useUploadPhotosStandalone(albumId?: string) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async (payload: UploadPayload) => {
      return new Promise<{ photos: Photo[]; errors?: string[] }>(
        (resolve, reject) => {
          const formData = new FormData();
          payload.files.forEach((file) => formData.append("files", file));
          if (albumId) {
            formData.append("albumId", albumId);
          }
          // Append per-file captions
          if (payload.captions) {
            for (const [filename, caption] of Object.entries(
              payload.captions,
            )) {
              if (caption.trim()) {
                formData.append(`caption_${filename}`, caption.trim());
              }
            }
          }

          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/photos");

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status === 201) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              try {
                const data = JSON.parse(xhr.responseText);
                reject(new Error(data.error || "Upload failed"));
              } catch {
                reject(new Error("Upload failed"));
              }
            }
          });

          xhr.addEventListener("error", () =>
            reject(new Error("Upload failed")),
          );
          xhr.send(formData);
        },
      );
    },
    onSuccess: () => {
      setProgress(0);
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      if (albumId) {
        queryClient.invalidateQueries({ queryKey: ["album", albumId] });
        queryClient.invalidateQueries({ queryKey: ["albums"] });
      }
    },
    onError: () => {
      setProgress(0);
    },
  });

  return { ...mutation, progress };
}

// ── Delete Photo (standalone) ──

export function useDeletePhotoStandalone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoId: string) => {
      const res = await fetch(`/api/photos/${photoId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete photo");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
}

// ── Update Photo ──

export function useUpdatePhoto(photoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { caption?: string | null }) => {
      const res = await fetch(`/api/photos/${photoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update photo");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photo", photoId] });
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
}

// ── Photo Comments ──

export function usePhotoComments(photoId: string) {
  return useQuery<PhotoComment[]>({
    queryKey: ["photo-comments", photoId],
    queryFn: async () => {
      const res = await fetch(`/api/photos/${photoId}/comments`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      return data.comments;
    },
    enabled: !!photoId,
  });
}

// ── Create Photo Comment ──

export function useCreatePhotoComment(photoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      content: string;
      parentId?: string | null;
    }) => {
      const res = await fetch(`/api/photos/${photoId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create comment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["photo-comments", photoId],
      });
      queryClient.invalidateQueries({ queryKey: ["photo", photoId] });
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
}
