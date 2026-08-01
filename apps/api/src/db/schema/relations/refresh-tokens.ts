import { relations } from "drizzle-orm";
import { refreshTokens } from "../refresh-tokens";
import { users } from "../users";
import { userSessions } from "../user-sessions";

export const refreshTokensRelations = relations(refreshTokens, ({ one, many }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
  sessions: many(userSessions),
}));