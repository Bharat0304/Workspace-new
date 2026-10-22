# Authentication Module

Handles all authentication concerns for WorkSpace: login modal, Google OAuth (mock), email/password auth, and auth state persistence.

## Files

```
authentication/
├── mock/
│   └── mockAuth.js          — Simulates Google + email login with realistic delays
├── state/
│   └── authState.js         — Singleton state store (persists to sessionStorage)
├── services/
│   └── authService.js       — Public service API (UI only imports this)
├── components/
│   ├── GoogleButton.js      — Pixel-perfect Google sign-in button
│   ├── LoginCard.js         — Full auth card with loading/error/success states
│   └── AuthModal.js         — Full-screen overlay wrapping LoginCard
├── styles/
│   └── auth.css             — All modal + card styles
├── contracts/
│   └── auth.contracts.js    — API contract shapes (no backend)
└── index.js                 — Module entry: exports initAuth()
```

## Usage

```js
import { initAuth, openAuthentication } from './modules/authentication/index.js';
initAuth(); // call once to register triggers and load styles
```

Alternatively, you can trigger authentication programmatically or from future components using the centralized function:
```js
openAuthentication(); // or window.openAuthentication()
```

This wires click handlers to open the auth modal. The unified triggers are:
- `#loginBtn` (navbar "Log In")
- `#ctaNav` (navbar "Get Early Access")
- `.mobile-link` matching "Log In" (mobile menu)
- Any element with `data-auth-trigger` attribute (landing page CTAs such as "Start for Free", mobile menu "Get Early Access", "Claim Your Spot", and "Begin Your Baseline").



## Auth Flow

1. User clicks **Log In** → `AuthModal.open()` is called
2. User clicks **Continue with Google** → `authService.loginWithGoogle()` is called
3. Mock auth responds after ~1.2s with `{ user, isNewUser }`
4. If `isNewUser = true` → `initOnboarding(user)` is called
5. If `isNewUser = false` → dashboard placeholder is shown
