import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { bookmarks, comments, posts, reactions, users } from "@/db/schema";
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
      commentCount: sql<number>`(SELECT COUNT(*) FROM comments WHERE comments.post_id = ${posts.id})`,
      userHasLiked: sql<boolean>`EXISTS (SELECT 1 FROM reactions WHERE reactions.post_id = ${posts.id} AND reactions.user_id = ${session.sub})`,
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

  if (typeof title !== "string" || typeof content !== "string" || title.length > 200 || content.length > 50000) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

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

  try {
    await db.transaction(async (tx) => {
      await tx.delete(comments).where(eq(comments.postId, id));
      await tx.delete(reactions).where(eq(reactions.postId, id));
      await tx
        .delete(bookmarks)
        .where(and(eq(bookmarks.targetType, "post"), eq(bookmarks.targetId, id)));
      await tx.delete(posts).where(eq(posts.id, id));
    });
  } catch (error) {
    console.error("[posts/[id] DELETE]", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
