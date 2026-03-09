import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte, lte } from "drizzle-orm";

import { db } from "@/lib/db";
import { events, eventRsvps } from "@/db/schema";
import { createBulkNotifications } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find events starting tomorrow (D-1)
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

  const tomorrowEvents = await db
    .select({
      id: events.id,
      title: events.title,
    })
    .from(events)
    .where(
      and(
        gte(events.startAt, tomorrowStart),
        lte(events.startAt, tomorrowEnd),
      ),
    );

  let totalNotifications = 0;

  for (const event of tomorrowEvents) {
    // Get attending RSVPs
    const rsvps = await db
      .select({ userId: eventRsvps.userId })
      .from(eventRsvps)
      .where(
        and(
          eq(eventRsvps.eventId, event.id),
          eq(eventRsvps.status, "attending"),
        ),
      );

    if (rsvps.length > 0) {
      try {
        await createBulkNotifications({
          type: "event_reminder",
          actorId: "system",
          targetUserIds: rsvps.map((r) => r.userId),
          title: `내일 일정: ${event.title}`,
          link: `/events`,
        });
        totalNotifications += rsvps.length;
      } catch {
        // Continue with other events
      }
    }
  }

  return NextResponse.json({
    success: true,
    eventsChecked: tomorrowEvents.length,
    notificationsSent: totalNotifications,
  });
}
