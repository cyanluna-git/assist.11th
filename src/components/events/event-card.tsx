"use client";

import { cn } from "@/lib/utils";
import type { EventSummary, EventCategory } from "@/types/event";
import { CATEGORY_MAP } from "@/types/event";

const PILL_COLORS: Record<EventCategory, string> = {
  class: "bg-blue-100 text-blue-800 border-blue-200",
  meetup: "bg-green-100 text-green-800 border-green-200",
  mt: "bg-orange-100 text-orange-800 border-orange-200",
  dinner: "bg-pink-100 text-pink-800 border-pink-200",
  study: "bg-purple-100 text-purple-800 border-purple-200",
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export function EventCard({
  event,
  onClick,
}: {
  event: EventSummary;
  onClick: () => void;
}) {
  const cat = event.category as EventCategory | null;
  const pillColor = cat && PILL_COLORS[cat] ? PILL_COLORS[cat] : "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full truncate rounded border px-1.5 py-0.5 text-left text-[11px] font-medium leading-tight transition-opacity hover:opacity-80",
        pillColor,
      )}
    >
      <span className="mr-1 text-[10px] opacity-70">{formatTime(event.startAt)}</span>
      {event.title}
      {cat && CATEGORY_MAP[cat] && (
        <span className="ml-0.5 text-[9px] opacity-60">
          {CATEGORY_MAP[cat].label}
        </span>
      )}
    </button>
  );
}
