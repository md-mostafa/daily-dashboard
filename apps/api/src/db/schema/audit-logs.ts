import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Audit logs table
 *
 * Immutable audit trail for all authentication events.
 * This is an append-only table. Records are never modified.
 *
 * Design decisions:
 * - event_type is a string enum: LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT,
 *   TOKEN_REFRESH, TOKEN_REVOKE, PASSWORD_CHANGE, PASSWORD_RESET_REQUEST,
 *   PASSWORD_RESET_COMPLETE, EMAIL_VERIFICATION, EMAIL_CHANGE,
 *   ACCOUNT_LOCKED, ACCOUNT_UNLOCKED, REGISTRATION, MFA_ENABLED, MFA_DISABLED.
 * - metadata is JSONB for event-specific data.
 * - Retention managed by background job (90 days default, 1 year for password changes).
 */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    eventType: varchar("event_type", { length: 50 }).notNull(),
    email: varchar("email", { length: 255 }),
    ipAddress: varchar("ip_address", { length: 45 }).notNull(),
    userAgent: text("user_agent"),
    metadata: jsonb("metadata").notNull().default({}),
    outcome: varchar("outcome", { length: 20 }).notNull(),
    failureReason: varchar("failure_reason", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_audit_logs_user_id").on(table.userId),
    index("idx_audit_logs_event_type").on(table.eventType),
    index("idx_audit_logs_created_at").on(table.createdAt),
    index("idx_audit_logs_user_id_event_type_created").on(
      table.userId,
      table.eventType,
      table.createdAt,
    ),
  ],
);