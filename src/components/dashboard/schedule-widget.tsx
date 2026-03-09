"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, MapPin, Clock } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { useEvents } from "@/hooks/use-events";
import { CATEGORY_MAP } from "@/types/event";
import type { EventCategory } from "@/types/event";
import { cn } from "@/lib/utils";

function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const period = h < 12 ? "오전" : "오후";
  const hour = h % 12 || 12;
  return `${period} ${hour}:${m}`;
}

function formatEndTime(iso: string): string {
  return formatTime(iso);
}

function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${month}/${day} (${weekday})`;
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

function isTomorrow(iso: string): boolean {
  const d = new Date(iso);
  const tmr = new Date();
  tmr.setDate(tmr.getDate() + 1);
  return (
    d.getFullYear() === tmr.getFullYear() &&
    d.getMonth() === tmr.getMonth() &&
    d.getDate() === tmr.getDate()
  );
}

function getDayTag(iso: string): string | null {
  if (isToday(iso)) return "오늘";
  if (isTomorrow(iso)) return "내일";
  return null;
}

export function ScheduleWidget() {
  const now = useMemo(() => new Date(), []);
  const from = useMemo(() => now.toISOString(), [now]);
  const to = useMemo(
    () =>
      new Date(
        now.getFullYear(),
        now.getMonth() + 2,
        0,
      ).toISOString(),
    [now],
  );

  const { data: events, isLoading } = useEvents(from, to);

  const upcoming = useMemo(() => {
    if (!events) return [];
    return [...events]
      .filter((ev) => new Date(ev.startAt).getTime() >= now.getTime() - 86400000)
      .sort(
        (a, b) =>
          new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      )
      .slice(0, 5);
  }, [events, now]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>일정</CardTitle>
        <CardAction>
          <Link
            href="/events"
            className="flex items-center gap-0.5 text-xs text-text-muted transition-colors hover:text-brand"
          >
            전체보기
            <ChevronRight className="size-3.5" />
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <div className="size-5 animate-spin rounded-full border-2 border-muted border-t-brand" />
          </div>
        )}

        {!isLoading && upcoming.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-6 text-text-muted">
            <CalendarDays className="size-8 opacity-40" />
            <p className="text-sm">다가오는 일정이 없습니다</p>
          </div>
        )}

        {!isLoading && upcoming.length > 0 && (
          <div className="space-y-1">
            {upcoming.map((ev) => {
              const cat = ev.category as EventCategory | null;
              const catInfo = cat ? CATEGORY_MAP[cat] : null;
              const dayTag = getDayTag(ev.startAt);

              return (
                <Link
                  key={ev.id}
                  href="/events"
                  className="group flex items-start gap-3 rounded-lg px-1.5 py-2 transition-colors hover:bg-muted/50"
                >
                  {/* Date column */}
                  <div className="flex w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-muted py-1.5 text-center">
                    <span className="text-[10px] leading-none text-text-muted">
                      {formatDayLabel(ev.startAt).split(" ")[0]}
                    </span>
                    <span className="text-xs font-semibold leading-tight text-text-strong">
                      {formatDayLabel(ev.startAt).split(" ")[1]}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {catInfo && (
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-1.5 py-px text-[9px] font-medium",
                            catInfo.bg,
                            catInfo.color,
                          )}
                        >
                          {catInfo.label}
                        </span>
                      )}
                      <span className="truncate text-sm font-medium text-text-strong group-hover:text-brand">
                        {ev.title}
                      </span>
                      {dayTag && (
                        <span className="shrink-0 rounded-full bg-brand/10 px-1.5 py-px text-[9px] font-bold text-brand">
                          {dayTag}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-text-muted">
                      <span className="flex items-center gap-0.5">
                        <Clock className="size-2.5" />
                        {formatTime(ev.startAt)}
                        {ev.endAt && ` - ${formatEndTime(ev.endAt)}`}
                      </span>
                      {ev.location && (
                        <span className="flex items-center gap-0.5 truncate">
                          <MapPin className="size-2.5" />
                          {ev.location}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
