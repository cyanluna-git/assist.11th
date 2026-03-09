import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db
    .select({
      name: users.name,
      company: users.company,
      position: users.position,
      bio: users.bio,
    })
    .from(users)
    .where(eq(users.id, session.sub))
    .then((rows) => rows[0] ?? null);

  const profileComplete = !!(user?.company && user?.position && user?.bio);

  return NextResponse.json({
    user: {
      id: session.sub,
      email: session.email,
      name: user?.name ?? session.name,
      role: session.role,
      profileComplete,
    },
  });
}
