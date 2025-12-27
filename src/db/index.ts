import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  var cachedPrisma: PrismaClient | undefined;
  var cachedPool: Pool | undefined;
}

const globalForPrisma = globalThis as unknown as {
  cachedPrisma: PrismaClient | undefined;
  cachedPool: Pool | undefined;
};

const pool =
  globalForPrisma.cachedPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.cachedPool = pool;
}

const adapter = new PrismaPg(pool);

const prisma =
  globalForPrisma.cachedPrisma ??
  new PrismaClient({
    // @ts-expect-error - Prisma 7 adapter type definition issue
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.cachedPrisma = prisma;
}

export const db = prisma;
