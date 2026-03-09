import { NextRequest, NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { photos, users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import {
  getR2Client,
  getBucketName,
  generateKey,
  uploadToR2,
} from "@/lib/storage";
import { processImage } from "@/lib/image";

export const dynamic = "force-dynamic";

const MAX_FILES = 20;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
];

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = Math.min(
    Number(req.nextUrl.searchParams.get("limit")) || 20,
    50,
  );
  const offset = Number(req.nextUrl.searchParams.get("offset")) || 0;

  const result = await db
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
    .orderBy(desc(photos.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({ photos: result });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check R2 is configured
  const client = getR2Client();
  const bucket = getBucketName();
  if (!client || !bucket) {
    return NextResponse.json(
      { error: "Storage not configured" },
      { status: 503 },
    );
  }

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  const albumId = (formData.get("albumId") as string) || null;

  if (files.length === 0) {
    return NextResponse.json(
      { error: "No files provided" },
      { status: 400 },
    );
  }

  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `Too many files (max ${MAX_FILES})` },
      { status: 400 },
    );
  }

  // Validate all files first
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File "${file.name}" too large (max 10MB)` },
        { status: 400 },
      );
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File "${file.name}" has invalid type: ${file.type}` },
        { status: 400 },
      );
    }
  }

  const uploadedPhotos: Array<{
    id: string;
    imageUrl: string;
    thumbnailUrl: string;
    caption: string | null;
  }> = [];

  const errors: string[] = [];

  for (const file of files) {
    try {
      const inputBuffer = Buffer.from(await file.arrayBuffer());
      const processed = await processImage(inputBuffer);

      const originalKey = generateKey("gallery/original", "webp");
      const thumbnailKey = generateKey("gallery/thumbnail", "webp");

      const [originalUrl, thumbnailUrl] = await Promise.all([
        uploadToR2(originalKey, processed.originalBuffer, processed.contentType),
        uploadToR2(
          thumbnailKey,
          processed.thumbnailBuffer,
          processed.contentType,
        ),
      ]);

      const caption = formData.get(`caption_${file.name}`) as string | null;

      const inserted = await db
        .insert(photos)
        .values({
          albumId,
          uploaderId: session.sub,
          imageUrl: originalUrl,
          thumbnailUrl,
          caption: caption || null,
        })
        .returning();

      uploadedPhotos.push({
        id: inserted[0].id,
        imageUrl: inserted[0].imageUrl,
        thumbnailUrl: inserted[0].thumbnailUrl,
        caption: inserted[0].caption,
      });
    } catch (err) {
      console.error(`Failed to upload ${file.name}:`, err);
      errors.push(file.name);
    }
  }

  return NextResponse.json(
    {
      photos: uploadedPhotos,
      ...(errors.length > 0 ? { errors } : {}),
    },
    { status: 201 },
  );
}
