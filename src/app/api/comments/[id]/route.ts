import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { comments } from "@/db/schema";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const comment = await db
    .select({ authorId: comments.authorId })
    .from(comments)
    .where(eq(comments.id, id))
    .then((rows) => rows[0] ?? null);

  if (!comment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (comment.authorId !== session.sub && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(comments).where(eq(comments.id, id));

  return NextResponse.json({ success: true });
}
