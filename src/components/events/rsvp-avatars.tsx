"use client";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import type { RsvpUser, RsvpStatus } from "@/types/event";

const STATUS_LABELS: Record<RsvpStatus, string> = {
  attending: "참석",
  maybe: "미정",
  declined: "불참",
};

const STATUS_COLORS: Record<RsvpStatus, string> = {
  attending: "text-green-700",
  maybe: "text-yellow-600",
  declined: "text-red-600",
};

export function RsvpAvatars({
  rsvps,
  maxShow = 5,
}: {
  rsvps: RsvpUser[];
  maxShow?: number;
}) {
  if (rsvps.length === 0) {
    return (
      <p className="text-xs text-text-muted">아직 응답한 사람이 없습니다</p>
    );
  }

  const grouped: Record<RsvpStatus, RsvpUser[]> = {
    attending: [],
    maybe: [],
    declined: [],
  };

  for (const r of rsvps) {
    if (grouped[r.status]) {
      grouped[r.status].push(r);
    }
  }

  return (
    <div className="space-y-2">
      {(["attending", "maybe", "declined"] as RsvpStatus[]).map((status) => {
        const users = grouped[status];
        if (users.length === 0) return null;
        const visible = users.slice(0, maxShow);
        const remaining = users.length - visible.length;

        return (
          <div key={status} className="flex items-center gap-2">
            <span
              className={cn("min-w-[32px] text-xs font-medium", STATUS_COLORS[status])}
            >
              {STATUS_LABELS[status]} ({users.length})
            </span>
            <div className="flex -space-x-1.5">
              {visible.map((u) => (
                <Avatar
                  key={u.userId}
                  src={u.userAvatar}
                  name={u.userName ?? "?"}
                  size="sm"
                  className="size-6 text-[10px] ring-2 ring-white"
                />
              ))}
              {remaining > 0 && (
                <div className="flex size-6 items-center justify-center rounded-full bg-gray-200 text-[10px] font-medium text-gray-600 ring-2 ring-white">
                  +{remaining}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
