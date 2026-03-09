import { NextRequest, NextResponse } from "next/server";
import { eq, desc, sql, and, lte } from "drizzle-orm";

import { db } from "@/lib/db";
import { polls, pollOptions, pollVotes, users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { createBulkNotifications, getAllUserIds } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = req.nextUrl.searchParams.get("status") || "all";
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit")) || 20, 50);
  const offset = Number(req.nextUrl.searchParams.get("offset")) || 0;

  const now = new Date();
  const conditions = [];

  if (status === "active") {
    // Active: closesAt is null OR closesAt > now
    conditions.push(
      sql`(${polls.closesAt} IS NULL OR ${polls.closesAt} > ${now})`,
    );
  } else if (status === "closed") {
    // Closed: closesAt <= now
    conditions.push(lte(polls.closesAt, now));
  }
  // "all" — no filter

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const result = await db
    .select({
      id: polls.id,
      title: polls.title,
      description: polls.description,
      isMultiple: polls.isMultiple,
      isAnonymous: polls.isAnonymous,
      closesAt: polls.closesAt,
      createdAt: polls.createdAt,
      creatorId: polls.creatorId,
      creatorName: users.name,
      creatorAvatar: users.avatarUrl,
      totalVotes: sql<number>`(
        SELECT COUNT(DISTINCT pv.user_id)
        FROM poll_options po
        JOIN poll_votes pv ON pv.poll_option_id = po.id
        WHERE po.poll_id = ${polls.id}
      )`,
      optionCount: sql<number>`(
        SELECT COUNT(*) FROM poll_options po WHERE po.poll_id = ${polls.id}
      )`,
    })
    .from(polls)
    .leftJoin(users, eq(polls.creatorId, users.id))
    .where(whereClause)
    .orderBy(desc(polls.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({ polls: result });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, options, isMultiple, isAnonymous, closesAt } = body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (title.length > 200) {
    return NextResponse.json({ error: "Title too long" }, { status: 400 });
  }

  if (!Array.isArray(options) || options.length < 2) {
    return NextResponse.json(
      { error: "At least 2 options are required" },
      { status: 400 },
    );
  }

  if (options.some((o: unknown) => typeof o !== "string" || (o as string).trim().length === 0)) {
    return NextResponse.json(
      { error: "All options must be non-empty strings" },
      { status: 400 },
    );
  }

  if (options.length > 20) {
    return NextResponse.json(
      { error: "Maximum 20 options allowed" },
      { status: 400 },
    );
  }

  // Sequential inserts (Neon HTTP driver doesn't support transactions)
  const [newPoll] = await db
    .insert(polls)
    .values({
      title: title.trim(),
      description: description?.trim() || null,
      isMultiple: isMultiple === true,
      isAnonymous: isAnonymous === true,
      closesAt: closesAt ? new Date(closesAt) : null,
      creatorId: session.sub,
    })
    .returning();

  const optionValues = (options as string[]).map((text) => ({
    pollId: newPoll.id,
    text: text.trim(),
  }));

  const newOptions = await db
    .insert(pollOptions)
    .values(optionValues)
    .returning();

  // Fire-and-forget: notify all users about new poll
  try {
    const allIds = await getAllUserIds();
    await createBulkNotifications({
      type: "poll",
      actorId: session.sub,
      targetUserIds: allIds,
      title: `새 투표: ${title.trim()}`,
      link: `/polls/${newPoll.id}`,
    });
  } catch {
    // Notification failure must not block the response
  }

  return NextResponse.json(
    { poll: { ...newPoll, options: newOptions } },
    { status: 201 },
  );
}
