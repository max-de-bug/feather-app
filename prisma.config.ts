import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// For migrations, use direct connection (port 5432) instead of pooler (port 6543)
// Supabase pooler doesn't support migrations well

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
