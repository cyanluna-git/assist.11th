import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { polls } from "@/db/schema";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
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

  // Already closed
  if (poll.closesAt && new Date(poll.closesAt) <= new Date()) {
    return NextResponse.json({ error: "Poll is already closed" }, { status: 409 });
  }

  await db
    .update(polls)
    .set({ closesAt: new Date() })
    .where(eq(polls.id, id));

  return NextResponse.json({ success: true });
}
