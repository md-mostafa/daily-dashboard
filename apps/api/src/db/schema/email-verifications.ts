import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Email verifications table
 *
 * Tracks email verification tokens for new registrations and email changes.
 *
 * Design decisions:
 * - token stores SHA-256 hash of the raw verification token.
 * - email is stored separately from user's current email to support email change flows.
 * - verified_at is NULL until verified. NULL means pending.
 * - Tokens expire after 24 hours (enforced by application + TTL index cleanup).
 */
export const emailVerifications = pgTable(
  "email_verifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_email_verifications_token").on(table.token),
    index("idx_email_verifications_user_id").on(table.userId),
    index("idx_email_verifications_expires_at").on(table.expiresAt),
  ],
);