"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
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

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ScheduleWidget() {
  const now = new Date();
  const from = now.toISOString();
  const to = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
  ).toISOString();

  const { data: events, isLoading } = useEvents(from, to);
  const upcoming = (events ?? []).slice(0, 5);

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
            <p className="text-sm">등록된 일정이 없습니다</p>
          </div>
        )}

        {!isLoading && upcoming.length > 0 && (
          <div className="space-y-3">
            {upcoming.map((ev) => {
              const cat = ev.category as EventCategory | null;
              const catInfo = cat ? CATEGORY_MAP[cat] : null;

              return (
                <Link
                  key={ev.id}
                  href="/events"
                  className="group flex items-start gap-3 rounded-lg p-1.5 transition-colors hover:bg-muted/50"
                >
                  {/* Date badge */}
                  <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-muted text-center">
                    <span className="text-[10px] leading-none text-text-muted">
                      {new Date(ev.startAt).toLocaleDateString("ko-KR", {
                        month: "short",
                      })}
                    </span>
                    <span className="text-sm font-semibold leading-tight text-text-strong">
                      {new Date(ev.startAt).getDate()}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {catInfo && (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-px text-[9px] font-medium",
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
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-text-muted">
                      <span>{formatTime(ev.startAt)}</span>
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
