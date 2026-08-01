import {
  pgTable,
  uuid,
  varchar,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Users table
 *
 * Core user identity and authentication data.
 * Stores profile information and authentication-related fields.
 *
 * Design decisions:
 * - password_hash is stored here (not separate) since we only support one auth method.
 *   When OAuth is added, a user_identities table will be created.
 * - locked_until is nullable. NULL means not locked. Past timestamp also means not locked.
 * - failed_login_attempts is a denormalized counter for performance.
 * - deleted_at supports soft deletes for GDPR compliance.
 * - metadata is JSONB for extensible user attributes.
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    avatarUrl: varchar("avatar_url", { length: 500 }),
    emailVerified: boolean("email_verified").notNull().default(false),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    lastPasswordChangeAt: timestamp("last_password_change_at", { withTimezone: true }),
    passwordResetToken: varchar("password_reset_token", { length: 255 }),
    passwordResetExpires: timestamp("password_reset_expires", { withTimezone: true }),
    timezone: varchar("timezone", { length: 50 }).default("UTC"),
    locale: varchar("locale", { length: 10 }).default("en"),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("idx_users_email").on(table.email),
    index("idx_users_deleted_at").on(table.deletedAt),
    index("idx_users_created_at").on(table.createdAt),
  ],
);