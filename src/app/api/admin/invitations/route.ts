import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { invitations } from "@/db/schema";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function generateCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const list = await db
    .select({
      id: invitations.id,
      code: invitations.code,
      email: invitations.email,
      role: invitations.role,
      maxUses: invitations.maxUses,
      useCount: invitations.useCount,
      usedAt: invitations.usedAt,
      expiresAt: invitations.expiresAt,
      invitedBy: invitations.invitedBy,
    })
    .from(invitations)
    .orderBy(desc(invitations.expiresAt));

  return NextResponse.json({ invitations: list });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const email = body.email || null;
  const role = body.role || "member";
  const maxUses = Math.max(1, Math.min(Number(body.maxUses) || 1, 100));
  const expiresInDays = body.expiresInDays ?? 30;

  const code = generateCode();
  const expiresAt = new Date(
    Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
  );

  await db.insert(invitations).values({
    code,
    email,
    role,
    maxUses,
    invitedBy: session.sub,
    expiresAt,
  });

  const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "";
  const url = `${baseUrl}/register?code=${code}`;

  return NextResponse.json({ code, url, maxUses, expiresAt: expiresAt.toISOString() });
}
