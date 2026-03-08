import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { reactions } from "@/db/schema";
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

  const { id: postId } = await params;

  // Toggle: if exists, remove; if not, add
  const existing = await db
    .select({ id: reactions.id })
    .from(reactions)
    .where(and(eq(reactions.postId, postId), eq(reactions.userId, session.sub)))
    .then((rows) => rows[0] ?? null);

  if (existing) {
    await db.delete(reactions).where(eq(reactions.id, existing.id));
  } else {
    await db.insert(reactions).values({
      postId,
      userId: session.sub,
      type: "like",
    });
  }

  const count = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(reactions)
    .where(eq(reactions.postId, postId))
    .then((rows) => Number(rows[0]?.count ?? 0));

  return NextResponse.json({ liked: !existing, count });
}
