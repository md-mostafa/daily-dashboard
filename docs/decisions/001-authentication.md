# Architecture Decision Record: Authentication System

## ADR-001: Authentication Architecture

**Status**: Accepted
**Date**: 2026-07-30
**Author**: Senior Staff Software Engineer

## Context

The Daily Dashboard application requires a secure, scalable authentication system suitable for a SaaS product. The system must support email/password authentication initially while providing a clear path toward OAuth2, MFA, and enterprise SSO.

Key constraints:
- Monorepo with NestJS backend and React frontend
- PostgreSQL for persistent storage
- Redis for caching and rate limiting
- Docker-based development environment
- Must be production-ready from day one

## Decision

### 1. Token Strategy: JWT Access + Opaque Refresh Tokens

**Decision**: Use short-lived JWT access tokens (15 min) with long-lived opaque refresh tokens (7 days) stored as hashes in PostgreSQL.

**Rationale**:
- **JWT for access tokens**: Stateless verification enables horizontal scaling without centralized session storage. The 15-minute TTL limits the damage window for stolen tokens.
- **Opaque tokens for refresh**: Refresh tokens are high-value credentials that should not be self-contained JWTs. Storing them as hashes in PostgreSQL means a database breach does not expose valid tokens.
- **Token rotation**: Each refresh invalidates the previous token, limiting the window for token theft.

**Alternatives Considered**:
- *Session-only (no JWT)*: Requires database lookup on every request, increasing latency and database load.
- *Long-lived JWT only*: No way to revoke tokens before expiry without a denylist.
- *JWT for both access and refresh*: Refresh tokens cannot be revoked if they are self-contained JWTs.

### 2. Signing Algorithm: RS256 (RSA with SHA-256)

**Decision**: Use asymmetric RS256 signing for JWTs.

**Rationale**:
- **Public/private key pair**: The private key signs tokens on the auth server, while any service can verify tokens using the public key. This enables microservice architecture where other services can verify tokens without calling the auth service.
- **Key rotation**: Public keys can be rotated via a JWKS endpoint without invalidating existing tokens.
- **No shared secret**: Unlike HS256 (symmetric), RS256 does not require sharing a secret between services.

**Alternatives Considered**:
- *HS256*: Simpler but requires sharing the secret with all services that need to verify tokens.
- *ES256*: More efficient than RSA but has smaller ecosystem support in Node.js.

### 3. Password Hashing: bcrypt with Cost Factor 12

**Decision**: Use bcrypt for password hashing with a cost factor of 12.

**Rationale**:
- **Adaptive cost**: bcrypt's cost factor can be increased as hardware improves, future-proofing against brute-force attacks.
- **Built-in salt**: bcrypt automatically generates and stores a unique salt per password.
- **Proven security**: bcrypt is the most widely deployed password hashing algorithm and has extensive cryptanalysis.
- **Cost factor 12**: On modern hardware, this takes ~250ms per hash, providing a good balance between security and user experience.

**Alternatives Considered**:
- *Argon2id*: More modern and resistant to side-channel attacks, but has fewer Node.js bindings and is more complex to configure.
- *scrypt*: Memory-hard but less widely supported than bcrypt in Node.js.
- *SHA-256 (salted)*: Fast to compute, making it vulnerable to GPU-based brute-force attacks.

### 4. Session Storage: Redis + PostgreSQL

**Decision**: Use Redis for active session cache and rate limiting, PostgreSQL for persistent token storage.

**Rationale**:
- **Redis for hot data**: Refresh token fingerprints, rate limit counters, and token denylists benefit from Redis's sub-millisecond latency.
- **PostgreSQL for cold data**: Token hashes, audit logs, and password history need durable, queryable storage.
- **Redis as cache, not source of truth**: If Redis goes down, the system degrades gracefully by falling back to PostgreSQL for token validation.

**Data Flow**:
1. Token creation: Write to PostgreSQL (source of truth) + Redis (cache).
2. Token validation: Check Redis first, fall back to PostgreSQL.
3. Token revocation: Delete from Redis + mark as revoked in PostgreSQL.

### 5. Refresh Token Rotation with Theft Detection

**Decision**: Implement refresh token rotation where each refresh invalidates the previous token. If a rotated token is reused, detect potential theft and revoke all user sessions.

**Rationale**:
- **Limited exposure**: Each refresh token is valid for exactly one use. An attacker who steals a token can only use it once.
- **Theft detection**: If the legitimate user's next refresh fails because the token was already used, the system can detect the theft and take action.
- **Family tracking**: Tokens are grouped into families to track the rotation chain.

**Implementation**:
```typescript
// Token family tracks rotation lineage
interface TokenFamily {
  familyId: UUID;
  currentTokenHash: string;
  previousTokenHash: string | null;
}
```

### 6. Rate Limiting: Sliding Window with Redis

**Decision**: Use a sliding window rate limiter implemented in Redis.

**Rationale**:
- **Sliding window**: More accurate than fixed window (no burst at window boundaries).
- **Redis Sorted Sets**: Natural fit for sliding window implementation with O(log N) complexity.
- **Per-endpoint limits**: Different limits for different auth endpoints (login is more restricted than refresh).

**Implementation**:
```typescript
// Sliding window rate limiter
async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Remove old entries
  await redis.zremrangebyscore(key, 0, windowStart);
  
  // Count entries in window
  const count = await redis.zcard(key);
  
  if (count >= limit) {
    return false; // Rate limited
  }
  
  // Add current request
  await redis.zadd(key, now, `${now}:${randomUUID()}`);
  await redis.expire(key, Math.ceil(windowMs / 1000));
  
  return true; // Allowed
}
```

### 7. Account Lockout: Exponential Backoff

**Decision**: Implement account lockout with exponential backoff based on consecutive failed attempts.

**Rationale**:
- **Progressive lockout**: Short lockout for minor suspicious activity, longer lockout for persistent attacks.
- **Exponential backoff**: 5 attempts → 15 min, 10 attempts → 1 hour, 15 attempts → 24 hours, 20 attempts → permanent.
- **Automatic recovery**: Lockout expires after the duration, no admin intervention required (except permanent lockout).

### 8. Email Verification: Required Before Access

**Decision**: Require email verification before granting access to the application.

**Rationale**:
- **User identity**: Ensures the user owns the email address they registered with.
- **Communication**: Verified emails are required for password reset and security notifications.
- **Anti-abuse**: Prevents automated account creation with disposable email addresses.

**Flow**:
1. User registers → account created (unverified) → verification email sent.
2. User clicks verification link → email marked as verified → access granted.
3. Unverified users are redirected to a verification page on login.

### 9. Audit Logging: Immutable Event Store

**Decision**: Log all authentication events to an append-only audit_logs table.

**Rationale**:
- **Security monitoring**: Detect and investigate suspicious activity.
- **Compliance**: Meet GDPR and SOC2 audit requirements.
- **Debugging**: Trace authentication issues to specific events.

**Events Logged**:
- Registration, login (success/failure), logout
- Token refresh, token revocation
- Password change, password reset
- Email verification, email change
- Account lockout, account unlock
- MFA enable/disable (future)

### 10. Client-Side Token Storage: Memory Only

**Decision**: Store access tokens in memory (Zustand store) and refresh tokens in httpOnly cookies.

**Rationale**:
- **XSS protection**: httpOnly cookies cannot be accessed by JavaScript, preventing token theft via XSS.
- **No localStorage/sessionStorage**: These are accessible via JavaScript and vulnerable to XSS.
- **Automatic cookie sending**: Refresh tokens are automatically sent with requests to the auth endpoint.
- **Memory-only access tokens**: Access tokens are lost on page refresh, requiring a refresh token call (which is automatic and transparent).

## Consequences

### Positive
- Stateless JWT verification enables horizontal scaling.
- Refresh token rotation provides strong theft detection.
- Redis caching ensures low-latency token validation.
- Comprehensive audit logging supports security monitoring and compliance.
- Clear migration path for OAuth, MFA, and SSO.

### Negative
- JWT size (~1KB) adds overhead to every API request.
- Token refresh adds latency on page load (one extra round trip).
- Redis is an additional infrastructure dependency.
- bcrypt cost factor 12 adds ~250ms to login/registration.

### Mitigations
- JWT size is acceptable for HTTP/2 multiplexed connections.
- Token refresh is transparent to the user (handled by Axios interceptor).
- Redis is containerized via Docker Compose for local development.
- bcrypt cost can be adjusted based on hardware capabilities.

## Future Considerations

### OAuth2 Social Login
- Add `user_identities` table for OAuth provider accounts.
- Implement Passport.js strategies for Google, GitHub, etc.
- Link multiple OAuth accounts to a single user.

### Multi-Factor Authentication (MFA)
- Add `user_mfa` table for TOTP secrets and backup codes.
- Implement MFA enrollment and verification flows.
- Support recovery codes for account access.

### API Key Authentication
- Add `api_keys` table for machine-to-machine authentication.
- Implement scoped permissions for API keys.
- Support key rotation and expiration.

### Enterprise SSO (SAML/OIDC)
- Add SSO configuration per tenant/workspace.
- Implement SAML and OIDC protocol support.
- Support Just-In-Time (JIT) user provisioning.

## References

1. [RFC 7519 - JSON Web Token](https://datatracker.ietf.org/doc/html/rfc7519)
2. [OWASP - JSON Web Token Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
3. [OWASP - Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
4. [Auth0 - Refresh Token Rotation](https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation)
5. [IETF - OAuth 2.0 for Browser-Based Apps](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps)