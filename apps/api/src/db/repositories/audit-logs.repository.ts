import { db } from "../connection";
import { auditLogs } from "../schema/audit-logs";

export interface CreateAuditLogInput {
  userId?: string;
  eventType: string;
  email?: string;
  ipAddress: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  outcome: "SUCCESS" | "FAILURE";
  failureReason?: string;
}

/**
 * Repository for audit log data access.
 *
 * This is an append-only repository. Records are never updated or deleted
 * (except for GDPR purges by background jobs).
 */
export const auditLogsRepository = {
  /**
   * Create an audit log entry.
   */
  async create(input: CreateAuditLogInput): Promise<typeof auditLogs.$inferSelect> {
    const result = await db
      .insert(auditLogs)
      .values({
        userId: input.userId,
        eventType: input.eventType,
        email: input.email,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        metadata: input.metadata ?? {},
        outcome: input.outcome,
        failureReason: input.failureReason,
      })
      .returning();

    return result[0];
  },

  /**
   * Find audit logs for a user.
   */
  async findByUserId(userId: string, limit = 50): Promise<Array<typeof auditLogs.$inferSelect>> {
    return db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(auditLogs.createdAt)
      .limit(limit);
  },

  /**
   * Find audit logs by event type.
   */
  async findByEventType(eventType: string, limit = 100): Promise<Array<typeof auditLogs.$inferSelect>> {
    return db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.eventType, eventType))
      .orderBy(auditLogs.createdAt)
      .limit(limit);
  },

  /**
   * Delete audit logs older than the retention period.
   */
  async deleteOlderThan(retentionDays: number): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);

    const result = await db
      .delete(auditLogs)
      .where(auditLogs.createdAt.lt(cutoff))
      .returning({ id: auditLogs.id });

    return result.length;
  },
};