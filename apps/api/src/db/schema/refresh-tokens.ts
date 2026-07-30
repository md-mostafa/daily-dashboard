import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Refresh tokens table
 *
 * Stores refresh token hashes for session management and token rotation.
 *
 * Design decisions:
 * - token_hash stores SHA-256 hash of the raw refresh token.
 * - family_id groups related tokens for rotation tracking.
 * - device_fingerprint binds tokens to specific devices.
 * - revoked_at is NULL for active tokens.
 * - Expired tokens are cleaned up by a background job.
 */
export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 255 }).notNull(),
    deviceFingerprint: varchar("device_fingerprint", { length: 255 }),
    userAgent: text("user_agent"),
    ipAddress: varchar("ip_address", { length: 45 }), // IPv6 max length
    familyId: uuid("family_id").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_refresh_tokens_token_hash").on(table.tokenHash),
    index("idx_refresh_tokens_user_id").on(table.userId),
    index("idx_refresh_tokens_family_id").on(table.familyId),
    index("idx_refresh_tokens_expires_at").on(table.expiresAt),
    index("idx_refresh_tokens_user_id_expires_at").on(table.userId, table.expiresAt),
  ],
);