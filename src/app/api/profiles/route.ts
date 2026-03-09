import { NextRequest, NextResponse } from "next/server";
import { and, ilike, isNotNull, ne, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const search = req.nextUrl.searchParams.get("search");
  const completed = req.nextUrl.searchParams.get("completed");

  let query = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      company: users.company,
      position: users.position,
      industry: users.industry,
      interests: users.interests,
      bio: users.bio,
      github: users.github,
      portfolio: users.portfolio,
      linkedin: users.linkedin,
      careers: users.careers,
      avatarUrl: users.avatarUrl,
      role: users.role,
    })
    .from(users)
    .$dynamic();

  const conditions = [];

  if (completed === "true") {
    conditions.push(
      isNotNull(users.company),
      ne(users.company, ""),
      isNotNull(users.position),
      ne(users.position, ""),
      isNotNull(users.bio),
      ne(users.bio, ""),
    );
  }

  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      or(
        ilike(users.name, pattern),
        ilike(users.company, pattern),
        ilike(users.industry, pattern),
      ),
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const profiles = await query.orderBy(users.name);

  return NextResponse.json({ profiles });
}
