import { NextRequest, NextResponse } from "next/server";
import { eq, and, gte } from "drizzle-orm";

import { db } from "@/lib/db";
import { notifications, users } from "@/db/schema";
import { sendDigestEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Get all users with their emails
  const allUsers = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users);

  let emailsSent = 0;

  for (const user of allUsers) {
    if (!user.email) continue;

    // Get unread notifications from the past week
    const unread = await db
      .select({
        title: notifications.title,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, user.id),
          eq(notifications.isRead, false),
          gte(notifications.createdAt, oneWeekAgo),
        ),
      );

    if (unread.length === 0) continue;

    try {
      await sendDigestEmail({
        to: user.email,
        name: user.name ?? "회원",
        unreadCount: unread.length,
        notifications: unread,
      });
      emailsSent++;
    } catch {
      // Continue with other users
    }
  }

  return NextResponse.json({
    success: true,
    usersChecked: allUsers.length,
    emailsSent,
  });
}
