import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { thesis, thesisArtifacts } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { uploadToR2 } from "@/lib/storage";

export const dynamic = "force-dynamic";

const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  SUMMARY: [".md", ".txt", ".pdf"],
  SLIDES: [".pdf", ".pptx", ".key"],
  INFOGRAPHIC: [".png", ".jpg", ".jpeg", ".webp", ".pdf"],
  AUDIO: [".mp3", ".m4a", ".wav", ".aac"],
  MINDMAP: [".png", ".jpg", ".jpeg", ".webp", ".pdf"],
};

const VALID_TYPES = Object.keys(ALLOWED_EXTENSIONS);
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

// POST /api/theses/[id]/artifacts — upload artifact
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db
    .select({ id: thesis.id })
    .from(thesis)
    .where(eq(thesis.id, id))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const artifactType = formData.get("artifactType") as string;

  if (!(file instanceof File) || !file.name) {
    return NextResponse.json({ error: "파일을 선택하세요." }, { status: 400 });
  }

  if (!VALID_TYPES.includes(artifactType)) {
    return NextResponse.json({ error: "Invalid artifactType" }, { status: 400 });
  }

  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS[artifactType].includes(ext)) {
    return NextResponse.json(
      {
        error: `${artifactType}은(는) ${ALLOWED_EXTENSIONS[artifactType].join(", ")} 형식만 업로드할 수 있습니다.`,
      },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "파일 크기가 50MB를 초과합니다." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `thesis-artifacts/${id}/${artifactType.toLowerCase()}${ext}`;
  const fileUrl = await uploadToR2(key, buffer, file.type || "application/octet-stream");

  // Upsert (unique constraint on thesisId + artifactType)
  const rows = await db
    .insert(thesisArtifacts)
    .values({
      thesisId: id,
      artifactType,
      fileUrl,
    })
    .onConflictDoUpdate({
      target: [thesisArtifacts.thesisId, thesisArtifacts.artifactType],
      set: {
        fileUrl,
        updatedAt: new Date(),
      },
    })
    .returning();

  return NextResponse.json({ artifact: rows[0] }, { status: 201 });
}
