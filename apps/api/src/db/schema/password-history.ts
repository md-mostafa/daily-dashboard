import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Password history table
 *
 * Enforces password reuse policy (last 5 passwords).
 * This is an append-only table. Records are never updated.
 *
 * Design decisions:
 * - Stores bcrypt hashes of previous passwords. Plaintext never stored.
 * - Last 5 entries per user checked during password change.
 * - Old entries beyond 5 pruned by application logic.
 */
export const passwordHistory = pgTable(
  "password_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_password_history_user_id_created").on(table.userId, table.createdAt),
  ],
);