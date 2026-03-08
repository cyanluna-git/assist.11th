import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/db/schema";

const sql = neon(
  (process.env.DATABASE_URL ?? "").trim() ||
    "postgresql://build:build@ep-build-placeholder.us-east-2.aws.neon.tech/neondb",
);

export const db = drizzle(sql, { schema });
