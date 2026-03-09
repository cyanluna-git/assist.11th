import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const connectionString =
    (process.env.DATABASE_URL ?? "").trim() ||
    "postgresql://build:build@ep-build-placeholder.us-east-2.aws.neon.tech/neondb";

  const sql = neon(connectionString);

  const results: string[] = [];

  try {
    // Step 1: Make photos.album_id nullable (drop NOT NULL)
    await sql`ALTER TABLE photos ALTER COLUMN album_id DROP NOT NULL`;
    results.push("photos.album_id: DROP NOT NULL");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // If already nullable, that's fine
    if (!msg.includes("is not a not-null column") && !msg.includes("does not exist")) {
      results.push(`photos.album_id DROP NOT NULL: ${msg}`);
    } else {
      results.push("photos.album_id: already nullable (skipped)");
    }
  }

  try {
    // Step 2: Drop old FK constraint and add new one with ON DELETE SET NULL
    // Find the constraint name first
    const constraints = await sql`
      SELECT constraint_name FROM information_schema.table_constraints
      WHERE table_name = 'photos'
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%album_id%'
    `;

    if (constraints.length > 0) {
      const constraintName = constraints[0].constraint_name;
      await sql`ALTER TABLE photos DROP CONSTRAINT ${sql(constraintName)}`;
      results.push(`Dropped FK constraint: ${constraintName}`);
    }

    await sql`
      ALTER TABLE photos
      ADD CONSTRAINT photos_album_id_albums_id_fk
      FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE SET NULL
    `;
    results.push("Added FK: photos.album_id → albums.id ON DELETE SET NULL");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("already exists")) {
      results.push("FK photos_album_id_albums_id_fk: already exists (skipped)");
    } else {
      results.push(`FK update: ${msg}`);
    }
  }

  try {
    // Step 3: Create photo_comments table
    await sql`
      CREATE TABLE IF NOT EXISTS photo_comments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        parent_id UUID,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    results.push("Created table: photo_comments");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("already exists")) {
      results.push("photo_comments: already exists (skipped)");
    } else {
      results.push(`photo_comments: ${msg}`);
    }
  }

  return NextResponse.json({ results });
}
