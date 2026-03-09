"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { EventSummary, EventCategory } from "@/types/event";
import { CATEGORY_MAP } from "@/types/event";
import {
  formatScheduleMonthLabel,
  formatScheduleDayLabel,
  formatScheduleTimeLabel,
} from "@/app/(main)/events/date-formatting";
import styles from "@/app/(main)/events/schedule.module.css";

const CATEGORY_CHIP_MAP: Record<string, string> = {
  class: styles.classChip,
  meetup: styles.meetupChip,
  mt: styles.mtChip,
  dinner: styles.dinnerChip,
  study: styles.studyChip,
};

function dateGroupKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ScheduleChronology({
  year,
  month,
  events,
  onSwitchToList,
  onEventClick,
}: {
  year: number;
  month: number;
  events: EventSummary[];
  onSwitchToList: () => void;
  onEventClick: (event: EventSummary) => void;
}) {
  const monthDate = useMemo(() => new Date(year, month, 1), [year, month]);

  // Filter to only this month's events and group by date
  const groups = useMemo(() => {
    const monthEvents = events.filter((ev) => {
      const d = new Date(ev.startAt);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const map = new Map<string, EventSummary[]>();
    for (const ev of monthEvents) {
      const key = dateGroupKey(ev.startAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, evs]) => ({
        date: new Date(evs[0].startAt),
        events: evs.sort(
          (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
        ),
      }));
  }, [events, year, month]);

  return (
    <div className={cn("rounded-lg border bg-white", styles.chronologyPanel)}>
      <div className={styles.chronologyHeader}>
        <div>
          <p className={styles.chronologyKicker}>Monthly Chronicle</p>
          <h2 className={styles.chronologyTitle}>
            {formatScheduleMonthLabel(monthDate)}
          </h2>
        </div>
        <button
          type="button"
          className={styles.detailLink}
          onClick={onSwitchToList}
        >
          리스트에서 보기 &rarr;
        </button>
      </div>

      {groups.length === 0 ? (
        <div className={styles.emptyMonth}>이번 달에 등록된 일정이 없습니다</div>
      ) : (
        <div className={styles.chronologyGroups}>
          {groups.map((group) => (
            <div key={group.date.toISOString()} className={styles.chronologyGroup}>
              <div className={styles.chronologyDate}>
                {formatScheduleDayLabel(group.date)}
              </div>
              <div className={styles.chronologyEntries}>
                {group.events.map((ev) => {
                  const cat = ev.category as EventCategory | null;
                  const catInfo = cat ? CATEGORY_MAP[cat] : null;
                  const chipClass = cat ? CATEGORY_CHIP_MAP[cat] : null;

                  return (
                    <div key={ev.id} className={styles.chronologyEntry}>
                      <div className={styles.chronologyMeta}>
                        <span className={styles.chronologyTime}>
                          {formatScheduleTimeLabel(ev.startAt)}
                          {ev.endAt && ` ~ ${formatScheduleTimeLabel(ev.endAt)}`}
                        </span>
                        {catInfo && chipClass && (
                          <span className={cn(styles.sourceChip, chipClass)}>
                            {catInfo.label}
                          </span>
                        )}
                      </div>
                      <h4 className={styles.chronologyEntryTitle}>{ev.title}</h4>
                      {ev.description && (
                        <p className={styles.chronologyEntryText}>
                          {ev.description}
                        </p>
                      )}
                      <button
                        type="button"
                        className={styles.detailLink}
                        onClick={() => onEventClick(ev)}
                      >
                        자세히 보기 &rarr;
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
