"use client";

import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRsvp, useRemoveRsvp, useDeleteEvent, useUpdateEvent } from "@/hooks/use-events";
import { CATEGORY_MAP } from "@/types/event";
import type { EventSummary, EventCategory, RsvpStatus } from "@/types/event";
import {
  formatScheduleDateTime,
  formatScheduleTimeLabel,
  toDateTimeLocalValue,
} from "@/app/(main)/events/date-formatting";
import styles from "@/app/(main)/events/schedule.module.css";

const CATEGORY_CHIP_MAP: Record<string, string> = {
  class: styles.classChip,
  meetup: styles.meetupChip,
  mt: styles.mtChip,
  dinner: styles.dinnerChip,
  study: styles.studyChip,
};

const CATEGORY_ICON_COLORS: Record<string, string> = {
  class: "#3b82f6",
  meetup: "#22c55e",
  mt: "#f97316",
  dinner: "#ec4899",
  study: "#a855f7",
};

const RSVP_BADGE_MAP: Record<string, string> = {
  attending: styles.attending,
  maybe: styles.maybe,
  declined: styles.declined,
};

const RSVP_LABELS: Record<RsvpStatus, string> = {
  attending: "참석",
  maybe: "미정",
  declined: "불참",
};

function RsvpBadge({ status }: { status: RsvpStatus | null }) {
  if (!status) {
    return (
      <span className={cn(styles.badge, styles.noRsvp)}>미응답</span>
    );
  }
  return (
    <span className={cn(styles.badge, RSVP_BADGE_MAP[status])}>
      {RSVP_LABELS[status]}
    </span>
  );
}

function InlineRsvpButtons({
  eventId,
  currentStatus,
}: {
  eventId: string;
  currentStatus: RsvpStatus | null;
}) {
  const rsvp = useRsvp(eventId);
  const removeRsvp = useRemoveRsvp(eventId);
  const isPending = rsvp.isPending || removeRsvp.isPending;

  const handleClick = (status: RsvpStatus) => {
    if (isPending) return;
    if (currentStatus === status) {
      removeRsvp.mutate();
    } else {
      rsvp.mutate(status);
    }
  };

  return (
    <div className={styles.rsvpRow}>
      {(["attending", "maybe", "declined"] as RsvpStatus[]).map((s) => (
        <button
          key={s}
          type="button"
          className={cn(styles.rsvpBtn, currentStatus === s && styles.rsvpBtnActive)}
          disabled={isPending}
          onClick={() => handleClick(s)}
        >
          {RSVP_LABELS[s]}
        </button>
      ))}
    </div>
  );
}

function InlineEditor({
  event,
  onClose,
}: {
  event: EventSummary;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(event.title);
  const [startAt, setStartAt] = useState(toDateTimeLocalValue(event.startAt));
  const [endAt, setEndAt] = useState(toDateTimeLocalValue(event.endAt));
  const [category, setCategory] = useState(event.category ?? "");
  const [location, setLocation] = useState(event.location ?? "");
  const [description, setDescription] = useState(event.description ?? "");
  const updateEvent = useUpdateEvent(event.id);

  const handleSave = () => {
    if (!title.trim() || !startAt) return;
    updateEvent.mutate(
      {
        title: title.trim(),
        startAt: new Date(startAt).toISOString(),
        endAt: endAt ? new Date(endAt).toISOString() : null,
        category: category || null,
        location: location.trim() || null,
        description: description.trim() || null,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <div className={styles.inlineEditor}>
      <div className={styles.formRow}>
        <div className={styles.field}>
          <label className={styles.label}>제목</label>
          <input
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>카테고리</label>
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">선택 안 함</option>
            <option value="class">수업</option>
            <option value="meetup">모임</option>
            <option value="mt">MT</option>
            <option value="dinner">회식</option>
            <option value="study">스터디</option>
          </select>
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.field}>
          <label className={styles.label}>시작</label>
          <input
            className={styles.input}
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>종료</label>
          <input
            className={styles.input}
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
          />
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>장소</label>
        <input
          className={styles.input}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>설명</label>
        <textarea
          className={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className={styles.inlineEditorActions}>
        <button
          type="button"
          className={styles.addBtn}
          disabled={updateEvent.isPending || !title.trim() || !startAt}
          onClick={handleSave}
        >
          {updateEvent.isPending ? "저장 중..." : "저장"}
        </button>
        <button type="button" className={styles.secondaryButton} onClick={onClose}>
          취소
        </button>
      </div>
    </div>
  );
}

export function ScheduleList({
  events,
  currentUserId,
  isAdmin,
  onEventClick,
}: {
  events: EventSummary[];
  currentUserId: string | undefined;
  isAdmin: boolean;
  onEventClick: (event: EventSummary) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const deleteEvent = useDeleteEvent();

  if (events.length === 0) {
    return <div className={styles.empty}>해당 조건에 맞는 일정이 없습니다</div>;
  }

  const handleDelete = (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    deleteEvent.mutate(id, {
      onSuccess: () => setConfirmDeleteId(null),
    });
  };

  return (
    <div className={styles.list}>
      {events.map((ev) => {
        const cat = ev.category as EventCategory | null;
        const catInfo = cat ? CATEGORY_MAP[cat] : null;
        const chipClass = cat ? CATEGORY_CHIP_MAP[cat] : null;
        const iconColor = cat ? CATEGORY_ICON_COLORS[cat] : "#94a3b8";
        const isOwner = currentUserId && (ev.creatorId === currentUserId || isAdmin);

        return (
          <article
            key={ev.id}
            className={cn("rounded-lg border bg-white", styles.cardItem)}
          >
            {/* Icon */}
            <div
              className={styles.iconWrap}
              style={{ borderColor: iconColor + "33", background: iconColor + "0d" }}
            >
              <CalendarDays size={16} style={{ color: iconColor }} />
            </div>

            {/* Content */}
            <div className={styles.content}>
              <div className={styles.titleRow}>
                <h3 className={styles.title} onClick={() => onEventClick(ev)}>
                  {ev.title}
                </h3>
                {catInfo && chipClass && (
                  <span className={cn(styles.sourceChip, chipClass)}>
                    {catInfo.label}
                  </span>
                )}
                <RsvpBadge status={ev.myRsvp} />
              </div>

              <p className={styles.meta}>
                {formatScheduleDateTime(ev.startAt)}
                {ev.endAt && ` ~ ${formatScheduleTimeLabel(ev.endAt)}`}
                {ev.location && ` \u00B7 ${ev.location}`}
              </p>

              {ev.description && (
                <p className={styles.description}>{ev.description}</p>
              )}

              <InlineRsvpButtons eventId={ev.id} currentStatus={ev.myRsvp} />

              {isOwner && editingId !== ev.id && (
                <div className={styles.manualActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setEditingId(ev.id)}
                  >
                    <Pencil size={13} />
                    수정
                  </button>
                  <button
                    type="button"
                    className={cn(styles.secondaryButton, styles.deleteButton)}
                    onClick={() => handleDelete(ev.id)}
                    disabled={deleteEvent.isPending}
                  >
                    <Trash2 size={13} />
                    {confirmDeleteId === ev.id ? "정말 삭제?" : "삭제"}
                  </button>
                </div>
              )}

              {editingId === ev.id && (
                <InlineEditor event={ev} onClose={() => setEditingId(null)} />
              )}
            </div>

            {/* RSVP count badge */}
            <RsvpBadge status={ev.myRsvp} />
          </article>
        );
      })}
    </div>
  );
}
