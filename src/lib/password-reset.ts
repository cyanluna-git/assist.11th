import { SignJWT, jwtVerify } from "jose";

const PASSWORD_RESET_EXPIRY = "1h";
const PASSWORD_RESET_PURPOSE = "password-reset";

interface PasswordResetPayload {
  sub: string;
  email: string;
  purpose: string;
}

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }

  return new TextEncoder().encode(secret);
}

export async function signPasswordResetToken(payload: {
  sub: string;
  email: string;
}) {
  return new SignJWT({
    email: payload.email,
    purpose: PASSWORD_RESET_PURPOSE,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(PASSWORD_RESET_EXPIRY)
    .sign(getSecret());
}

export async function verifyPasswordResetToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const parsed = payload as unknown as PasswordResetPayload;

    if (
      parsed.purpose !== PASSWORD_RESET_PURPOSE ||
      typeof parsed.sub !== "string" ||
      typeof parsed.email !== "string"
    ) {
      return null;
    }

    return {
      sub: parsed.sub,
      email: parsed.email,
    };
  } catch {
    return null;
  }
}
