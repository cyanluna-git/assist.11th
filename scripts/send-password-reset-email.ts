import { neon } from "@neondatabase/serverless";
import { signPasswordResetToken } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";

async function main() {
  const name = process.argv[2]?.trim();

  if (!name) {
    throw new Error("Usage: npx tsx --env-file=.env.local scripts/send-password-reset-email.ts <name>");
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = neon(databaseUrl);
  const rows = await sql`
    select id, name, email
    from users
    where name = ${name}
    limit 1
  `;
  const user = rows[0];

  if (!user?.email) {
    throw new Error(`User not found or email missing: ${name}`);
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

  console.log(JSON.stringify({ sent: true, email: user.email }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
