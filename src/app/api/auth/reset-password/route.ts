import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { verifyPasswordResetToken } from "@/lib/password-reset";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "재설정 토큰이 필요합니다." },
        { status: 400 },
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 6자 이상이어야 합니다." },
        { status: 400 },
      );
    }

    const payload = await verifyPasswordResetToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "유효하지 않거나 만료된 링크입니다." },
        { status: 400 },
      );
    }

    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, payload.sub), eq(users.email, payload.email)))
      .then((rows) => rows[0] ?? null);

    if (!user) {
      return NextResponse.json(
        { error: "유효하지 않거나 만료된 링크입니다." },
        { status: 400 },
      );
    }

    const hashedPassword = await hash(password, 12);

    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, payload.sub));

    return NextResponse.json({ message: "비밀번호가 재설정되었습니다." });
  } catch {
    return NextResponse.json(
      { error: "비밀번호 재설정에 실패했습니다." },
      { status: 500 },
    );
  }
}
