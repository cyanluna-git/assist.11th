import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { thesisArtifacts } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { deleteFromR2, extractKeyFromUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

// DELETE /api/theses/[id]/artifacts/[artifactId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; artifactId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, artifactId } = await params;

  const artifact = await db
    .select()
    .from(thesisArtifacts)
    .where(
      and(
        eq(thesisArtifacts.id, artifactId),
        eq(thesisArtifacts.thesisId, id),
      ),
    )
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!artifact) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (artifact.fileUrl) {
    const key = extractKeyFromUrl(artifact.fileUrl);
    if (key) {
      try {
        await deleteFromR2(key);
      } catch {
        // R2 cleanup failure must not block deletion
      }
    }
  }

  await db.delete(thesisArtifacts).where(eq(thesisArtifacts.id, artifactId));

  return NextResponse.json({ success: true });
}
