import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { sendPasswordResetEmail } from "@/lib/email";
import { signPasswordResetToken } from "@/lib/password-reset";

export const dynamic = "force-dynamic";

const GENERIC_SUCCESS_MESSAGE =
  "가입된 이메일이라면 비밀번호 재설정 링크를 보냈습니다.";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "이메일을 입력해주세요." },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
      })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .then((rows) => rows[0] ?? null);

    if (!user?.email) {
      return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE });
    }

    const token = await signPasswordResetToken({
      sub: user.id,
      email: user.email,
    });

    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      token,
    });

    return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE });
  } catch {
    return NextResponse.json(
      { error: "비밀번호 재설정 메일을 보내지 못했습니다." },
      { status: 500 },
    );
  }
}
