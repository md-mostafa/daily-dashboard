import { relations } from "drizzle-orm";
import { users } from "../users";
import { emailVerifications } from "../email-verifications";
import { refreshTokens } from "../refresh-tokens";
import { loginAttempts } from "../login-attempts";
import { passwordHistory } from "../password-history";
import { userSessions } from "../user-sessions";
import { auditLogs } from "../audit-logs";

export const usersRelations = relations(users, ({ many, one }) => ({
  emailVerifications: many(emailVerifications),
  refreshTokens: many(refreshTokens),
  loginAttempts: many(loginAttempts),
  passwordHistory: many(passwordHistory),
  userSessions: many(userSessions),
  auditLogs: many(auditLogs),
}));