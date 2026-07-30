import { relations } from "drizzle-orm";
import { userSessions } from "../user-sessions";
import { users } from "../users";
import { refreshTokens } from "../refresh-tokens";

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
  refreshToken: one(refreshTokens, {
    fields: [userSessions.refreshTokenId],
    references: [refreshTokens.id],
  }),
}));