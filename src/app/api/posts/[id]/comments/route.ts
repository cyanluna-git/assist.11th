import { NextRequest, NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";

import { db } from "@/lib/db";
import { comments, users } from "@/db/schema";
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

  const { id: postId } = await params;

  const result = await db
    .select({
      id: comments.id,
      content: comments.content,
      parentId: comments.parentId,
      createdAt: comments.createdAt,
      authorId: comments.authorId,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
    })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.postId, postId))
    .orderBy(asc(comments.createdAt));

  return NextResponse.json({ comments: result });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: postId } = await params;
  const { content, parentId } = await req.json();

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const newComment = await db
    .insert(comments)
    .values({
      postId,
      authorId: session.sub,
      content,
      parentId: parentId || null,
    })
    .returning();

  return NextResponse.json({ comment: newComment[0] }, { status: 201 });
}
