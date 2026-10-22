# Development Module

## Purpose
Internal developer tooling for the WorkSpace project. Provides a floating Developer Panel for authentication shortcuts, application reset, navigation, state inspection, feature flag management, and network simulation architecture.

**This module is completely disabled in production environments.** No production code depends on it.

---

## Responsibilities
- Developer Panel UI (floating, collapsible, tabbed)
- Mock authentication shortcuts (New User / Existing User / Logout)
- Application and storage reset tooling
- Feature flag runtime overrides
- State inspector for auth, onboarding, and route state
- Architecture placeholders for network/API simulations

---

## Folder Structure

```
development/
├── components/
│   └── DevPanel.js          — Floating panel with 6-tab interface
├── services/
│   └── devService.js        — All panel actions (always via real service layer)
├── state/
│   └── devState.js          — Panel UI state + activity log
├── mock/
│   └── mockUsers.js         — Pre-defined New User / Existing User personas
├── utils/
│   ├── storageReset.js      — Safe WorkSpace-only storage cleanup
│   └── debugTools.js        — Network/API simulation architecture placeholders
├── styles/
│   └── devPanel.css         — All panel styles (scoped to #wsDev)
├── index.js                 — Module entry: exports initDevPanel()
└── README.md                — This file
```

---

## Components

### `DevPanel.js`
Floating collapsible panel with 6 tabs:
| Tab | Purpose |
|---|---|
| **Auth** | Login as New User, Existing User, or Logout |
| **App** | Reset Application, Clear Storage, Reset Mock Data |
| **Nav** | Open Landing, Auth, Onboarding, Dashboard, Analytics |
| **State** | Live auth/onboarding/route/storage/flags snapshot |
| **Flags** | Toggle feature flags at runtime |
| **Sim** | Network/API simulation toggles (architecture placeholders) |

---

## Services

### `devService.js`
All actions go through the real service layer (`authState`, `authService`, `onboardingState`). The dev service never bypasses these layers, ensuring developer shortcuts exercise the same code paths as production users.

| Method | Description |
|---|---|
| `loginAsNewUser()` | Seeds auth as new user → launches onboarding |
| `loginAsExistingUser()` | Seeds auth + profile → shows dashboard |
| `logout()` | Calls `authService.logout()` + clears onboarding draft |
| `resetApplication()` | Clears all WS storage + reloads |
| `clearWorkSpaceStorage()` | Removes WS keys without reload |
| `resetMockData()` | Removes profile + onboarding draft only |
| `navigateTo(route)` | Programmatic navigation to any module route |
| `getStateSnapshot()` | Returns auth + onboarding + route + flags snapshot |
| `setFlag(name, value)` | Runtime feature flag override |

---

## State

### `devState.js`
- Tracks panel open/close and active tab (persisted to `sessionStorage`)
- Maintains an in-memory rolling log of dev actions (max 50 entries)
- Mirrors all log entries to `console.info/warn/error`

---

## Mock Services

### `mockUsers.js`
Pre-defined mock user personas:
- **MOCK_NEW_USER** — `dev.new@workspace.local`, `isNewUser: true`
- **MOCK_EXISTING_USER** — `dev.existing@workspace.local`, `isNewUser: false`
- **MOCK_COMPLETE_PROFILE** — Full profile object seeded to localStorage for existing user flow

---

## API Contracts
None — this module is dev tooling only. It calls existing module service APIs.

---

## Dependencies
| Dependency | Usage |
|---|---|
| `app/config/env.js` | Environment gate |
| `app/config/featureFlags.js` | Feature flag gate and runtime toggles |
| `authentication/state/authState.js` | Seed/clear auth state |
| `authentication/services/authService.js` | Logout via real service |
| `onboarding/state/onboardingState.js` | Clear draft |
| `onboarding/index.js` | Launch onboarding (lazy import) |
| `authentication/components/AuthModal.js` | Open auth modal (lazy import) |

---

## Current Status
✅ Developer Panel — Active  
✅ Auth shortcuts — Active  
✅ Storage reset — Active  
✅ Feature flag toggles — Active  
✅ State inspector — Active (auto-refreshes every 2s)  
⚠️ Network simulations — Architecture placeholders only  
⚠️ Navigation: Dashboard/Analytics — Placeholder screens  

---

## Known Limitations
- Navigation shortcuts for Dashboard and Analytics show placeholder screens (modules not yet built)
- Network simulation toggles record to state but do not affect fetch behavior yet
- Panel position is fixed (bottom-right); drag-to-reposition is a future improvement

---

## Future Improvements
- Drag-to-reposition panel
- Network simulation via `fetch` interceptor (Service Worker or monkey-patching)
- Collapsible log with filters (info/warn/error)
- Keyboard shortcut to toggle panel (e.g. `Ctrl+Shift+D`)
- Remote feature flag integration (Flagsmith, LaunchDarkly)
