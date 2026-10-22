# WorkSpace — Technical Architecture

**Version:** 0.2.0  
**Last Updated:** 2026-06-20

---

## 1. Application Architecture

WorkSpace uses a **Feature-Based Modular Architecture** on the frontend, designed to support parallel development across three engineers (Frontend, Backend, Electron) with minimal conflicts.

Each feature is fully self-contained in its module. Shared utilities live in `shared/`. Infrastructure lives in `app/`.

---

## 2. Folder Structure

```
workspace/
├── client/                         ← Frontend application root
│   ├── index.html                  ← Single entry point
│   ├── app/                        ← Application infrastructure
│   │   ├── app.js                  ← Central bootstrapper (entry)
│   │   └── config/
│   │       ├── env.js              ← Environment detection + switching
│   │       └── featureFlags.js     ← Feature flag registry
│   ├── shared/                     ← Cross-module shared code
│   │   ├── components/
│   │   │   ├── navbar.js           ← Shared navbar
│   │   │   ├── navbar.css
│   │   │   └── footer.css
│   │   └── styles/
│   │       ├── variables.css       ← Global design tokens
│   │       └── reset.css           ← Global CSS reset + utilities
│   └── modules/                    ← Feature modules
│       ├── dashboard/              ← Landing page + analytics placeholder
│       ├── authentication/         ← Auth modal, service, state
│       ├── onboarding/             ← 4-step onboarding flow
│       └── development/            ← Dev tooling (dev-only)
│
├── docs/                           ← Project documentation
│   ├── product/                    ← PRD, Roadmap, Tickets
│   ├── architecture/               ← Technical specs, ADRs
│   └── development/                ← Changelog, guidelines, workflows
│
└── README.md                       ← Project overview
```

---

## 3. Module Structure Convention

Every module follows the same internal structure:

```
modules/[feature-name]/
├── components/         ← UI components (render to DOM, no business logic)
├── services/           ← Business logic (public API, no direct DOM access)
├── state/              ← State stores (singleton, persists to storage)
├── mock/               ← Mock implementations of service contracts
├── styles/             ← CSS files for this module
├── contracts/          ← API shape documentation (no implementation)
└── index.js            ← Module entry: exports init[FeatureName]()
```

---

## 4. Module Relationships

```
app.js (bootstrapper)
    │
    ├── shared/navbar.js
    │
    ├── modules/authentication/
    │       └── index.js (initAuth)
    │           ├── components/AuthModal.js
    │           │       └── components/LoginCard.js
    │           │               └── (calls) modules/onboarding/index.js
    │           ├── services/authService.js
    │           │       └── mock/mockAuth.js
    │           └── state/authState.js
    │
    ├── modules/onboarding/
    │       └── index.js (initOnboarding)
    │           ├── steps/Step1..4
    │           ├── components/...
    │           ├── services/profileService.js
    │           │       └── mock/mockProfile.js
    │           └── state/onboardingState.js
    │
    ├── modules/dashboard/
    │       └── components/bulb.js, student.js, faq.js
    │
    └── modules/development/       [dev-only, lazy loaded]
            └── index.js (initDevPanel)
                ├── components/DevPanel.js
                ├── services/devService.js
                ├── state/devState.js
                └── utils/storageReset.js, debugTools.js
```

---

## 5. Environment + Feature Flag System

```
env.js          → detects environment (dev/staging/production)
featureFlags.js → reads defaults per env, applies localStorage overrides
                  → production: always locked to safe defaults
```

**Environment switching (local dev):**
```js
// Console: switch to production-like config
window.__WS_ENV_CONFIG__.setOverride('production')
// Then reload
```

**Feature flag override (local dev):**
```js
// Console: disable developer panel
window.__WS_FLAGS__.set('enableDeveloperPanel', false)
```

---

## 6. Data Flow

```
User Action
    └─▶ Component (UI only, no business logic)
           └─▶ Service Layer (business logic, calls mock)
                   └─▶ Mock Layer (simulates backend)
                           └─▶ State Store (persists to storage)
                                   └─▶ Component re-reads state → re-renders
```

**Key principle:** Components never import from `mock/` directly. All communication goes through the service layer.

---

## 7. Storage Architecture

| Store | Key Prefix | Contents |
|---|---|---|
| `localStorage` | `ws_` | Profile, onboarding draft, feature flag overrides |
| `sessionStorage` | `ws_` | Auth state, dev panel state |

**Reset safety:** The storage reset utility maintains an explicit key registry. Only `ws_` prefixed keys are ever touched. Non-WorkSpace browser data is never affected.

---

## 8. Future Architecture Plans

| Concern | Current | Future |
|---|---|---|
| Auth | Mock Google OAuth | Real Google OAuth + JWT |
| Data | localStorage | Backend REST API |
| Routing | Manual navigation | SPA Router (hash or history) |
| Desktop | N/A | Electron IPC bridge |
| Build | No build step | Vite or ESBuild |
| Testing | Manual | Jest + Playwright |
