import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
  pool: Pool;
  connectionTested: boolean;
};

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL environment variable is not set");
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

// Add error handling and logging for pool events
if (!globalForPrisma.pool) {
  pool.on("connect", () => {
    console.log("Database connection established successfully");
  });

  pool.on("error", (err) => {
    console.error("Database pool error:", err.message);
    console.error("Error details:", err);
  });

  pool.on("acquire", () => {
    // Connection acquired from pool (optional logging)
    if (process.env.NODE_ENV === "development") {
      console.log("Database connection acquired from pool");
    }
  });

  pool.on("remove", () => {
    // Connection removed from pool (optional logging)
    if (process.env.NODE_ENV === "development") {
      console.log("Database connection removed from pool");
    }
  });
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pool = pool;
}

// Test database connection
async function testConnection() {
  if (globalForPrisma.connectionTested) {
    return;
  }

  try {
    console.log("Testing database connection...");
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("Database connection test successful");
    globalForPrisma.connectionTested = true;
  } catch (error) {
    console.error("Database connection test failed:");
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    } else {
      console.error("Unknown error:", error);
    }
    // Don't throw here, let the app start and handle errors at query time
    globalForPrisma.connectionTested = false;
  }
}

// Test connection on startup (non-blocking)
if (typeof window === "undefined") {
  // Only run on server-side
  testConnection().catch((error) => {
    console.error("Failed to test database connection:", error);
  });
}

// Create the PrismaPg adapter with the Pool instance
const adapter = new PrismaPg(pool);

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Add Prisma error handling
if (!globalForPrisma.prisma) {
  // Handle Prisma connection errors and log status
  prisma
    .$connect()
    .then(() => {
      console.log("Prisma client connected to database");
    })
    .catch((error) => {
      console.error("Prisma failed to connect to database:");
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        const prismaError = error as Error & { code?: string };
        if (prismaError.code) {
          console.error("Error code:", prismaError.code);
        }
        if (error.stack) {
          console.error("Error stack:", error.stack);
        }
      } else {
        console.error("Unknown error:", error);
      }
    });
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
