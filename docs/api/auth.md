# Authentication API Contract

## Base URL

All authentication endpoints are prefixed with `/api/v1/auth`.

## Common Headers

| Header | Required | Description |
|---|---|---|
| `Content-Type` | Yes | `application/json` |
| `Authorization` | For protected endpoints | `Bearer <accessToken>` |
| `X-Device-Fingerprint` | For token creation | Device identifier |
| `X-CSRF-Token` | For cookie-based auth | CSRF protection token |

## Common Responses

### Success Response Format
```json
{
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [ ... ]  // Validation errors, optional
  }
}
```

### HTTP Status Codes
| Code | Description |
|---|---|
| 200 | Success |
| 201 | Created (registration) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (email already exists) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

---

## Endpoints

### POST /api/v1/auth/register

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss1",
  "name": "John Doe"
}
```

**Validation Rules:**
| Field | Type | Rules |
|---|---|---|
| email | string | Required, valid email format, max 255 chars |
| password | string | Required, 8-128 chars, must contain uppercase, lowercase, digit, special char |
| name | string | Required, 1-100 chars |

**Success Response (201):**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "emailVerified": false,
      "createdAt": "2026-07-30T10:00:00Z"
    }
  },
  "message": "Account created successfully. Please verify your email."
}
```

**Error Responses:**
| Code | Status | Condition |
|---|---|---|
| VALIDATION_ERROR | 400 | Invalid input format |
| EMAIL_ALREADY_EXISTS | 409 | Email is already registered |
| RATE_LIMITED | 429 | Too many registration attempts |

---

### POST /api/v1/auth/login

Authenticate with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss1"
}
```

**Success Response (200):**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://example.com/avatar.jpg",
      "emailVerified": true
    }
  }
}
```

**Set-Cookie:**
```
refresh_token=<token>; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=604800
```

**Error Responses:**
| Code | Status | Condition |
|---|---|---|
| VALIDATION_ERROR | 400 | Invalid input format |
| INVALID_CREDENTIALS | 401 | Email or password incorrect |
| ACCOUNT_LOCKED | 401 | Account is temporarily locked |
| EMAIL_NOT_VERIFIED | 401 | Email not yet verified |
| RATE_LIMITED | 429 | Too many login attempts |

---

### POST /api/v1/auth/refresh

Refresh the access token using the refresh token cookie.

**Cookies Required:**
```
refresh_token=<token>
```

**Success Response (200):**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "expiresIn": 900
  }
}
```

**Set-Cookie:**
```
refresh_token=<new_token>; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=604800
```

**Error Responses:**
| Code | Status | Condition |
|---|---|---|
| NO_REFRESH_TOKEN | 401 | No refresh token cookie |
| TOKEN_EXPIRED | 401 | Refresh token has expired |
| TOKEN_REVOKED | 401 | Token was revoked |
| TOKEN_COMPROMISED | 401 | Possible token theft detected |
| RATE_LIMITED | 429 | Too many refresh attempts |

---

### POST /api/v1/auth/logout

Logout and revoke the current refresh token.

**Cookies Required:**
```
refresh_token=<token>
```

**Success Response (200):**
```json
{
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Response Headers:**
```
Set-Cookie: refresh_token=; Max-Age=0; Path=/api/v1/auth; HttpOnly; Secure; SameSite=Strict
```

---

### POST /api/v1/auth/logout/all

Logout from all devices.

**Headers Required:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "data": {
    "message": "Logged out from all devices"
  }
}
```

---

### POST /api/v1/auth/verify-email

Verify email address using the verification token.

**Request Body:**
```json
{
  "token": "verification-token-from-email"
}
```

**Success Response (200):**
```json
{
  "data": {
    "message": "Email verified successfully"
  }
}
```

**Error Responses:**
| Code | Status | Condition |
|---|---|---|
| VALIDATION_ERROR | 400 | Invalid token format |
| TOKEN_EXPIRED | 400 | Verification token has expired |
| TOKEN_INVALID | 400 | Invalid verification token |
| ALREADY_VERIFIED | 400 | Email is already verified |

---

### POST /api/v1/auth/resend-verification

Resend the email verification email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "data": {
    "message": "If the account exists, a verification email has been sent."
  }
}
```

**Note:** Always returns 200 to prevent email enumeration. If the email doesn't exist, no email is sent but the response is identical.

---

### POST /api/v1/auth/forgot-password

Request a password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "data": {
    "message": "If the account exists, a password reset link has been sent."
  }
}
```

**Note:** Always returns 200 to prevent email enumeration.

---

### POST /api/v1/auth/reset-password

Reset password using the reset token.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewSecureP@ss1"
}
```

**Success Response (200):**
```json
{
  "data": {
    "message": "Password reset successfully. Please log in with your new password."
  }
}
```

**Error Responses:**
| Code | Status | Condition |
|---|---|---|
| VALIDATION_ERROR | 400 | Invalid input format |
| TOKEN_EXPIRED | 400 | Reset token has expired |
| TOKEN_INVALID | 400 | Invalid reset token |
| PASSWORD_REUSE | 400 | Password was used recently |

---

### GET /api/v1/auth/sessions

Get all active sessions for the authenticated user.

**Headers Required:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "data": {
    "sessions": [
      {
        "id": "uuid",
        "deviceName": "Chrome on macOS",
        "deviceType": "desktop",
        "browser": "Chrome 120",
        "os": "macOS 14",
        "ipAddress": "192.168.1.1",
        "location": "San Francisco, US",
        "lastActiveAt": "2026-07-30T09:00:00Z",
        "createdAt": "2026-07-29T10:00:00Z",
        "isCurrent": true
      }
    ]
  }
}
```

---

### DELETE /api/v1/auth/sessions/:id

Revoke a specific session.

**Headers Required:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "data": {
    "message": "Session revoked successfully"
  }
}
```

---

### GET /api/v1/auth/me

Get the current authenticated user's profile.

**Headers Required:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "emailVerified": true,
    "timezone": "America/New_York",
    "locale": "en",
    "createdAt": "2026-07-01T10:00:00Z"
  }
}
```

---

### PATCH /api/v1/auth/me

Update the current user's profile.

**Headers Required:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "timezone": "America/New_York",
  "locale": "en"
}
```

**Success Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Updated",
    "avatar": "https://example.com/avatar.jpg",
    "emailVerified": true,
    "timezone": "America/New_York",
    "locale": "en",
    "createdAt": "2026-07-01T10:00:00Z"
  }
}
```

---

### POST /api/v1/auth/change-password

Change password (requires current password).

**Headers Required:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "currentPassword": "CurrentP@ss1",
  "newPassword": "NewSecureP@ss1"
}
```

**Success Response (200):**
```json
{
  "data": {
    "message": "Password changed successfully. Please log in again."
  }
}
```

**Note:** All existing sessions are revoked after password change. User must re-authenticate.