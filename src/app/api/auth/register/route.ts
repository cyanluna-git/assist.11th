import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users, invitations } from "@/db/schema";
import { signToken, createSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { code, name, email, password } = await req.json();

    if (!code || !name || !email || !password) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 6자 이상이어야 합니다." },
        { status: 400 },
      );
    }

    // Validate invite code
    const invitation = await db
      .select()
      .from(invitations)
      .where(eq(invitations.code, code))
      .then((rows) => rows[0] ?? null);

    if (!invitation) {
      return NextResponse.json(
        { error: "유효하지 않은 초대코드입니다." },
        { status: 400 },
      );
    }

    if (invitation.useCount >= invitation.maxUses) {
      return NextResponse.json(
        { error: "초대코드 사용 횟수가 초과되었습니다." },
        { status: 400 },
      );
    }

    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "만료된 초대코드입니다." },
        { status: 400 },
      );
    }

    // Check email duplicate
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .then((rows) => rows[0] ?? null);

    if (existing) {
      return NextResponse.json(
        { error: "이미 등록된 이메일입니다." },
        { status: 409 },
      );
    }

    // Create user
    const hashedPassword = await hash(password, 12);
    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role: invitation.role,
      })
      .returning({ id: users.id, email: users.email, name: users.name, role: users.role })
      .then((rows) => rows[0]);

    // Increment usage count
    await db
      .update(invitations)
      .set({
        useCount: invitation.useCount + 1,
        usedAt: new Date(),
      })
      .where(eq(invitations.id, invitation.id));

    // Auto-login
    const token = await signToken({
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    const response = NextResponse.json({
      user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
    });

    const cookie = createSessionCookie(token);
    response.cookies.set(cookie.name, cookie.value, {
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      path: cookie.path,
      maxAge: cookie.maxAge,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
