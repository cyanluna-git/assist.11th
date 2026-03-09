import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { polls, pollOptions, pollVotes } from "@/db/schema";
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

  // Fetch poll
  const poll = await db
    .select({
      id: polls.id,
      isMultiple: polls.isMultiple,
      closesAt: polls.closesAt,
    })
    .from(polls)
    .where(eq(polls.id, id))
    .then((rows) => rows[0] ?? null);

  if (!poll) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Check if poll is closed
  if (poll.closesAt && new Date(poll.closesAt) <= new Date()) {
    return NextResponse.json({ error: "Poll is closed" }, { status: 409 });
  }

  const body = await req.json();
  const { optionIds } = body;

  if (!Array.isArray(optionIds) || optionIds.length === 0) {
    return NextResponse.json(
      { error: "At least 1 option ID is required" },
      { status: 400 },
    );
  }

  // Single-choice constraint
  if (!poll.isMultiple && optionIds.length > 1) {
    return NextResponse.json(
      { error: "This poll allows only a single choice" },
      { status: 400 },
    );
  }

  // Validate that all option IDs belong to this poll
  const validOptions = await db
    .select({ id: pollOptions.id })
    .from(pollOptions)
    .where(eq(pollOptions.pollId, id));

  const validOptionIds = new Set(validOptions.map((o) => o.id));
  const invalidIds = (optionIds as string[]).filter((oid) => !validOptionIds.has(oid));

  if (invalidIds.length > 0) {
    return NextResponse.json(
      { error: "Invalid option IDs" },
      { status: 400 },
    );
  }

  // Check for existing votes by this user on this poll
  const existingVotes = await db
    .select({ pollOptionId: pollVotes.pollOptionId })
    .from(pollVotes)
    .innerJoin(pollOptions, eq(pollVotes.pollOptionId, pollOptions.id))
    .where(
      sql`${pollOptions.pollId} = ${id} AND ${pollVotes.userId} = ${session.sub}`,
    );

  if (existingVotes.length > 0) {
    return NextResponse.json(
      { error: "Already voted on this poll" },
      { status: 409 },
    );
  }

  // Insert votes (with onConflictDoNothing as safety net for the unique constraint)
  const voteValues = (optionIds as string[]).map((optionId) => ({
    pollOptionId: optionId,
    userId: session.sub,
  }));

  await db
    .insert(pollVotes)
    .values(voteValues)
    .onConflictDoNothing({
      target: [pollVotes.pollOptionId, pollVotes.userId],
    });

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Fetch poll
  const poll = await db
    .select({
      id: polls.id,
      closesAt: polls.closesAt,
    })
    .from(polls)
    .where(eq(polls.id, id))
    .then((rows) => rows[0] ?? null);

  if (!poll) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Check if poll is closed
  if (poll.closesAt && new Date(poll.closesAt) <= new Date()) {
    return NextResponse.json({ error: "Poll is closed" }, { status: 409 });
  }

  // Get option IDs for this poll
  const options = await db
    .select({ id: pollOptions.id })
    .from(pollOptions)
    .where(eq(pollOptions.pollId, id));

  const optionIdList = options.map((o) => o.id);

  if (optionIdList.length === 0) {
    return NextResponse.json({ success: true });
  }

  // Delete user's votes on this poll
  await db
    .delete(pollVotes)
    .where(
      and(
        inArray(pollVotes.pollOptionId, optionIdList),
        eq(pollVotes.userId, session.sub),
      ),
    );

  return NextResponse.json({ success: true });
}
