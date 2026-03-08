import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { users } from "./schema";

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  const adminEmail = "pjy8412@gmail.com";
  const adminPassword = await hash("alskqp10", 12);

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, adminEmail))
    .then((rows) => rows[0] ?? null);

  if (existing) {
    await db
      .update(users)
      .set({ password: adminPassword, role: "admin" })
      .where(eq(users.email, adminEmail));
    console.log(`Admin updated: ${adminEmail}`);
  } else {
    await db.insert(users).values({
      name: "Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });
    console.log(`Admin created: ${adminEmail}`);
  }

  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
