import { eq, and, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { notifications, notificationSettings, users } from "@/db/schema";

// ────────────────────────────────────────────────────────
// Notification types — keep in sync with notification_settings
// ────────────────────────────────────────────────────────

export type NotificationType =
  | "comment"
  | "reply"
  | "notice"
  | "poll"
  | "event_reminder";

// ────────────────────────────────────────────────────────
// Core helpers
// ────────────────────────────────────────────────────────

interface CreateNotificationParams {
  type: NotificationType;
  actorId: string; // who triggered it
  targetUserId: string; // who receives it
  title: string;
  message?: string;
  link?: string;
}

/**
 * Insert a single notification.
 * Skips if actorId === targetUserId (no self-notification).
 * Respects per-type notification settings.
 * Fire-and-forget — wrap calls in try/catch.
 */
export async function createNotification(
  params: CreateNotificationParams,
): Promise<void> {
  const { type, actorId, targetUserId, title, message, link } = params;

  // Never notify yourself
  if (actorId === targetUserId) return;

  // Check if user disabled this type
  if (await isDisabled(targetUserId, type)) return;

  await db.insert(notifications).values({
    userId: targetUserId,
    type,
    title,
    message: message ?? null,
    link: link ?? null,
  });
}

interface CreateBulkNotificationsParams {
  type: NotificationType;
  actorId: string;
  targetUserIds: string[];
  title: string;
  message?: string;
  link?: string;
}

/**
 * Insert notifications for multiple users at once.
 * Excludes actorId and users who disabled the type.
 * Fire-and-forget — wrap calls in try/catch.
 */
export async function createBulkNotifications(
  params: CreateBulkNotificationsParams,
): Promise<void> {
  const { type, actorId, targetUserIds, title, message, link } = params;

  // Exclude self
  const candidates = targetUserIds.filter((id) => id !== actorId);
  if (candidates.length === 0) return;

  // Filter out users who disabled this notification type
  const disabledRows = await db
    .select({ userId: notificationSettings.userId })
    .from(notificationSettings)
    .where(
      and(
        inArray(notificationSettings.userId, candidates),
        eq(notificationSettings.type, type),
        eq(notificationSettings.enabled, false),
      ),
    );

  const disabledSet = new Set(disabledRows.map((r) => r.userId));
  const finalIds = candidates.filter((id) => !disabledSet.has(id));
  if (finalIds.length === 0) return;

  const values = finalIds.map((userId) => ({
    userId,
    type,
    title,
    message: message ?? null,
    link: link ?? null,
  }));

  await db.insert(notifications).values(values);
}

/**
 * Get all user IDs (for bulk notifications like notice posts, new polls).
 */
export async function getAllUserIds(): Promise<string[]> {
  const rows = await db.select({ id: users.id }).from(users);
  return rows.map((r) => r.id);
}

// ────────────────────────────────────────────────────────
// Internal
// ────────────────────────────────────────────────────────

async function isDisabled(
  userId: string,
  type: NotificationType,
): Promise<boolean> {
  const row = await db
    .select({ enabled: notificationSettings.enabled })
    .from(notificationSettings)
    .where(
      and(
        eq(notificationSettings.userId, userId),
        eq(notificationSettings.type, type),
      ),
    )
    .then((rows) => rows[0] ?? null);

  // Default: enabled (no row = enabled)
  return row ? !row.enabled : false;
}
