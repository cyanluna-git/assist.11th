import assert from "node:assert/strict";
import test from "node:test";
import {
  signPasswordResetToken,
  verifyPasswordResetToken,
} from "@/lib/password-reset";

process.env.AUTH_SECRET ??= "test-auth-secret";

test("password reset tokens round-trip the user identity", async () => {
  const token = await signPasswordResetToken({
    sub: "user-1",
    email: "member@example.com",
  });

  const payload = await verifyPasswordResetToken(token);

  assert.deepEqual(payload, {
    sub: "user-1",
    email: "member@example.com",
  });
});

test("password reset token verification rejects malformed tokens", async () => {
  const payload = await verifyPasswordResetToken("not-a-real-token");
  assert.equal(payload, null);
});
