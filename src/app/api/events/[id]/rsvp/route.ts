import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

import { db } from "@/lib/db";
import { events, eventRsvps } from "@/db/schema";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["attending", "declined", "maybe"] as const;
type RsvpStatus = (typeof VALID_STATUSES)[number];

/**
 * POST /api/events/:id/rsvp
 * Set or update the current user's RSVP for this event.
 * Body: { status: "attending" | "declined" | "maybe" }
 *
 * NOTE: RSVP is always on the master event. For recurring events,
 * the RSVP applies to the master event (not individual virtual instances).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { status } = body;

  if (!status || !VALID_STATUSES.includes(status as RsvpStatus)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 },
    );
  }

  // Verify event exists
  const event = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.id, eventId))
    .then((rows) => rows[0] ?? null);

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Atomic upsert using the unique constraint on (eventId, userId)
  await db
    .insert(eventRsvps)
    .values({
      eventId,
      userId: session.sub,
      status: status as RsvpStatus,
    })
    .onConflictDoUpdate({
      target: [eventRsvps.eventId, eventRsvps.userId],
      set: { status: status as RsvpStatus },
    });

  return NextResponse.json({ success: true, status });
}

/**
 * DELETE /api/events/:id/rsvp
 * Remove the current user's RSVP for this event.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await params;

  await db
    .delete(eventRsvps)
    .where(
      and(
        eq(eventRsvps.eventId, eventId),
        eq(eventRsvps.userId, session.sub),
      ),
    );

  return NextResponse.json({ success: true });
}
