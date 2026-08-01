import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from "@nestjs/common";
import { PasswordService } from "./services/password.service";
import { TokenService } from "./services/token.service";
import { usersRepository } from "../db/repositories/users.repository";
import { refreshTokensRepository } from "../db/repositories/refresh-tokens.repository";
import { auditLogsRepository } from "../db/repositories/audit-logs.repository";
import { emailVerificationsRepository } from "../db/repositories/email-verifications.repository";
import { db } from "../db/connection";
import { users as usersTable } from "../db/schema/users";
import { eq } from "drizzle-orm";
import type { RegisterDto } from "./dto/register.dto";
import type { LoginDto } from "./dto/login.dto";
import type { AuthResponse } from "./interfaces/auth-response.interface";
import { randomUUID } from "crypto";

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Register a new user account.
   */
  async register(dto: RegisterDto, ipAddress: string, userAgent?: string): Promise<AuthResponse> {
    const existing = await usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const passwordHash = await this.passwordService.hash(dto.password);

    let user: Awaited<ReturnType<typeof usersRepository.create>>;
    try {
      user = await usersRepository.create({
        email: dto.email,
        passwordHash,
        name: dto.name,
      });
    } catch (error) {
      if ((error as { code?: string }).code === "23505") {
        throw new ConflictException("Email already registered");
      }
      throw new InternalServerErrorException("Failed to create account");
    }

    const authResponse = await this.generateAuthResponse(user.id, user.email, ipAddress, userAgent);

    await auditLogsRepository.create({
      userId: user.id,
      eventType: "REGISTRATION",
      email: user.email,
      ipAddress,
      userAgent,
      outcome: "SUCCESS",
    });

    return authResponse;
  }

  /**
   * Authenticate a user with email and password.
   *
   * Flow:
   * 1. Find user by email
   * 2. Check if account is locked
   * 3. Verify password
   * 4. Handle failed attempt
   * 5. Reset failed attempts on success
   * 6. Generate token pair
   * 7. Log the login event
   */
  async login(dto: LoginDto, ipAddress: string, userAgent?: string): Promise<AuthResponse> {
    const user = await usersRepository.findByEmail(dto.email);

    // Use constant-time response to prevent email enumeration
    if (!user) {
      // Simulate bcrypt comparison to maintain constant time
      await this.passwordService.compare(dto.password, "$2b$12$0000000000000000000000000000000000000000000");
      throw new UnauthorizedException("Invalid email or password");
    }

    // Check if account is locked
    const isLocked = await usersRepository.isLocked(user.id);
    if (isLocked) {
      await auditLogsRepository.create({
        userId: user.id,
        eventType: "LOGIN_FAILURE",
        email: user.email,
        ipAddress,
        userAgent,
        outcome: "FAILURE",
        failureReason: "ACCOUNT_LOCKED",
      });
      throw new UnauthorizedException("Account is temporarily locked. Please try again later.");
    }

    // Verify password
    const isPasswordValid = await this.passwordService.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      // Increment failed attempts
      await usersRepository.incrementFailedAttempts(user.id);

      // Check if we need to lock the account
      const updatedUser = await usersRepository.findById(user.id);
      if (updatedUser && updatedUser.failedLoginAttempts >= 5) {
        const lockoutDuration = this.getLockoutDuration(updatedUser.failedLoginAttempts);
        await usersRepository.lockUntil(user.id, new Date(Date.now() + lockoutDuration));
      }

      await auditLogsRepository.create({
        userId: user.id,
        eventType: "LOGIN_FAILURE",
        email: user.email,
        ipAddress,
        userAgent,
        outcome: "FAILURE",
        failureReason: "INVALID_PASSWORD",
      });

      throw new UnauthorizedException("Invalid email or password");
    }

    // Success - reset failed attempts
    await usersRepository.resetFailedAttempts(user.id);

    const authResponse = await this.generateAuthResponse(user.id, user.email, ipAddress, userAgent);

    await auditLogsRepository.create({
      userId: user.id,
      eventType: "LOGIN_SUCCESS",
      email: user.email,
      ipAddress,
      userAgent,
      outcome: "SUCCESS",
    });

    return authResponse;
  }

  /**
   * Generate an access + refresh token pair for a user.
   */
  private async generateAuthResponse(
    userId: string,
    email: string,
    ipAddress: string,
    userAgent?: string,
  ): Promise<AuthResponse> {
    const accessToken = await this.tokenService.generateAccessToken({
      sub: userId,
      email,
    });

    const { hash: refreshTokenHash } = this.tokenService.generateRefreshToken();
    const familyId = randomUUID();

    // Check max active tokens (LRU eviction)
    const activeCount = await refreshTokensRepository.countActiveForUser(userId);
    if (activeCount >= 10) {
      const oldest = await refreshTokensRepository.findOldestForUser(userId);
      if (oldest) {
        await refreshTokensRepository.revoke(oldest.id);
      }
    }

    await refreshTokensRepository.create({
      userId,
      tokenHash: refreshTokenHash,
      deviceFingerprint: userAgent ?? undefined,
      userAgent: userAgent ?? undefined,
      ipAddress,
      familyId,
      expiresAt: new Date(Date.now() + this.tokenService.getRefreshTokenTtl() * 1000),
    });

    const user = await usersRepository.findById(userId);

    return {
      accessToken,
      expiresIn: this.tokenService.getAccessTokenTtl(),
      user: {
        id: userId,
        email,
        name: user?.name ?? "Unknown",
        avatar: user?.avatarUrl ?? null,
        emailVerified: user?.emailVerified ?? false,
      },
    };
  }

  /**
   * Logout by revoking a specific refresh token.
   */
  async logout(rawRefreshToken: string, ipAddress: string, userAgent?: string): Promise<void> {
    if (!rawRefreshToken) return;

    const tokenHash = this.tokenService.hashRefreshToken(rawRefreshToken);
    const storedToken = await refreshTokensRepository.findByHash(tokenHash);

    if (storedToken) {
      await refreshTokensRepository.revoke(storedToken.id);

      await auditLogsRepository.create({
        userId: storedToken.userId,
        eventType: "LOGOUT",
        ipAddress,
        userAgent,
        outcome: "SUCCESS",
      });
    }
  }

  /**
   * Logout from all devices by revoking all refresh tokens for a user.
   */
  async logoutAll(userId: string, ipAddress: string, userAgent?: string): Promise<void> {
    await refreshTokensRepository.revokeAllForUser(userId);

    await auditLogsRepository.create({
      userId,
      eventType: "LOGOUT",
      ipAddress,
      userAgent,
      outcome: "SUCCESS",
      metadata: { allDevices: true },
    });
  }

  /**
   * Refresh an access token using a refresh token.
   *
   * Flow:
   * 1. Hash the incoming refresh token
   * 2. Find the stored token by hash
   * 3. If not found, possible theft - revoke family
   * 4. Check if token is expired or revoked
   * 5. Rotate: delete old, create new
   * 6. Log the refresh event
   */
  async refreshToken(
    rawRefreshToken: string,
    ipAddress: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const tokenHash = this.tokenService.hashRefreshToken(rawRefreshToken);
    const storedToken = await refreshTokensRepository.findByHash(tokenHash);

    if (!storedToken) {
      // Token not found - could be already rotated (possible theft)
      // Check if a token with this hash ever existed (revoked/expired)
      throw new UnauthorizedException("Invalid refresh token");
    }

    // Check if token is revoked
    if (storedToken.revokedAt) {
      // Possible token theft - revoke all tokens in this family
      await refreshTokensRepository.revokeFamily(storedToken.familyId);
      await auditLogsRepository.create({
        userId: storedToken.userId,
        eventType: "TOKEN_REVOKE",
        ipAddress,
        userAgent,
        outcome: "FAILURE",
        failureReason: "TOKEN_COMPROMISED",
      });
      throw new UnauthorizedException("Token has been revoked. Please log in again.");
    }

    // Rotate: revoke old token
    await refreshTokensRepository.revoke(storedToken.id);

    // Generate new token pair
    const accessToken = await this.tokenService.generateAccessToken({
      sub: storedToken.userId,
      email: (await usersRepository.findById(storedToken.userId))?.email ?? "",
    });

    const { hash: newTokenHash } = this.tokenService.generateRefreshToken();

    await refreshTokensRepository.create({
      userId: storedToken.userId,
      tokenHash: newTokenHash,
      deviceFingerprint: userAgent ?? undefined,
      userAgent: userAgent ?? undefined,
      ipAddress,
      familyId: storedToken.familyId, // Same family for rotation tracking
      expiresAt: new Date(Date.now() + this.tokenService.getRefreshTokenTtl() * 1000),
    });

    await auditLogsRepository.create({
      userId: storedToken.userId,
      eventType: "TOKEN_REFRESH",
      ipAddress,
      userAgent,
      outcome: "SUCCESS",
    });

    return {
      accessToken,
      expiresIn: this.tokenService.getAccessTokenTtl(),
    };
  }

  /**
   * Verify a user's email address using a verification token.
   */
  async verifyEmail(token: string, ipAddress: string, userAgent?: string): Promise<void> {
    const tokenHash = this.tokenService.hashRefreshToken(token);
    const verification = await emailVerificationsRepository.findByToken(tokenHash);

    if (!verification) {
      throw new UnauthorizedException("Invalid verification token");
    }

    if (verification.verifiedAt) {
      throw new ConflictException("Email already verified");
    }

    if (new Date() > verification.expiresAt) {
      throw new UnauthorizedException("Verification token has expired");
    }

    // Mark as verified
    await emailVerificationsRepository.verify(verification.id);
    await usersRepository.verifyEmail(verification.userId);

    await auditLogsRepository.create({
      userId: verification.userId,
      eventType: "EMAIL_VERIFICATION",
      email: verification.email,
      ipAddress,
      userAgent,
      outcome: "SUCCESS",
    });
  }

  /**
   * Request a password reset email.
   * Always returns success to prevent email enumeration.
   */
  async forgotPassword(email: string, ipAddress: string, userAgent?: string): Promise<void> {
    const user = await usersRepository.findByEmail(email);

    if (user) {
      // Generate reset token
      const { hash: tokenHash } = this.tokenService.generateRefreshToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await usersRepository.setPasswordResetToken(user.id, tokenHash, expiresAt);

      await auditLogsRepository.create({
        userId: user.id,
        eventType: "PASSWORD_RESET_REQUEST",
        email: user.email,
        ipAddress,
        userAgent,
        outcome: "SUCCESS",
      });

      // TODO: Send email with reset link containing the raw token
      // await this.emailService.sendPasswordReset(user.email, rawToken);
    }

    // Always return success to prevent email enumeration
  }

  /**
   * Reset password using a reset token.
   */
  async resetPassword(
    token: string,
    newPassword: string,
    ipAddress: string,
    userAgent?: string,
  ): Promise<void> {
    const tokenHash = this.tokenService.hashRefreshToken(token);

    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.passwordResetToken, tokenHash))
      .limit(1);

    const user = result[0];

    if (!user) {
      throw new UnauthorizedException("Invalid or expired reset token");
    }

    if (!user.passwordResetExpires || new Date() > user.passwordResetExpires) {
      throw new UnauthorizedException("Reset token has expired");
    }

    // Hash new password
    const passwordHash = await this.passwordService.hash(newPassword);

    // Update password and clear reset token
    await usersRepository.updatePassword(user.id, passwordHash);

    // Revoke all existing sessions
    await refreshTokensRepository.revokeAllForUser(user.id);

    await auditLogsRepository.create({
      userId: user.id,
      eventType: "PASSWORD_RESET_COMPLETE",
      email: user.email,
      ipAddress,
      userAgent,
      outcome: "SUCCESS",
    });
  }

  /**
   * Verify an access token and return its payload.
   */
  async verifyToken(token: string) {
    return this.tokenService.verifyAccessToken(token);
  }

  /**
   * Calculate lockout duration based on failed attempt count.
   * Exponential backoff: 5→15min, 10→1hr, 15→24hr, 20→permanent
   */
  private getLockoutDuration(failedAttempts: number): number {
    if (failedAttempts >= 20) return 365 * 24 * 60 * 60 * 1000; // ~permanent
    if (failedAttempts >= 15) return 24 * 60 * 60 * 1000; // 24 hours
    if (failedAttempts >= 10) return 60 * 60 * 1000; // 1 hour
    return 15 * 60 * 1000; // 15 minutes
  }
}
