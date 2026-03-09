"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { MapPin, Users } from "lucide-react";
import type { EventSummary, EventCategory } from "@/types/event";
import { CATEGORY_MAP } from "@/types/event";

const CATEGORY_BORDER: Record<EventCategory, string> = {
  class: "border-l-blue-400",
  meetup: "border-l-green-400",
  mt: "border-l-orange-400",
  dinner: "border-l-pink-400",
  study: "border-l-purple-400",
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function CalendarWeekView({
  events,
  onEventClick,
}: {
  events: EventSummary[];
  onEventClick: (event: EventSummary) => void;
}) {
  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, EventSummary[]>();
    for (const ev of events) {
      const d = new Date(ev.startAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [events]);

  if (grouped.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-text-muted">
        <p className="text-sm">이 기간에 일정이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map(([dateKey, dayEvents]) => {
        const today = isToday(dayEvents[0].startAt);
        return (
          <div key={dateKey}>
            <div
              className={cn(
                "mb-2 text-xs font-medium",
                today ? "text-brand" : "text-text-muted",
              )}
            >
              {today && (
                <span className="mr-1.5 rounded bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  TODAY
                </span>
              )}
              {formatDate(dayEvents[0].startAt)}
            </div>
            <div className="space-y-2">
              {dayEvents.map((ev, i) => {
                const cat = ev.category as EventCategory | null;
                const catInfo = cat ? CATEGORY_MAP[cat] : null;
                const borderClass =
                  cat && CATEGORY_BORDER[cat]
                    ? CATEGORY_BORDER[cat]
                    : "border-l-gray-300";
                const totalRsvp =
                  Number(ev.rsvpAttending) +
                  Number(ev.rsvpMaybe) +
                  Number(ev.rsvpDeclined);

                return (
                  <button
                    key={`${ev.id}-${i}`}
                    type="button"
                    onClick={() => onEventClick(ev)}
                    className={cn(
                      "w-full rounded-lg border border-l-4 bg-white p-3 text-left transition-colors hover:bg-muted/50",
                      borderClass,
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {catInfo && (
                            <span
                              className={cn(
                                "rounded-full px-1.5 py-px text-[10px] font-medium",
                                catInfo.bg,
                                catInfo.color,
                              )}
                            >
                              {catInfo.label}
                            </span>
                          )}
                          <span className="truncate text-sm font-medium text-text-strong">
                            {ev.title}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-text-muted">
                          <span>
                            {formatTime(ev.startAt)}
                            {ev.endAt && ` - ${formatTime(ev.endAt)}`}
                          </span>
                          {ev.location && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="size-3" />
                              {ev.location}
                            </span>
                          )}
                          {totalRsvp > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Users className="size-3" />
                              {ev.rsvpAttending}명 참석
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
