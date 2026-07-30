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
import { refreshTokens } from "./refresh-tokens";

/**
 * User sessions table
 *
 * Provides a user-facing view of active sessions for session management UI.
 * This is a denormalized view of active refresh tokens, optimized for display.
 *
 * Design decisions:
 * - device_name, device_type, browser, os are parsed from user agent.
 * - location is derived from IP address (optional, via GeoIP).
 * - last_active_at is updated on each token refresh.
 */
export const userSessions = pgTable(
  "user_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    refreshTokenId: uuid("refresh_token_id")
      .notNull()
      .references(() => refreshTokens.id, { onDelete: "cascade" }),
    deviceName: varchar("device_name", { length: 255 }),
    deviceType: varchar("device_type", { length: 50 }),
    browser: varchar("browser", { length: 100 }),
    os: varchar("os", { length: 100 }),
    ipAddress: varchar("ip_address", { length: 45 }),
    location: varchar("location", { length: 255 }),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_user_sessions_user_id").on(table.userId),
    uniqueIndex("idx_user_sessions_refresh_token_id").on(table.refreshTokenId),
    index("idx_user_sessions_last_active").on(table.lastActiveAt),
  ],
);