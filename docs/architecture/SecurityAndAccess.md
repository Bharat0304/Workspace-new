# WorkSpace — Security & Access

**Version:** 0.2.0  
**Last Updated:** 2026-06-20

---

## 1. Authentication (Current)

WorkSpace currently uses **mock authentication** — no real OAuth or server-side sessions exist.

### Mock Auth Behavior
- `mockAuth.js` simulates Google OAuth with a 1.2s delay
- Returns a `{ name, email, photo, isNewUser, accessToken }` object
- The `accessToken` is a randomly generated string — not a real JWT
- Auth state is stored in `sessionStorage` under `ws_auth_state`

### Session Lifetime
- Session exists for the browser tab lifetime (sessionStorage)
- Closing the tab clears the session
- "Remember me" is not yet implemented

---

## 2. Authentication (Planned — v1.0)

| Concern | Plan |
|---|---|
| Google OAuth | Real `accounts.google.com` OAuth 2.0 flow with PKCE |
| JWT | Backend issues short-lived access tokens (15 min) + refresh tokens (30 days) |
| Storage | Access token: memory only; Refresh token: HttpOnly cookie |
| CSRF | SameSite cookie + state parameter in OAuth flow |

---

## 3. Authorization

### Current (v0.2)
- No server-side authorization (no backend)
- No route protection (all routes are accessible if URL is known)
- Developer panel is the only access-controlled feature (feature flag gated)

### Planned (v1.0)
- JWT-based route protection via middleware
- User can only access their own profile and session data
- Electron: process isolation (renderer has no Node.js access)

---

## 4. Environment Variables

No `.env` files are currently used (no build tool). Environment is detected via:
1. `window.__WS_ENV__` (intended for Electron/build injection)
2. `localStorage` override (dev convenience)
3. Hostname heuristics

### Future `.env` Strategy (with build tool)
```
VITE_WS_ENV=production
VITE_GOOGLE_CLIENT_ID=xxx
VITE_API_BASE_URL=https://api.workspace.app
```

**Rule:** Never commit real credentials. API keys go in environment variables, never in source code.

---

## 5. Storage Strategy

| Data | Where | Cleared When |
|---|---|---|
| Auth session | `sessionStorage: ws_auth_state` | Tab closed or logout |
| User profile | `localStorage: ws_profile` | Reset or account deletion |
| Onboarding draft | `localStorage: ws_onboarding_draft` | Onboarding complete or reset |
| Feature flags | `localStorage: ws_feature_flags` | Feature flag reset |
| Dev panel state | `sessionStorage: ws_dev_state` | Tab closed |

**Sensitive data rule:** Never store access tokens or passwords in localStorage. Only sessionStorage (or memory) for tokens.

---

## 6. Developer Panel Security

The Developer Panel is a potential attack surface if accidentally enabled in production.

**Mitigations:**
1. `ENV.isProduction` hard-lock in `index.js` — returns before any dynamic import
2. Feature flag `enableDeveloperPanel` defaults to `false` in staging and production
3. Dynamic import (`import()`) prevents DevPanel.js from being in the initial bundle
4. Production `ENV` freezes feature flags to safe defaults

**Future mitigation:** When a build tool is added, `modules/development/` should be excluded from production builds entirely via tree-shaking.

---

## 7. Data Privacy

- No analytics, telemetry, or tracking in v0.2
- No data leaves the user's device in v0.2 (all localStorage/sessionStorage)
- Future backend: user data encrypted at rest, not sold or shared
- Privacy policy and Terms of Service to be published before v1.0 launch
