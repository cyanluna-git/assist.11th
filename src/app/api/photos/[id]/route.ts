import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { photos, users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { deleteFromR2, extractKeyFromUrl } from "@/lib/storage";

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

  const rows = await db
    .select({
      id: photos.id,
      albumId: photos.albumId,
      imageUrl: photos.imageUrl,
      thumbnailUrl: photos.thumbnailUrl,
      caption: photos.caption,
      uploaderId: photos.uploaderId,
      uploaderName: users.name,
      createdAt: photos.createdAt,
      commentCount:
        sql<number>`(SELECT COUNT(*) FROM photo_comments WHERE photo_comments.photo_id = ${photos.id})`,
    })
    .from(photos)
    .leftJoin(users, eq(photos.uploaderId, users.id))
    .where(eq(photos.id, id));

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ photo: rows[0] });
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

  const photo = await db
    .select({ uploaderId: photos.uploaderId })
    .from(photos)
    .where(eq(photos.id, id))
    .then((rows) => rows[0] ?? null);

  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only the uploader or admin can update
  if (photo.uploaderId !== session.sub && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.caption !== undefined) {
    if (
      body.caption !== null &&
      (typeof body.caption !== "string" || body.caption.length > 500)
    ) {
      return NextResponse.json(
        { error: "Invalid caption (max 500)" },
        { status: 400 },
      );
    }
    updates.caption = body.caption;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No fields to update" },
      { status: 400 },
    );
  }

  const updated = await db
    .update(photos)
    .set(updates)
    .where(eq(photos.id, id))
    .returning();

  return NextResponse.json({ photo: updated[0] });
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

  const photo = await db
    .select({
      id: photos.id,
      uploaderId: photos.uploaderId,
      imageUrl: photos.imageUrl,
      thumbnailUrl: photos.thumbnailUrl,
    })
    .from(photos)
    .where(eq(photos.id, id))
    .then((rows) => rows[0] ?? null);

  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only the uploader or admin can delete
  if (photo.uploaderId !== session.sub && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete from DB (cascade deletes photo_comments)
  await db.delete(photos).where(eq(photos.id, id));

  // Delete from R2 (best-effort)
  try {
    const originalKey = extractKeyFromUrl(photo.imageUrl);
    const thumbKey = extractKeyFromUrl(photo.thumbnailUrl);

    await Promise.all([
      originalKey ? deleteFromR2(originalKey) : Promise.resolve(),
      thumbKey ? deleteFromR2(thumbKey) : Promise.resolve(),
    ]);
  } catch (err) {
    console.error("Failed to delete R2 files for photo:", id, err);
  }

  return NextResponse.json({ success: true });
}
