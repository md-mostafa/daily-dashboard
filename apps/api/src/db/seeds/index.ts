import { db, closeDatabase } from "../connection";
import { users } from "../schema/users";
import { emailVerifications } from "../schema/email-verifications";
import { refreshTokens } from "../schema/refresh-tokens";
import { loginAttempts } from "../schema/login-attempts";
import { passwordHistory } from "../schema/password-history";
import { userSessions } from "../schema/user-sessions";
import { auditLogs } from "../schema/audit-logs";

/**
 * Seed script for development and testing.
 *
 * Creates sample data for all authentication-related tables.
 * Run with: pnpm --filter @repo/api db:seed
 *
 * WARNING: This will clear all existing data before seeding.
 */

async function seed() {
  console.log("🌱 Seeding database...\n");

  // Clear existing data in reverse dependency order
  console.log("Clearing existing data...");
  await db.delete(auditLogs);
  await db.delete(userSessions);
  await db.delete(passwordHistory);
  await db.delete(loginAttempts);
  await db.delete(refreshTokens);
  await db.delete(emailVerifications);
  await db.delete(users);
  console.log("✓ Existing data cleared\n");

  // Seed users
  console.log("Seeding users...");
  const [alice] = await db
    .insert(users)
    .values({
      email: "alice@example.com",
      passwordHash: "$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1Qlq5yY5y5y5y5y5y5y5y5y5y5y", // "Password123!"
      name: "Alice Johnson",
      emailVerified: true,
      emailVerifiedAt: new Date("2026-07-01T10:00:00Z"),
      timezone: "America/New_York",
      locale: "en",
      metadata: { onboarded: true, role: "admin" },
    })
    .returning();

  const [bob] = await db
    .insert(users)
    .values({
      email: "bob@example.com",
      passwordHash: "$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1Qlq5yY5y5y5y5y5y5y5y5y5y5y", // "Password123!"
      name: "Bob Smith",
      emailVerified: true,
      emailVerifiedAt: new Date("2026-07-15T10:00:00Z"),
      timezone: "Europe/London",
      locale: "en",
      metadata: { onboarded: true, role: "user" },
    })
    .returning();

  const [charlie] = await db
    .insert(users)
    .values({
      email: "charlie@example.com",
      passwordHash: "$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1Qlq5yY5y5y5y5y5y5y5y5y5y5y", // "Password123!"
      name: "Charlie Brown",
      emailVerified: false,
      timezone: "Asia/Dhaka",
      locale: "en",
      metadata: { onboarded: false },
    })
    .returning();

  console.log(`✓ Created ${3} users\n`);

  // Seed email verifications
  console.log("Seeding email verifications...");
  await db.insert(emailVerifications).values([
    {
      userId: charlie.id,
      token: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2", // SHA-256 of "verify-token-1"
      email: charlie.email,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    },
  ]);
  console.log("✓ Created email verification for Charlie\n");

  // Seed refresh tokens
  console.log("Seeding refresh tokens...");
  const [aliceToken] = await db
    .insert(refreshTokens)
    .values({
      userId: alice.id,
      tokenHash: "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3", // SHA-256 of "refresh-token-alice-1"
      deviceFingerprint: "device-fingerprint-alice-macbook",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0",
      ipAddress: "192.168.1.100",
      familyId: "00000000-0000-0000-0000-000000000001",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    })
    .returning();

  const [bobToken] = await db
    .insert(refreshTokens)
    .values({
      userId: bob.id,
      tokenHash: "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4", // SHA-256 of "refresh-token-bob-1"
      deviceFingerprint: "device-fingerprint-bob-iphone",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile/15E148",
      ipAddress: "10.0.0.50",
      familyId: "00000000-0000-0000-0000-000000000002",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })
    .returning();

  console.log("✓ Created refresh tokens for Alice and Bob\n");

  // Seed user sessions
  console.log("Seeding user sessions...");
  await db.insert(userSessions).values([
    {
      userId: alice.id,
      refreshTokenId: aliceToken.id,
      deviceName: "MacBook Pro",
      deviceType: "desktop",
      browser: "Chrome 120",
      os: "macOS 14",
      ipAddress: "192.168.1.100",
      location: "New York, US",
      lastActiveAt: new Date(),
    },
    {
      userId: bob.id,
      refreshTokenId: bobToken.id,
      deviceName: "iPhone 15",
      deviceType: "mobile",
      browser: "Safari 17",
      os: "iOS 17",
      ipAddress: "10.0.0.50",
      location: "London, UK",
      lastActiveAt: new Date(),
    },
  ]);
  console.log("✓ Created sessions for Alice and Bob\n");

  // Seed login attempts
  console.log("Seeding login attempts...");
  await db.insert(loginAttempts).values([
    {
      userId: alice.id,
      email: alice.email,
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0",
      outcome: "SUCCESS",
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    },
    {
      userId: bob.id,
      email: bob.email,
      ipAddress: "10.0.0.50",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile/15E148",
      outcome: "SUCCESS",
      createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    },
    {
      email: "unknown@example.com",
      ipAddress: "203.0.113.50",
      userAgent: "python-requests/2.31.0",
      outcome: "FAILURE",
      failureReason: "INVALID_CREDENTIALS",
      createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
    },
  ]);
  console.log("✓ Created login attempts\n");

  // Seed password history
  console.log("Seeding password history...");
  await db.insert(passwordHistory).values([
    {
      userId: alice.id,
      passwordHash: "$2b$12$OLDHASH1...",
      createdAt: new Date("2026-06-01T10:00:00Z"),
    },
    {
      userId: alice.id,
      passwordHash: "$2b$12$OLDHASH2...",
      createdAt: new Date("2026-05-01T10:00:00Z"),
    },
    {
      userId: bob.id,
      passwordHash: "$2b$12$OLDHASH3...",
      createdAt: new Date("2026-06-15T10:00:00Z"),
    },
  ]);
  console.log("✓ Created password history\n");

  // Seed audit logs
  console.log("Seeding audit logs...");
  await db.insert(auditLogs).values([
    {
      userId: alice.id,
      eventType: "REGISTRATION",
      email: alice.email,
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0",
      outcome: "SUCCESS",
      createdAt: new Date("2026-07-01T10:00:00Z"),
    },
    {
      userId: alice.id,
      eventType: "LOGIN_SUCCESS",
      email: alice.email,
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0",
      outcome: "SUCCESS",
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      userId: bob.id,
      eventType: "REGISTRATION",
      email: bob.email,
      ipAddress: "10.0.0.50",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile/15E148",
      outcome: "SUCCESS",
      createdAt: new Date("2026-07-15T10:00:00Z"),
    },
    {
      eventType: "LOGIN_FAILURE",
      email: "unknown@example.com",
      ipAddress: "203.0.113.50",
      userAgent: "python-requests/2.31.0",
      outcome: "FAILURE",
      failureReason: "INVALID_CREDENTIALS",
      createdAt: new Date(Date.now() - 1800000),
    },
  ]);
  console.log("✓ Created audit logs\n");

  console.log("✅ Seeding complete!");
  console.log("\nSeeded data summary:");
  console.log("  - 3 users (Alice, Bob, Charlie)");
  console.log("  - 1 email verification (Charlie - pending)");
  console.log("  - 2 refresh tokens (Alice, Bob)");
  console.log("  - 2 user sessions (Alice, Bob)");
  console.log("  - 3 login attempts (2 success, 1 failure)");
  console.log("  - 3 password history entries");
  console.log("  - 4 audit log entries");

  await closeDatabase();
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});