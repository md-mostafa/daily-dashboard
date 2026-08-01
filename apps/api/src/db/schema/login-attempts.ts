import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Login attempts table
 *
 * Immutable audit log of all login attempts (successful and failed).
 * This is an append-only table. Records are never updated or deleted
 * (except for GDPR purges).
 *
 * Design decisions:
 * - email is stored separately from user_id because failed attempts may
 *   reference emails that don't exist (preventing email enumeration).
 * - user_id is nullable and uses ON DELETE SET NULL to preserve audit trail.
 * - outcome is a string enum: SUCCESS, FAILURE, LOCKED, RATE_LIMITED.
 */
export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    email: varchar("email", { length: 255 }).notNull(),
    ipAddress: varchar("ip_address", { length: 45 }).notNull(),
    userAgent: text("user_agent"),
    outcome: varchar("outcome", { length: 20 }).notNull(),
    failureReason: varchar("failure_reason", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_login_attempts_email_created").on(table.email, table.createdAt),
    index("idx_login_attempts_ip_created").on(table.ipAddress, table.createdAt),
    index("idx_login_attempts_user_id").on(table.userId),
    index("idx_login_attempts_created_at").on(table.createdAt),
  ],
);