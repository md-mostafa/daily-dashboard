import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

/**
 * Database connection configuration.
 *
 * Uses a connection pool for efficient connection management.
 * The pool is configured via environment variables with sensible defaults
 * for local development.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/daily_dashboard",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

/**
 * Drizzle ORM instance with typed schema.
 *
 * Usage:
 *   import { db } from "@/db/connection";
 *   const users = await db.select().from(schema.users);
 */
export const db = drizzle(pool, {
  schema,
  logger: process.env.NODE_ENV === "development",
});

/**
 * Get the underlying pool for testing or direct queries.
 */
export const getPool = () => pool;

/**
 * Close all database connections gracefully.
 * Should be called during application shutdown.
 */
export async function closeDatabase(): Promise<void> {
  await pool.end();
}