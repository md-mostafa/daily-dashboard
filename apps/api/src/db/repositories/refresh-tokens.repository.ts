import { eq, and, isNull, lt, gte, desc, sql, inArray } from "drizzle-orm";
import { db } from "../connection";
import { refreshTokens } from "../schema/refresh-tokens";

export interface CreateRefreshTokenInput {
  userId: string;
  tokenHash: string;
  deviceFingerprint?: string;
  userAgent?: string;
  ipAddress?: string;
  familyId: string;
  expiresAt: Date;
}

/**
 * Repository for refresh token data access.
 */
export const refreshTokensRepository = {
  /**
   * Find a refresh token by its hash.
   */
  async findByHash(tokenHash: string): Promise<typeof refreshTokens.$inferSelect | undefined> {
    const result = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          isNull(refreshTokens.revokedAt),
          gte(refreshTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    return result[0];
  },

  /**
   * Create a new refresh token.
   */
  async create(input: CreateRefreshTokenInput): Promise<typeof refreshTokens.$inferSelect> {
    const result = await db
      .insert(refreshTokens)
      .values({
        userId: input.userId,
        tokenHash: input.tokenHash,
        deviceFingerprint: input.deviceFingerprint,
        userAgent: input.userAgent,
        ipAddress: input.ipAddress,
        familyId: input.familyId,
        expiresAt: input.expiresAt,
      })
      .returning();

    return result[0];
  },

  /**
   * Revoke a specific refresh token.
   */
  async revoke(id: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, id));
  },

  /**
   * Revoke all refresh tokens for a user.
   */
  async revokeAllForUser(userId: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(refreshTokens.userId, userId),
          isNull(refreshTokens.revokedAt),
        ),
      );
  },

  /**
   * Revoke all tokens in a family (for rotation theft detection).
   */
  async revokeFamily(familyId: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(refreshTokens.familyId, familyId),
          isNull(refreshTokens.revokedAt),
        ),
      );
  },

  /**
   * Count active tokens for a user.
   */
  async countActiveForUser(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.userId, userId),
          isNull(refreshTokens.revokedAt),
          gte(refreshTokens.expiresAt, new Date()),
        ),
      );

    return Number(result[0]?.count ?? 0);
  },

  /**
   * Find the oldest active token for a user (for LRU eviction).
   */
  async findOldestForUser(userId: string): Promise<typeof refreshTokens.$inferSelect | undefined> {
    const result = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.userId, userId),
          isNull(refreshTokens.revokedAt),
          gte(refreshTokens.expiresAt, new Date()),
        ),
      )
      .orderBy(refreshTokens.createdAt)
      .limit(1);

    return result[0];
  },

  /**
   * Delete expired tokens (for background cleanup job).
   */
  async deleteExpired(): Promise<number> {
    const result = await db
      .delete(refreshTokens)
      .where(lt(refreshTokens.expiresAt, new Date()))
      .returning({ id: refreshTokens.id });

    return result.length;
  },
};