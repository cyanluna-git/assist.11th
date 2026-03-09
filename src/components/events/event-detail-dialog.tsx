"use client";

import { useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useEvent, useDeleteEvent } from "@/hooks/use-events";
import { useCurrentUser } from "@/hooks/use-current-user";
import { CATEGORY_MAP } from "@/types/event";
import type { EventSummary, EventCategory } from "@/types/event";
import { RsvpButtons } from "./rsvp-buttons";
import { RsvpAvatars } from "./rsvp-avatars";
import { EventFormDialog } from "./event-form-dialog";
import { cn } from "@/lib/utils";

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimeOnly(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EventDetailDialog({
  event,
  open,
  onOpenChange,
}: {
  event: EventSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: currentUser } = useCurrentUser();
  const { data: detail } = useEvent(event?.id ?? "");
  const deleteEvent = useDeleteEvent();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!event) return null;

  const cat = event.category as EventCategory | null;
  const catInfo = cat ? CATEGORY_MAP[cat] : null;
  const isOwnerOrAdmin =
    currentUser &&
    (currentUser.id === event.creatorId || currentUser.role === "admin");
  const rsvps = detail?.rsvps ?? [];

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteEvent.mutate(event.id, {
      onSuccess: () => {
        onOpenChange(false);
        setConfirmDelete(false);
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) setConfirmDelete(false);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {catInfo && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-medium",
                  catInfo.bg,
                  catInfo.color,
                )}
              >
                {catInfo.label}
              </span>
            )}
            <span>{event.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          {/* Date/Time */}
          <div className="flex items-start gap-2 text-text-muted">
            <CalendarDays className="mt-0.5 size-4 shrink-0" />
            <div>
              <p>{formatDateTime(event.startAt)}</p>
              {event.endAt && (
                <p className="flex items-center gap-1">
                  <Clock className="size-3" />
                  ~ {formatTimeOnly(event.endAt)}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-text-muted">
              <MapPin className="size-4 shrink-0" />
              <span>{event.location}</span>
            </div>
          )}

          {/* Creator */}
          <div className="flex items-center gap-2 text-text-muted">
            <User className="size-4 shrink-0" />
            <span>{event.creatorName ?? "알 수 없음"}</span>
          </div>

          {/* Description */}
          {event.description && (
            <div className="rounded-lg bg-muted/50 p-3 text-text-muted whitespace-pre-wrap">
              {event.description}
            </div>
          )}

          {/* RSVP */}
          <div className="space-y-2 border-t pt-3">
            <p className="text-xs font-medium text-text-muted">참석 여부</p>
            <RsvpButtons eventId={event.id} currentStatus={event.myRsvp} />
          </div>

          {/* RSVP Avatars */}
          <div className="space-y-2 border-t pt-3">
            <p className="text-xs font-medium text-text-muted">응답 현황</p>
            <RsvpAvatars rsvps={rsvps} />
          </div>
        </div>

        <DialogFooter>
          {isOwnerOrAdmin && (
            <div className="flex w-full gap-2 sm:w-auto">
              <EventFormDialog mode="edit" event={event} />
              <Button
                size="xs"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteEvent.isPending}
              >
                <Trash2 data-icon="inline-start" className="size-3" />
                {confirmDelete ? "정말 삭제?" : "삭제"}
              </Button>
            </div>
          )}
          <DialogClose render={<Button variant="outline" size="sm" />}>
            닫기
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
