import { eq, and, isNull, lt, or, sql } from "drizzle-orm";
import { db } from "../connection";
import { users } from "../schema/users";
import type { User } from "../schema/users";

// Re-export the type for use in services
export type { User };

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  name: string;
}

export interface UpdateUserInput {
  name?: string;
  avatarUrl?: string | null;
  timezone?: string;
  locale?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Repository for user data access.
 *
 * All database operations for the users table are centralized here.
 * Services should never access the database directly.
 */
export const usersRepository = {
  /**
   * Find a user by their email address.
   * Excludes soft-deleted users by default.
   */
  async findByEmail(email: string): Promise<typeof users.$inferSelect | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    return result[0];
  },

  /**
   * Find a user by their ID.
   * Excludes soft-deleted users by default.
   */
  async findById(id: string): Promise<typeof users.$inferSelect | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);

    return result[0];
  },

  /**
   * Create a new user.
   */
  async create(input: CreateUserInput): Promise<typeof users.$inferSelect> {
    const result = await db
      .insert(users)
      .values({
        email: input.email,
        passwordHash: input.passwordHash,
        name: input.name,
      })
      .returning();

    return result[0];
  },

  /**
   * Update a user's profile information.
   */
  async update(id: string, input: UpdateUserInput): Promise<typeof users.$inferSelect | undefined> {
    const result = await db
      .update(users)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .returning();

    return result[0];
  },

  /**
   * Soft delete a user (GDPR compliance).
   */
  async softDelete(id: string): Promise<void> {
    await db
      .update(users)
      .set({
        deletedAt: new Date(),
        email: sql`CONCAT('deleted-', ${id}, '-', email)`, // Anonymize email
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  },

  /**
   * Increment failed login attempts counter.
   */
  async incrementFailedAttempts(id: string): Promise<void> {
    await db
      .update(users)
      .set({
        failedLoginAttempts: sql`failed_login_attempts + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  },

  /**
   * Reset failed login attempts counter and update last login timestamp.
   */
  async resetFailedAttempts(id: string): Promise<void> {
    await db
      .update(users)
      .set({
        failedLoginAttempts: 0,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  },

  /**
   * Lock an account until a specified time.
   */
  async lockUntil(id: string, until: Date): Promise<void> {
    await db
      .update(users)
      .set({
        lockedUntil: until,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  },

  /**
   * Unlock an account.
   */
  async unlock(id: string): Promise<void> {
    await db
      .update(users)
      .set({
        lockedUntil: null,
        failedLoginAttempts: 0,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  },

  /**
   * Check if an account is locked.
   */
  async isLocked(id: string): Promise<boolean> {
    const result = await db
      .select({ lockedUntil: users.lockedUntil })
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);

    if (!result[0]?.lockedUntil) return false;
    return new Date(result[0].lockedUntil) > new Date();
  },

  /**
   * Set password reset token.
   */
  async setPasswordResetToken(id: string, token: string, expiresAt: Date): Promise<void> {
    await db
      .update(users)
      .set({
        passwordResetToken: token,
        passwordResetExpires: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  },

  /**
   * Clear password reset token.
   */
  async clearPasswordResetToken(id: string): Promise<void> {
    await db
      .update(users)
      .set({
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  },

  /**
   * Update password hash and record the change.
   */
  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await db
      .update(users)
      .set({
        passwordHash,
        lastPasswordChangeAt: new Date(),
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  },

  /**
   * Mark email as verified.
   */
  async verifyEmail(id: string): Promise<void> {
    await db
      .update(users)
      .set({
        emailVerified: true,
        emailVerifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  },

  /**
   * Find users with expired lockouts (for background job).
   */
  async findExpiredLockouts(): Promise<Array<typeof users.$inferSelect>> {
    return db
      .select()
      .from(users)
      .where(
        and(
          isNull(users.deletedAt),
          or(
            lt(users.lockedUntil, new Date()),
            isNull(users.lockedUntil),
          ),
        ),
      );
  },
};