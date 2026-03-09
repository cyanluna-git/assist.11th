"use client";

import { useState, useMemo, useCallback, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEvents, useCreateEvent } from "@/hooks/use-events";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { EventSummary, EventCategory } from "@/types/event";
import { ScheduleList } from "@/components/events/schedule-list";
import { ScheduleMonthView } from "@/components/events/schedule-month-view";
import { ScheduleChronology } from "@/components/events/schedule-chronology";
import { EventDetailDialog } from "@/components/events/event-detail-dialog";
import { formatScheduleMonthLabel } from "./date-formatting";
import styles from "./schedule.module.css";

type ViewMode = "list" | "month";
type FilterMode = "all" | "upcoming" | "past" | "attending";
type SortMode = "date" | "category";

const CATEGORY_ORDER: Record<string, number> = {
  class: 0,
  meetup: 1,
  mt: 2,
  dinner: 3,
  study: 4,
};

export function EventsPageClient() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [sortMode, setSortMode] = useState<SortMode>("date");

  // Detail dialog
  const [selectedEvent, setSelectedEvent] = useState<EventSummary | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Inline create form
  const [formTitle, setFormTitle] = useState("");
  const [formStartAt, setFormStartAt] = useState("");
  const [formEndAt, setFormEndAt] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const { data: currentUser } = useCurrentUser();
  const createEvent = useCreateEvent();

  // Fetch events for a wide range (full year) so we have data for all views
  const from = useMemo(() => new Date(year, 0, 1).toISOString(), [year]);
  const to = useMemo(() => new Date(year, 11, 31, 23, 59, 59).toISOString(), [year]);

  const { data: allEvents, isLoading, isError } = useEvents(from, to);

  // Apply filters
  const filteredEvents = useMemo(() => {
    if (!allEvents) return [];
    const nowMs = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;

    let result = [...allEvents];

    switch (filterMode) {
      case "upcoming":
        result = result.filter((ev) => {
          const t = new Date(ev.startAt).getTime();
          return t >= nowMs && t <= nowMs + weekMs;
        });
        break;
      case "past":
        result = result.filter((ev) => new Date(ev.startAt).getTime() < nowMs);
        break;
      case "attending":
        result = result.filter((ev) => ev.myRsvp === "attending");
        break;
    }

    // Apply sort
    if (sortMode === "category") {
      result.sort((a, b) => {
        const ca = CATEGORY_ORDER[a.category ?? ""] ?? 99;
        const cb = CATEGORY_ORDER[b.category ?? ""] ?? 99;
        if (ca !== cb) return ca - cb;
        return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
      });
    } else {
      result.sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      );
    }

    return result;
  }, [allEvents, filterMode, sortMode]);

  // Month navigation
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

  const handleEventClick = useCallback((event: EventSummary) => {
    setSelectedEvent(event);
    setDetailOpen(true);
  }, []);

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formStartAt) return;
    createEvent.mutate(
      {
        title: formTitle.trim(),
        startAt: new Date(formStartAt).toISOString(),
        endAt: formEndAt ? new Date(formEndAt).toISOString() : undefined,
        category: (formCategory as EventCategory) || undefined,
        location: formLocation.trim() || undefined,
        description: formDescription.trim() || undefined,
      },
      {
        onSuccess: () => {
          setFormTitle("");
          setFormStartAt("");
          setFormEndAt("");
          setFormCategory("");
          setFormLocation("");
          setFormDescription("");
        },
      },
    );
  };

  const monthDate = useMemo(() => new Date(year, month, 1), [year, month]);

  return (
    <>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--color-text-strong)" }}>
            일정
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
            ASSIST 11기 일정 관리
          </p>
        </div>
      </div>

      {/* Top grid: add form + info */}
      <section className={styles.topGrid}>
        <article className={cn("rounded-lg border bg-white", styles.panel)}>
          <h2 className={styles.panelTitle}>일정 직접 추가</h2>
          <p className={styles.panelText}>새로운 일정을 등록하세요.</p>

          <form className={styles.form} onSubmit={handleCreate}>
            <div className={styles.field}>
              <label className={styles.label}>제목 *</label>
              <input
                className={styles.input}
                placeholder="일정 제목"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
                maxLength={200}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label className={styles.label}>시작 *</label>
                <input
                  className={styles.input}
                  type="datetime-local"
                  value={formStartAt}
                  onChange={(e) => setFormStartAt(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>종료</label>
                <input
                  className={styles.input}
                  type="datetime-local"
                  value={formEndAt}
                  onChange={(e) => setFormEndAt(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label className={styles.label}>카테고리</label>
                <select
                  className={styles.select}
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                >
                  <option value="">선택 안 함</option>
                  <option value="class">수업</option>
                  <option value="meetup">모임</option>
                  <option value="mt">MT</option>
                  <option value="dinner">회식</option>
                  <option value="study">스터디</option>
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>장소</label>
                <input
                  className={styles.input}
                  placeholder="장소"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  maxLength={500}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>설명</label>
              <textarea
                className={styles.textarea}
                placeholder="일정에 대한 설명"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                maxLength={5000}
              />
            </div>

            <button
              type="submit"
              className={styles.addBtn}
              disabled={createEvent.isPending || !formTitle.trim() || !formStartAt}
            >
              <Plus size={15} />
              {createEvent.isPending ? "등록 중..." : "일정 등록"}
            </button>
          </form>
        </article>

        <article className={cn("rounded-lg border bg-white", styles.panel)}>
          <h2 className={styles.panelTitle}>운영 방식</h2>
          <p className={styles.panelText}>ASSIST 11기 일정 관리 가이드</p>
          <ul className={styles.helperList}>
            <li>수업, 모임, MT, 회식, 스터디 등 카테고리별 일정 관리</li>
            <li>일정별 참석 여부(참석/미정/불참)를 표시할 수 있습니다</li>
            <li>리스트 보기와 월간 달력 보기를 전환할 수 있습니다</li>
            <li>임박, 지난 일정, 내 참석 등 필터로 빠르게 찾을 수 있습니다</li>
            <li>본인이 등록한 일정은 수정 및 삭제가 가능합니다</li>
          </ul>
        </article>
      </section>

      {/* Views section */}
      <section className={styles.viewsSection}>
        {/* Toolbar */}
        <div className={cn("rounded-lg border bg-white", styles.viewToolbar)}>
          <div className={styles.toolbarGroups}>
            {/* View tabs */}
            <div className={styles.viewTabs}>
              <button
                type="button"
                className={cn(styles.viewTab, viewMode === "list" && styles.viewTabActive)}
                onClick={() => setViewMode("list")}
              >
                리스트
              </button>
              <button
                type="button"
                className={cn(styles.viewTab, viewMode === "month" && styles.viewTabActive)}
                onClick={() => setViewMode("month")}
              >
                월간 보기
              </button>
            </div>

            {/* Filter chips */}
            <div className={styles.filterBar}>
              {(
                [
                  ["all", "전체"],
                  ["upcoming", "임박"],
                  ["past", "지난 일정"],
                  ["attending", "내 참석"],
                ] as [FilterMode, string][]
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  className={cn(
                    styles.filterChip,
                    filterMode === mode && styles.filterChipActive,
                  )}
                  onClick={() => setFilterMode(mode)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.toolbarGroupsRight}>
            {/* Sort */}
            <div className={styles.sortField}>
              <span className={styles.sortLabel}>정렬</span>
              <select
                className={styles.sortSelect}
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
              >
                <option value="date">일시순</option>
                <option value="category">카테고리순</option>
              </select>
            </div>

            {/* Month navigation (always visible for context) */}
            <div className={styles.monthNav}>
              <button type="button" className={styles.monthNavButton} onClick={handlePrev}>
                <ChevronLeft size={15} />
              </button>
              <span className={styles.monthLabel}>
                {formatScheduleMonthLabel(monthDate)}
              </span>
              <button type="button" className={styles.monthNavButton} onClick={handleNext}>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin" style={{ color: "var(--color-text-muted)" }} />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-lg border p-4 text-center text-sm" style={{ borderColor: "rgba(177,73,73,0.2)", background: "rgba(177,73,73,0.05)", color: "#b14949" }}>
            일정을 불러오는 중 오류가 발생했습니다.
          </div>
        )}

        {/* Content */}
        {!isLoading && !isError && (
          <>
            {viewMode === "list" && (
              <ScheduleList
                events={filteredEvents}
                currentUserId={currentUser?.id}
                isAdmin={currentUser?.role === "admin"}
                onEventClick={handleEventClick}
              />
            )}

            {viewMode === "month" && (
              <div className={styles.monthLayout}>
                <div className={cn("rounded-lg border bg-white", styles.monthPanel)}>
                  <ScheduleMonthView
                    year={year}
                    month={month}
                    events={allEvents ?? []}
                    onEventClick={handleEventClick}
                  />
                </div>
                <ScheduleChronology
                  year={year}
                  month={month}
                  events={allEvents ?? []}
                  onSwitchToList={() => setViewMode("list")}
                  onEventClick={handleEventClick}
                />
              </div>
            )}
          </>
        )}
      </section>

      {/* Event detail dialog */}
      <EventDetailDialog
        event={selectedEvent}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
