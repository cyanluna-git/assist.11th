import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const allowedFields: Record<string, unknown> = {};
  if (body.role && ["admin", "member", "professor"].includes(body.role)) {
    allowedFields.role = body.role;
  }

  if (Object.keys(allowedFields).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  await db.update(users).set(allowedFields).where(eq(users.id, id));

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  if (id === session.sub) {
    return NextResponse.json({ error: "자기 자신은 삭제할 수 없습니다." }, { status: 400 });
  }

  await db.delete(users).where(eq(users.id, id));

  return NextResponse.json({ success: true });
}
