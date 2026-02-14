## Authentication Flow

This project implements a **JWT-based authentication system** using **short-lived access tokens** and **rotating refresh tokens**.

### Token Strategy

| Token type    | Storage location     | Lifetime  | Purpose                     | Environmental variable |
|---------------|----------------------|-----------|-----------------------------|-------------------------
| Access Token  | In-memory (frontend) | 5 minutes | Authorize API requests      | ACCESS_TOKEN_EXPIRY_PROD ACCESS_TOKEN_EXPIRY_DEV
| Refresh Token | HttpOnly cookie      | 1 day     | Issue new access tokens     | REFRESH_TOKEN_EXPIRY_PROD REFRESH_TOKEN_EXPIRY_SCHEMA_PROD REFRESH_TOKEN_EXPIRY_DEV REFRESH_TOKEN_EXPIRY_SCHEMA_DEV

---

## Authentication Lifecycle

### 1. User Login (Frontend)
The user submits valid credentials to the backend authentication endpoint.

---

### 2. Token Issuance (Backend)

Upon successful authentication, the backend:

- Generates and signs two JWTs:
  - **Access Token**
    - `expiresIn: 5m`
  - **Refresh Token**
    - `expiresIn: 1d`

---

### 3. Refresh Token Persistence (Backend)

- The refresh token is **hashed**.
- The hashed value is stored in the database.
- This enables:
  - Token rotation
  - Replay attack prevention
  - Safe invalidation on logout or reuse

---

### 4. Refresh Token Cookie Configuration (Production)

The refresh token is sent to the client as a cookie with the following attributes:

```js
httpOnly: true
secure: true
sameSite: 'None'
maxAge: 86400000 // 1 day (matches JWT expiresIn)
```

This configuration:
- Prevents JavaScript access (`HttpOnly`)
- Requires HTTPS (`Secure`)
- Allows cross-site requests (`SameSite=None`)

---

### 5. Login Response Payload

The backend response includes:

- `username`
- `avatarUrl`
- `accessToken`
- `refreshToken` (also set as an HttpOnly cookie)

---

### 6. Frontend Token Handling

On the frontend:

- **Access Token**
  - Stored only in memory
  - Never persisted to disk
- **Refresh Token**
  - Stored by the browser as an HttpOnly cookie
  - Session-scoped only due to cross-site cookie restrictions

> ⚠️ Because the frontend and backend are hosted on different `.onrender.com` subdomains (free Render plan), the refresh token cookie is treated as a third-party cookie.  
> As a result, persistence across browser restarts depends on the browser and its privacy settings.  
> For example, with default Safari settings, strict third-party cookie policies prevent the refresh token cookie from being stored or sent to the frontend at all.

---

### 7. Access Token Expiration & Refresh

- When an API request returns `403 Forbidden` due to an expired access token:
  - A frontend request interceptor calls:
    ```
    POST /api/auth/refresh-token
    ```
- The request includes the refresh token automatically via the HttpOnly cookie.

---

### 8. Token Rotation (Backend)

If the refresh token is valid and matches the hashed value stored in the database:

- A **new access token** is issued.
- A **new refresh token** is generated.
- The refresh token in the database is **overwritten** (rotation).
- The new refresh token is sent back as a cookie.
- The new access token is returned in the response body.

This ensures:
- Single-use refresh tokens
- Automatic invalidation of reused or stolen tokens

---

## Security Considerations

- Refresh tokens are never accessible to JavaScript.
- Access tokens are never persisted.
- Token rotation mitigates replay attacks.
- No sensitive credentials are stored in `localStorage` or `sessionStorage`.
