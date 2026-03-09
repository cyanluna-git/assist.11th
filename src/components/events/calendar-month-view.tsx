"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { EventSummary } from "@/types/event";
import { EventCard } from "./event-card";

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay(); // 0=Sun

  const days: { date: Date; isCurrentMonth: boolean }[] = [];

  // Previous month padding
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, isCurrentMonth: false });
  }

  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }

  // Next month padding (fill to complete week rows)
  while (days.length % 7 !== 0) {
    const d = new Date(year, month + 1, days.length - startDow - lastDay.getDate() + 1);
    days.push({ date: d, isCurrentMonth: false });
  }

  return days;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isToday(d: Date): boolean {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
}

export function CalendarMonthView({
  year,
  month,
  events,
  onEventClick,
}: {
  year: number;
  month: number;
  events: EventSummary[];
  onEventClick: (event: EventSummary) => void;
}) {
  const days = useMemo(() => getMonthGrid(year, month), [year, month]);

  // Group events by date key
  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventSummary[]>();
    for (const ev of events) {
      const key = dateKey(new Date(ev.startAt));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [events]);

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b">
        {DAY_NAMES.map((name, i) => (
          <div
            key={name}
            className={cn(
              "py-2 text-center text-xs font-medium text-text-muted",
              i === 0 && "text-red-400",
              i === 6 && "text-blue-400",
            )}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const key = dateKey(day.date);
          const dayEvents = eventsByDate.get(key) ?? [];
          const dow = day.date.getDay();
          const today = isToday(day.date);

          return (
            <div
              key={idx}
              className={cn(
                "min-h-[80px] border-b border-r p-1 sm:min-h-[100px]",
                idx % 7 === 0 && "border-l",
                !day.isCurrentMonth && "bg-muted/30",
              )}
            >
              <div
                className={cn(
                  "mb-0.5 text-xs font-medium",
                  !day.isCurrentMonth && "text-text-muted/40",
                  day.isCurrentMonth && dow === 0 && "text-red-400",
                  day.isCurrentMonth && dow === 6 && "text-blue-400",
                  day.isCurrentMonth && dow > 0 && dow < 6 && "text-text-muted",
                  today &&
                    "inline-flex size-5 items-center justify-center rounded-full bg-brand text-white",
                )}
              >
                {day.date.getDate()}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((ev, i) => (
                  <EventCard
                    key={`${ev.id}-${i}`}
                    event={ev}
                    onClick={() => onEventClick(ev)}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-center text-[10px] text-text-muted">
                    +{dayEvents.length - 3}개
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
