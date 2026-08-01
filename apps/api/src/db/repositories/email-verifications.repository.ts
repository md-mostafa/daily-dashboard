import { eq, and, isNull } from "drizzle-orm";
import { db } from "../connection";
import { emailVerifications } from "../schema/email-verifications";

export const emailVerificationsRepository = {
  async findByToken(token: string) {
    const result = await db
      .select()
      .from(emailVerifications)
      .where(eq(emailVerifications.token, token))
      .limit(1);
    return result[0];
  },

  async create(input: {
    userId: string;
    token: string;
    email: string;
    expiresAt: Date;
  }) {
    const result = await db
      .insert(emailVerifications)
      .values(input)
      .returning();
    return result[0];
  },

  async verify(id: string) {
    await db
      .update(emailVerifications)
      .set({ verifiedAt: new Date() })
      .where(eq(emailVerifications.id, id));
  },

  async deleteExpired() {
    const result = await db
      .delete(emailVerifications)
      .where(eq(emailVerifications.expiresAt, new Date()))
      .returning({ id: emailVerifications.id });
    return result.length;
  },
};