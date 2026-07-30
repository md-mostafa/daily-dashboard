# Refresh Token Workflow

## Overview

The refresh token workflow allows clients to obtain a new access token without requiring the user to re-authenticate. It implements refresh token rotation for enhanced security: each time a refresh token is used, the old token is invalidated and a new token pair is issued.

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Client as Browser/Client
    participant App as React App
    participant API as NestJS API
    participant Auth as AuthService
    participant DB as PostgreSQL
    participant Redis as Redis Cache

    Note over Client: Access token expired
    Client->>App: API request fails with 401
    
    App->>App: Intercept 401 response
    App->>App: Check if refresh is in progress
    
    alt Refresh Already In Progress
        App->>App: Queue pending requests
        Note over App: Wait for refresh to complete
    end

    App->>API: POST /api/v1/auth/refresh
    Note over Client,API: refresh_token cookie sent automatically
    
    API->>Auth: extractRefreshToken(cookie)
    
    alt No Refresh Token Cookie
        API-->>App: 401 No refresh token
        App-->>Client: Redirect to login
    end

    Auth->>Redis: GET refresh_token:{fingerprint}
    
    alt Token Not in Redis (Expired/Revoked)
        Auth->>DB: SELECT refresh_token WHERE hash = :hash
        
        alt Token Found in DB
            Auth->>DB: DELETE refresh_token (rotation detected)
            Note over Auth: Possible token theft - revoke all user sessions
            Auth->>Redis: DEL all user sessions
            API-->>App: 401 Token compromised
            App-->>Client: Redirect to login (force re-auth)
        else
            API-->>App: 401 Invalid token
            App-->>Client: Redirect to login
        end
    end

    Auth->>Auth: Verify token expiration
    
    alt Token Expired
        Auth->>DB: DELETE refresh_token
        Auth->>Redis: DEL refresh_token:{fingerprint}
        API-->>App: 401 Token expired
        App-->>Client: Redirect to login
    end

    Note over Auth: Token is valid
    Auth->>Auth: Generate new accessToken (15min TTL)
    Auth->>Auth: Generate new refreshToken (7d TTL)
    
    Note over Auth: Rotate tokens
    Auth->>DB: DELETE old refresh_token
    Auth->>DB: INSERT new refresh_token (hashed)
    Auth->>Redis: DEL old refresh_token:{fingerprint}
    Auth->>Redis: SET new refresh_token:{fingerprint} -> userId (TTL: 7d)
    
    API-->>App: 200 { accessToken, expiresIn }
    Note over API: New refresh_token set as cookie
    
    App->>App: Update accessToken in memory
    App->>App: Retry queued requests with new token
    App-->>Client: Continue normal operation
```

## Token Rotation Strategy

### Why Rotation?
Refresh token rotation mitigates the risk of token theft. If an attacker steals a refresh token, they can only use it once before it's rotated. If the legitimate user's next refresh attempt fails (because the token was already used by the attacker), the system detects the theft and can take action.

### Rotation Flow
1. Client sends refresh token A.
2. Server validates token A.
3. Server issues token pair (B, C) where B is the new access token and C is the new refresh token.
4. Server invalidates token A.
5. If token A is used again (by an attacker), the server detects it as already rotated and revokes all tokens for the user.

### Token Theft Detection
```typescript
// Pseudocode for theft detection
async function refreshToken(oldTokenHash: string): Promise<TokenPair> {
  const storedToken = await db.query.refreshTokens.findFirst({
    where: eq(refreshTokens.hash, oldTokenHash),
  });

  if (!storedToken) {
    // Token was already rotated or never existed
    // This could indicate token theft
    await revokeAllUserSessions(storedToken.userId);
    throw new UnauthorizedException('Token compromised');
  }

  // Rotate: delete old, create new
  await db.delete(refreshTokens).where(eq(refreshTokens.id, storedToken.id));
  const newToken = await createRefreshToken(storedToken.userId);
  
  return {
    accessToken: generateAccessToken(storedToken.userId),
    refreshToken: newToken,
  };
}
```

## Concurrency Handling

Since multiple API calls may fail with 401 simultaneously, the client must handle concurrent refresh attempts:

```typescript
// Client-side refresh queue
let refreshPromise: Promise<TokenResponse> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) {
    // Refresh already in progress, wait for it
    return refreshPromise.then((res) => res.accessToken);
  }

  refreshPromise = apiClient.post('/auth/refresh')
    .then((res) => {
      refreshPromise = null;
      return res.data;
    })
    .catch((err) => {
      refreshPromise = null;
      throw err;
    });

  return refreshPromise.then((res) => res.accessToken);
}
```

## Error Handling

| HTTP Status | Error Code | Description | Client Action |
|---|---|---|---|
| 401 | NO_REFRESH_TOKEN | No refresh token cookie | Redirect to login |
| 401 | TOKEN_EXPIRED | Refresh token expired | Redirect to login |
| 401 | TOKEN_REVOKED | Token was revoked | Redirect to login |
| 401 | TOKEN_COMPROMISED | Possible token theft | Redirect to login, force re-auth |
| 429 | RATE_LIMITED | Too many refresh attempts | Retry with backoff |

## Security Considerations

1. **Refresh token is stored as httpOnly cookie**: Cannot be accessed by JavaScript, preventing XSS-based theft.
2. **Token rotation**: Each use invalidates the previous token.
3. **Theft detection**: If a rotated token is reused, all sessions are revoked.
4. **Maximum active tokens**: Users are limited to 10 active refresh tokens.
5. **Redis-backed denylist**: Allows fast token revocation without database queries.
6. **Fingerprint binding**: Refresh tokens are bound to a device fingerprint for additional security.