"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { EventSummary } from "@/types/event";
import { formatScheduleTimeLabel } from "@/app/(main)/events/date-formatting";
import styles from "@/app/(main)/events/schedule.module.css";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();

  const days: { date: Date; isCurrentMonth: boolean }[] = [];

  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, isCurrentMonth: false });
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }

  while (days.length % 7 !== 0 || days.length < 42) {
    const nextIdx = days.length - startDow - lastDay.getDate() + 1;
    days.push({ date: new Date(year, month + 1, nextIdx), isCurrentMonth: false });
  }

  return days;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isToday(d: Date): boolean {
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function ScheduleMonthView({
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
      {/* Weekday headers */}
      <div className={styles.weekdayRow}>
        {WEEKDAYS.map((name) => (
          <div key={name} className={styles.weekdayLabel}>
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={styles.calendarGrid}>
        {days.map((day, idx) => {
          const key = dateKey(day.date);
          const dayEvents = eventsByDate.get(key) ?? [];
          const today = isToday(day.date);

          return (
            <div
              key={idx}
              className={cn(
                styles.dayCell,
                !day.isCurrentMonth && styles.dayCellMuted,
                today && styles.dayCellToday,
              )}
            >
              <div className={styles.dayCellHeader}>
                <span className={styles.dayNumber}>{day.date.getDate()}</span>
                {dayEvents.length > 0 && (
                  <span className={styles.dayCount}>{dayEvents.length}</span>
                )}
              </div>

              <div className={styles.dayAgenda}>
                {dayEvents.slice(0, 3).map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    className={styles.dayAgendaItem}
                    onClick={() => onEventClick(ev)}
                  >
                    <span className={styles.dayAgendaTime}>
                      {formatScheduleTimeLabel(ev.startAt)}
                    </span>
                    <span className={styles.dayAgendaTitle}>{ev.title}</span>
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <span className={styles.dayAgendaMore}>
                    +{dayEvents.length - 3}개 더
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
