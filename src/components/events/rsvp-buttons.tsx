"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRsvp, useRemoveRsvp } from "@/hooks/use-events";
import type { RsvpStatus } from "@/types/event";

const OPTIONS: { status: RsvpStatus; label: string; activeClass: string }[] = [
  { status: "attending", label: "참석", activeClass: "bg-green-600 text-white hover:bg-green-700" },
  { status: "maybe", label: "미정", activeClass: "bg-yellow-500 text-white hover:bg-yellow-600" },
  { status: "declined", label: "불참", activeClass: "bg-red-500 text-white hover:bg-red-600" },
];

export function RsvpButtons({
  eventId,
  currentStatus,
}: {
  eventId: string;
  currentStatus: RsvpStatus | null;
}) {
  const rsvp = useRsvp(eventId);
  const removeRsvp = useRemoveRsvp(eventId);
  const isPending = rsvp.isPending || removeRsvp.isPending;

  const handleClick = (status: RsvpStatus) => {
    if (isPending) return;
    if (currentStatus === status) {
      removeRsvp.mutate();
    } else {
      rsvp.mutate(status);
    }
  };

  return (
    <div className="flex gap-1.5">
      {OPTIONS.map((opt) => {
        const isActive = currentStatus === opt.status;
        return (
          <Button
            key={opt.status}
            type="button"
            size="xs"
            variant={isActive ? "default" : "outline"}
            className={cn(
              "min-w-[52px]",
              isActive && opt.activeClass,
            )}
            disabled={isPending}
            onClick={() => handleClick(opt.status)}
          >
            {opt.label}
          </Button>
        );
      })}
    </div>
  );
}
