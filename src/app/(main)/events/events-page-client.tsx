"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, List, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/use-events";
import { EVENT_CATEGORIES } from "@/types/event";
import type { EventSummary, EventCategory } from "@/types/event";
import { CalendarMonthView } from "@/components/events/calendar-month-view";
import { CalendarWeekView } from "@/components/events/calendar-week-view";
import { EventFormDialog } from "@/components/events/event-form-dialog";
import { EventDetailDialog } from "@/components/events/event-detail-dialog";
import { cn } from "@/lib/utils";

type ViewMode = "month" | "week";

function getDateRange(year: number, month: number) {
  const from = new Date(year, month, 1);
  const to = new Date(year, month + 1, 0, 23, 59, 59);
  // Extend to include padding days (prev/next month)
  from.setDate(from.getDate() - from.getDay());
  to.setDate(to.getDate() + (6 - to.getDay()));
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

function getWeekRange(year: number, month: number) {
  // Get the current week within the month
  const now = new Date();
  const isCurrentMonth =
    now.getFullYear() === year && now.getMonth() === month;

  let weekStart: Date;
  if (isCurrentMonth) {
    weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
  } else {
    weekStart = new Date(year, month, 1);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  }

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59);

  return {
    from: weekStart.toISOString(),
    to: weekEnd.toISOString(),
  };
}

const MONTH_NAMES = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

export function EventsPageClient() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventSummary | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const range = useMemo(
    () =>
      viewMode === "month"
        ? getDateRange(year, month)
        : getWeekRange(year, month),
    [year, month, viewMode],
  );

  const { data: events, isLoading, isError } = useEvents(
    range.from,
    range.to,
    categoryFilter ?? undefined,
  );

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events;
  }, [events]);

  const handlePrev = useCallback(() => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }, [month]);

  const handleNext = useCallback(() => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }, [month]);

  const handleToday = useCallback(() => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  }, []);

  const handleEventClick = useCallback((event: EventSummary) => {
    setSelectedEvent(event);
    setDetailOpen(true);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-strong">일정</h1>
          <p className="mt-1 text-sm text-text-muted">
            ASSIST 11기 일정 관리
          </p>
        </div>
        <EventFormDialog />
      </div>

      {/* Controls bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" onClick={handlePrev}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            오늘
          </Button>
          <Button variant="outline" size="icon-sm" onClick={handleNext}>
            <ChevronRight className="size-4" />
          </Button>
          <span className="ml-1 text-sm font-medium text-text-strong">
            {year}년 {MONTH_NAMES[month]}
          </span>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-lg border p-0.5">
          <Button
            variant={viewMode === "month" ? "secondary" : "ghost"}
            size="xs"
            onClick={() => setViewMode("month")}
          >
            <CalendarDays className="mr-1 size-3.5" />
            월
          </Button>
          <Button
            variant={viewMode === "week" ? "secondary" : "ghost"}
            size="xs"
            onClick={() => setViewMode("week")}
          >
            <List className="mr-1 size-3.5" />
            주
          </Button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setCategoryFilter(null)}
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
            categoryFilter === null
              ? "border-brand bg-brand/10 text-brand"
              : "border-input text-text-muted hover:bg-muted",
          )}
        >
          전체
        </button>
        {EVENT_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() =>
              setCategoryFilter(
                categoryFilter === cat.value ? null : cat.value,
              )
            }
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
              categoryFilter === cat.value
                ? `${cat.bg} ${cat.color} border-current`
                : "border-input text-text-muted hover:bg-muted",
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-text-muted" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-lg border border-error/20 bg-error/5 p-4 text-center text-sm text-error">
          일정을 불러오는 중 오류가 발생했습니다.
        </div>
      )}

      {/* Calendar views */}
      {!isLoading && !isError && (
        <>
          {viewMode === "month" && (
            <div className="overflow-x-auto rounded-lg border bg-white">
              <CalendarMonthView
                year={year}
                month={month}
                events={filteredEvents}
                onEventClick={handleEventClick}
              />
            </div>
          )}
          {viewMode === "week" && (
            <CalendarWeekView
              events={filteredEvents}
              onEventClick={handleEventClick}
            />
          )}
        </>
      )}

      {/* Event detail dialog */}
      <EventDetailDialog
        event={selectedEvent}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
