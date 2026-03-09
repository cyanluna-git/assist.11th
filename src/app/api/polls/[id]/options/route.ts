import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { polls, pollOptions } from "@/db/schema";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const poll = await db
    .select({
      creatorId: polls.creatorId,
      closesAt: polls.closesAt,
    })
    .from(polls)
    .where(eq(polls.id, id))
    .then((rows) => rows[0] ?? null);

  if (!poll) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (poll.creatorId !== session.sub && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Check if poll is closed
  if (poll.closesAt && new Date(poll.closesAt) <= new Date()) {
    return NextResponse.json({ error: "Poll is closed" }, { status: 409 });
  }

  const body = await req.json();
  const { options } = body;

  if (!Array.isArray(options) || options.length === 0) {
    return NextResponse.json(
      { error: "At least 1 option is required" },
      { status: 400 },
    );
  }

  if (options.some((o: unknown) => typeof o !== "string" || (o as string).trim().length === 0)) {
    return NextResponse.json(
      { error: "All options must be non-empty strings" },
      { status: 400 },
    );
  }

  // Check total option count limit
  const existingCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(pollOptions)
    .where(eq(pollOptions.pollId, id))
    .then((rows) => Number(rows[0]?.count ?? 0));

  if (existingCount + options.length > 20) {
    return NextResponse.json(
      { error: "Maximum 20 options allowed per poll" },
      { status: 400 },
    );
  }

  const optionValues = (options as string[]).map((text) => ({
    pollId: id,
    text: text.trim(),
  }));

  const newOptions = await db
    .insert(pollOptions)
    .values(optionValues)
    .returning();

  return NextResponse.json({ options: newOptions }, { status: 201 });
}
