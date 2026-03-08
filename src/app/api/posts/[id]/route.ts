import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { posts, users } from "@/db/schema";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const result = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      boardType: posts.boardType,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      authorId: posts.authorId,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
      reactionCount: sql<number>`(SELECT COUNT(*) FROM reactions WHERE reactions.post_id = ${posts.id})`,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.id, id))
    .then((rows) => rows[0] ?? null);

  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ post: result });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const post = await db
    .select({ authorId: posts.authorId })
    .from(posts)
    .where(eq(posts.id, id))
    .then((rows) => rows[0] ?? null);

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (post.authorId !== session.sub && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, content } = await req.json();
  await db
    .update(posts)
    .set({ title, content, updatedAt: new Date() })
    .where(eq(posts.id, id));

  return NextResponse.json({ success: true });
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

  const post = await db
    .select({ authorId: posts.authorId })
    .from(posts)
    .where(eq(posts.id, id))
    .then((rows) => rows[0] ?? null);

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (post.authorId !== session.sub && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(posts).where(eq(posts.id, id));

  return NextResponse.json({ success: true });
}
