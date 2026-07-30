# Authentication Business Rules

## 1. Password Policy

### 1.1 Complexity Requirements
- Minimum length: 8 characters
- Maximum length: 128 characters
- Must contain at least 1 uppercase letter
- Must contain at least 1 lowercase letter
- Must contain at least 1 digit
- Must contain at least 1 special character (`!@#$%^&*()_+-=[]{}|;':\",./<>?`)
- Must not contain the user's email prefix or name
- Must not be a common password (checked against a denylist of top 10,000 common passwords)

### 1.2 Password History
- Users cannot reuse any of their last 5 passwords.
- Password history is tracked via a `password_history` table.
- Only the bcrypt hash is stored, never the plaintext password.

### 1.3 Password Change
- Authenticated users must provide their current password to set a new one.
- Password change invalidates all existing refresh tokens (force re-login).
- Password reset (via email) does not require current password.
- A confirmation email is sent for any password change.

## 2. Account Lockout

### 2.1 Lockout Thresholds
- 5 consecutive failed login attempts → 15-minute lockout
- 10 consecutive failed login attempts → 1-hour lockout
- 15 consecutive failed login attempts → 24-hour lockout
- 20 consecutive failed login attempts → permanent lockout (requires admin intervention)

### 2.2 Lockout Reset
- Lockout counter resets after successful login.
- Lockout counter resets after the lockout duration expires.
- Lockout counter does NOT reset on password reset (security measure).
- Permanent lockout can only be lifted by an administrator.

### 2.3 Failed Attempt Tracking
- Failed attempts are tracked per email address, not per user ID (prevents email enumeration).
- Failed attempts include IP address, user agent, and timestamp.
- Failed attempts from the same IP are tracked separately for rate limiting.

## 3. Session Management

### 3.1 Token Lifecycle
- Access tokens are valid for 15 minutes.
- Refresh tokens are valid for 7 days.
- Refresh tokens can be used exactly once (rotation).
- A maximum of 10 active refresh tokens per user.
- Exceeding the limit revokes the oldest token (LRU eviction).

### 3.2 Token Revocation
- Logout revokes the specific refresh token.
- "Logout all devices" revokes all refresh tokens for the user.
- Password change revokes all refresh tokens.
- Account lockout revokes all refresh tokens.
- Admin account suspension revokes all tokens.

### 3.3 Concurrent Sessions
- Users can have multiple concurrent sessions (up to 10 devices).
- Each device/browser gets its own refresh token.
- Sessions are identified by a combination of device fingerprint and user agent.

## 4. Email Verification

### 4.1 Verification Requirements
- Email must be verified within 7 days of registration.
- Unverified accounts cannot access the application (redirect to verification page).
- Verification link expires after 24 hours.
- Users can request a new verification email every 60 seconds.

### 4.2 Email Change
- Changing email requires verification of the new address.
- The old email remains active until the new one is verified.
- A notification is sent to the old email address.

## 5. Rate Limiting

### 5.1 Endpoint Limits
| Endpoint | Rate Limit | Window |
|---|---|---|
| POST /auth/login | 5 requests | 15 minutes per IP |
| POST /auth/register | 3 requests | 60 minutes per IP |
| POST /auth/refresh | 10 requests | 1 minute per user |
| POST /auth/forgot-password | 3 requests | 60 minutes per email |
| POST /auth/reset-password | 3 requests | 60 minutes per token |
| POST /auth/verify-email | 5 requests | 15 minutes per token |
| POST /auth/resend-verification | 3 requests | 60 minutes per email |

### 5.2 Global Limits
- Maximum 100 requests per minute per IP across all auth endpoints.
- Maximum 1000 requests per minute per IP across all API endpoints.

## 6. Audit Logging

### 6.1 Required Events
Every authentication event must be logged with:
- Event type (LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, TOKEN_REFRESH, PASSWORD_CHANGE, etc.)
- Timestamp (UTC, ISO 8601)
- IP address
- User agent string
- Email (if available)
- User ID (if authenticated)
- Outcome (SUCCESS/FAILURE)
- Failure reason (if applicable)

### 6.2 Log Retention
- Authentication logs: 90 days
- Failed attempt logs: 90 days
- Password change logs: 1 year
- Account lockout logs: 1 year

## 7. Security Constraints

### 7.1 Timing Attacks
- Login endpoint must take the same amount of time regardless of whether the email exists.
- Password comparison must use a constant-time comparison function.
- Token comparison must use a constant-time comparison function.

### 7.2 Email Enumeration
- Registration endpoint must not reveal if an email is already registered.
- Login endpoint must not reveal if an email exists (generic "Invalid credentials" message).
- Forgot password endpoint must not reveal if an email exists (always return success).
- All auth endpoints return generic error messages to prevent user enumeration.

### 7.3 Token Storage (Client-Side)
- Access tokens must be stored in memory only (Zustand store or React context).
- Refresh tokens must be stored in an httpOnly, Secure, SameSite=Strict cookie.
- No authentication tokens shall be stored in localStorage or sessionStorage.
- CSRF tokens shall be used for cookie-based authentication flows.

## 8. Compliance

### 8.1 GDPR Considerations
- Users can request account deletion (GDPR right to erasure).
- Authentication logs are anonymized after 90 days.
- Users can export their data.
- Session information is provided upon request.

### 8.2 Password Storage
- Passwords are hashed with bcrypt (cost factor 12).
- No plaintext passwords are ever logged or stored.
- Password hashes are stored in a separate column from user profile data.