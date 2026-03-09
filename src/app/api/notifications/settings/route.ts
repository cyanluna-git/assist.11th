import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

import { db } from "@/lib/db";
import { notificationSettings } from "@/db/schema";
import { getSession } from "@/lib/auth";
import type { NotificationType } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const VALID_TYPES: NotificationType[] = [
  "comment",
  "reply",
  "notice",
  "poll",
  "event_reminder",
];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      type: notificationSettings.type,
      enabled: notificationSettings.enabled,
    })
    .from(notificationSettings)
    .where(eq(notificationSettings.userId, session.sub));

  // Build full settings map (default all enabled)
  const settingsMap: Record<string, boolean> = {};
  for (const t of VALID_TYPES) {
    settingsMap[t] = true;
  }
  for (const row of rows) {
    settingsMap[row.type] = row.enabled;
  }

  return NextResponse.json({ settings: settingsMap });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { type, enabled } = body;
  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` }, { status: 400 });
  }
  if (typeof enabled !== "boolean") {
    return NextResponse.json({ error: "enabled must be boolean" }, { status: 400 });
  }

  // Upsert: check if row exists
  const existing = await db
    .select({ id: notificationSettings.id })
    .from(notificationSettings)
    .where(
      and(
        eq(notificationSettings.userId, session.sub),
        eq(notificationSettings.type, type),
      ),
    )
    .then((rows) => rows[0] ?? null);

  if (existing) {
    await db
      .update(notificationSettings)
      .set({ enabled })
      .where(eq(notificationSettings.id, existing.id));
  } else {
    await db.insert(notificationSettings).values({
      userId: session.sub,
      type,
      enabled,
    });
  }

  return NextResponse.json({ success: true });
}
