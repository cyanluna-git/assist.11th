"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Pencil,
  Check,
  Reply,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePhoto,
  useUpdatePhoto,
  useDeletePhotoStandalone,
  usePhotoComments,
  useCreatePhotoComment,
} from "@/hooks/use-gallery";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { PhotoComment } from "@/types/gallery";

interface PhotoLightboxProps {
  photoId: string;
  currentUserId?: string;
  currentUserRole?: string;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onDeleted: () => void;
}

export function PhotoLightbox({
  photoId,
  currentUserId,
  currentUserRole,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
  onDeleted,
}: PhotoLightboxProps) {
  const { data: photo, isLoading: photoLoading } = usePhoto(photoId);
  const updatePhoto = useUpdatePhoto(photoId);
  const deletePhoto = useDeletePhotoStandalone();
  const { data: comments, isLoading: commentsLoading } =
    usePhotoComments(photoId);
  const createComment = useCreatePhotoComment(photoId);

  const [editingCaption, setEditingCaption] = useState(false);
  const [captionValue, setCaptionValue] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const isOwner = currentUserId === photo?.uploaderId;
  const isAdmin = currentUserRole === "admin";
  const canManage = isOwner || isAdmin;

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (editingCaption) return; // Don't navigate while editing
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (hasPrev) onPrev();
          break;
        case "ArrowRight":
          if (hasNext) onNext();
          break;
      }
    },
    [onClose, hasPrev, hasNext, onPrev, onNext, editingCaption],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Reset editing state when photo changes
  useEffect(() => {
    setEditingCaption(false);
  }, [photoId]);

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && hasPrev) onPrev();
      else if (diff < 0 && hasNext) onNext();
    }
    setTouchStart(null);
  };

  // Backdrop click to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Caption editing
  const startEditCaption = () => {
    setCaptionValue(photo?.caption ?? "");
    setEditingCaption(true);
  };

  const saveCaption = () => {
    const trimmed = captionValue.trim();
    updatePhoto.mutate(
      { caption: trimmed || null },
      { onSuccess: () => setEditingCaption(false) },
    );
  };

  // Delete
  const handleDelete = () => {
    if (!confirm("이 사진을 삭제하시겠습니까?")) return;
    deletePhoto.mutate(photoId, { onSuccess: onDeleted });
  };

  // Comment submit
  const handleCommentSubmit = () => {
    if (!commentContent.trim()) return;
    createComment.mutate(
      { content: commentContent.trim() },
      { onSuccess: () => setCommentContent("") },
    );
  };

  // Build threaded comments
  const topLevel = (comments ?? []).filter((c) => !c.parentId);
  const repliesMap = (comments ?? []).reduce<Record<string, PhotoComment[]>>(
    (acc, c) => {
      if (c.parentId) {
        if (!acc[c.parentId]) acc[c.parentId] = [];
        acc[c.parentId].push(c);
      }
      return acc;
    },
    {},
  );

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex bg-black/95"
      onClick={handleBackdropClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Image area ── */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            {canManage && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-white/70 hover:bg-white/10 hover:text-white"
                onClick={handleDelete}
                disabled={deletePhoto.isPending}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Comments toggle (mobile) */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
              onClick={() => setShowComments((v) => !v)}
            >
              <MessageCircle className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-white/70 hover:bg-white/10 hover:text-white"
              onClick={onClose}
            >
              <X className="size-5" />
            </Button>
          </div>
        </div>

        {/* Image */}
        {photoLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Skeleton className="h-64 w-64 rounded-lg bg-white/10" />
          </div>
        ) : photo ? (
          <div className="relative flex flex-1 items-center justify-center px-12 py-16">
            <Image
              src={photo.imageUrl}
              alt={photo.caption || "사진"}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 70vw"
              priority
            />
          </div>
        ) : null}

        {/* Caption (below image area) */}
        {photo && (
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 to-transparent px-4 pt-10 pb-4">
            {editingCaption ? (
              <div className="mx-auto flex max-w-md items-center gap-2">
                <Input
                  value={captionValue}
                  onChange={(e) => setCaptionValue(e.target.value)}
                  placeholder="캡션을 입력하세요..."
                  className="border-white/30 bg-white/10 text-sm text-white placeholder:text-white/50"
                  maxLength={500}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveCaption();
                    if (e.key === "Escape") setEditingCaption(false);
                  }}
                  autoFocus
                />
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  onClick={saveCaption}
                  disabled={updatePhoto.isPending}
                >
                  <Check className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                {photo.caption ? (
                  <p className="text-center text-sm text-white">
                    {photo.caption}
                  </p>
                ) : canManage ? (
                  <p className="text-center text-xs text-white/50">
                    캡션 없음
                  </p>
                ) : null}
                {canManage && (
                  <button
                    type="button"
                    onClick={startEditCaption}
                    className="rounded p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Pencil className="size-3" />
                  </button>
                )}
              </div>
            )}
            {photo.uploaderName && (
              <p className="mt-1 text-center text-xs text-white/50">
                {photo.uploaderName}
              </p>
            )}
          </div>
        )}

        {/* Navigation arrows */}
        {hasPrev && (
          <button
            type="button"
            className="absolute left-2 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
            onClick={onPrev}
          >
            <ChevronLeft className="size-6" />
          </button>
        )}
        {hasNext && (
          <button
            type="button"
            className="absolute right-2 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
            onClick={onNext}
          >
            <ChevronRight className="size-6" />
          </button>
        )}
      </div>

      {/* ── Comments panel ── */}
      <div
        className={cn(
          "flex w-80 shrink-0 flex-col border-l border-white/10 bg-white",
          // Mobile: overlay from bottom, toggle with button
          "max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-30 max-lg:w-full max-lg:rounded-t-xl max-lg:border-l-0 max-lg:border-t",
          !showComments && "max-lg:hidden",
        )}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold text-text-strong">
            댓글 {comments ? `(${comments.length})` : ""}
          </h3>
          <button
            type="button"
            className="rounded p-1 text-text-muted hover:bg-muted lg:hidden"
            onClick={() => setShowComments(false)}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {commentsLoading && (
            <div className="py-4 text-center text-xs text-text-muted">
              댓글을 불러오는 중...
            </div>
          )}

          {!commentsLoading && topLevel.length === 0 && (
            <div className="py-4 text-center text-xs text-text-muted">
              아직 댓글이 없습니다.
            </div>
          )}

          {topLevel.length > 0 && (
            <div className="divide-y divide-foreground/5">
              {topLevel.map((comment) => (
                <div key={comment.id}>
                  <PhotoCommentItem
                    comment={comment}
                    photoId={photoId}
                  />
                  {repliesMap[comment.id]?.map((reply) => (
                    <PhotoCommentItem
                      key={reply.id}
                      comment={reply}
                      photoId={photoId}
                      isReply
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment input */}
        <div className="border-t px-4 py-3">
          <div className="space-y-2">
            <Textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="min-h-[50px] text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleCommentSubmit();
                }
              }}
            />
            <div className="flex justify-end">
              <Button
                size="xs"
                onClick={handleCommentSubmit}
                disabled={!commentContent.trim() || createComment.isPending}
              >
                댓글 작성
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Inline comment item ──

function PhotoCommentItem({
  comment,
  photoId,
  isReply = false,
}: {
  comment: PhotoComment;
  photoId: string;
  isReply?: boolean;
}) {
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const createComment = useCreatePhotoComment(photoId);

  const handleReply = () => {
    if (!replyContent.trim()) return;
    createComment.mutate(
      { content: replyContent.trim(), parentId: comment.id },
      {
        onSuccess: () => {
          setReplyContent("");
          setReplying(false);
        },
      },
    );
  };

  return (
    <div
      className={cn("py-2", isReply && "ml-6 border-l-2 border-muted pl-2")}
    >
      <div className="flex items-start gap-2">
        <Avatar
          src={comment.authorAvatar}
          name={comment.authorName || "?"}
          size="sm"
          className="mt-0.5 size-6 text-[10px]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-medium text-text-strong">
              {comment.authorName || "알 수 없음"}
            </span>
            <span className="text-text-muted">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="mt-0.5 whitespace-pre-wrap text-xs text-text-strong">
            {comment.content}
          </p>
          {!isReply && (
            <button
              type="button"
              onClick={() => setReplying(!replying)}
              className="mt-1 flex items-center gap-1 text-[10px] text-text-muted hover:text-text-strong"
            >
              <Reply className="size-2.5" />
              답글
            </button>
          )}
        </div>
      </div>

      {replying && (
        <div className="ml-8 mt-2 space-y-1.5">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="답글을 입력하세요..."
            className="min-h-[40px] text-xs"
          />
          <div className="flex gap-1.5">
            <Button
              size="xs"
              onClick={handleReply}
              disabled={!replyContent.trim() || createComment.isPending}
            >
              답글 작성
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => {
                setReplying(false);
                setReplyContent("");
              }}
            >
              취소
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
