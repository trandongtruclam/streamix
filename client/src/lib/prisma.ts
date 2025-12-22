import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
  pool: Pool;
};

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create a connection pool for better connection management
const pool =
  globalForPrisma.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Increase timeouts for Supabase/serverless databases
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 20, // Maximum number of clients in the pool
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pool = pool;
}

// Create the PrismaPg adapter with the Pool instance
const adapter = new PrismaPg(pool);

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
