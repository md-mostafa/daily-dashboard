import { Injectable, UnauthorizedException } from "@nestjs/common";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { randomUUID } from "crypto";
import { createHash } from "crypto";

export interface TokenPayload extends JWTPayload {
  sub: string;
  email: string;
}

@Injectable()
export class TokenService {
  private readonly accessTokenSecret: Uint8Array;
  private readonly refreshTokenSecret: Uint8Array;
  private readonly accessTokenTtl = 900; // 15 minutes
  private readonly refreshTokenTtl = 604800; // 7 days

  constructor() {
    const accessSecret = process.env.JWT_ACCESS_SECRET ?? "access-secret-change-in-production-min-32-chars!!";
    const refreshSecret = process.env.JWT_REFRESH_SECRET ?? "refresh-secret-change-in-production-min-32-chars!";
    this.accessTokenSecret = new TextEncoder().encode(accessSecret);
    this.refreshTokenSecret = new TextEncoder().encode(refreshSecret);
  }

  /**
   * Generate a signed JWT access token.
   */
  async generateAccessToken(payload: { sub: string; email: string }): Promise<string> {
    const jti = randomUUID();
    return new SignJWT({ sub: payload.sub, email: payload.email } satisfies TokenPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setJti(jti)
      .setIssuedAt()
      .setExpirationTime(`${this.accessTokenTtl}s`)
      .sign(this.accessTokenSecret);
  }

  /**
   * Generate an opaque refresh token (cryptographically random).
   * Returns both the raw token and its SHA-256 hash.
   */
  generateRefreshToken(): { raw: string; hash: string } {
    const raw = randomUUID() + randomUUID() + randomUUID();
    const hash = createHash("sha256").update(raw).digest("hex");
    return { raw, hash };
  }

  /**
   * Verify and decode an access token.
   */
  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const { payload } = await jwtVerify(token, this.accessTokenSecret);
      return payload as TokenPayload;
    } catch {
      throw new UnauthorizedException("Invalid or expired access token");
    }
  }

  /**
   * Hash a refresh token for storage/comparison.
   */
  hashRefreshToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  getAccessTokenTtl(): number {
    return this.accessTokenTtl;
  }

  getRefreshTokenTtl(): number {
    return this.refreshTokenTtl;
  }
}