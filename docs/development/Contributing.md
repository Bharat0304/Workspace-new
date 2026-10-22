# WorkSpace — Contributing Guide

**Last Updated:** 2026-06-20

---

## 1. Development Setup

### Prerequisites
- Node.js 18+ (for the Python dev server alternative, Python 3.x)
- Modern browser (Chrome 90+ or Firefox 90+ recommended)
- Code editor with ESModule support

### Start the Development Server

**Option A: Python HTTP Server (no install required)**
```bash
cd workspace/client
python -m http.server 3000
```
Then open: `http://localhost:3000`

**Option B: Live Server (VS Code extension)**
Install the "Live Server" extension and click "Go Live" from the `client/` folder.

**Option C: npx serve**
```bash
cd workspace/client
npx serve .
```

### Environment
By default, the app runs in `development` mode when served from `localhost`.  
The Developer Panel will be visible in the bottom-right corner.

**Override environment (console):**
```js
window.__WS_ENV_CONFIG__.setOverride('production')  // then reload
```

---

## 2. Folder Explanation

```
workspace/
├── client/
│   ├── app/            ← Bootstrapper + config (env, feature flags)
│   ├── shared/         ← Shared styles, components used across modules
│   └── modules/        ← One folder per feature
│       ├── dashboard/       ← Landing page + animations
│       ├── authentication/  ← Auth modal, mock Google OAuth
│       ├── onboarding/      ← 4-step profile collection
│       └── development/     ← Developer tooling (dev-only)
└── docs/
    ├── product/         ← PRD, Roadmap, Feature Tickets
    ├── architecture/    ← Technical docs, ADRs, security
    └── development/     ← Changelog, guidelines, this file
```

---

## 3. Adding a New Module

### Step 1: Create the folder structure
```
modules/[your-module]/
├── components/
├── services/
├── state/
├── mock/
├── styles/
├── contracts/
├── index.js
└── README.md
```

### Step 2: Create the entry point
```js
// modules/[your-module]/index.js
export function init[YourModule]() {
    // inject styles, wire DOM, initialize state
}
```

### Step 3: Wire into app.js
```js
import { initYourModule } from '../modules/your-module/index.js';

function init() {
    // ... existing inits
    initYourModule();
}
```

### Step 4: Register storage keys
If your module uses `localStorage` or `sessionStorage`, register keys in `storageReset.js`:
```js
const WS_LOCALSTORAGE_KEYS = [
    // ... existing keys
    'ws_your_module_key',
];
```

### Step 5: Update documentation
- Add module README
- Add feature ticket(s) to `docs/product/FeatureTickets.md`
- Update `docs/development/ChangeLog.md`
- Update `docs/architecture/TechnicalArchitecture.md` (module relationships)
- Add ADR to `docs/architecture/ArchitectureDecisions.md` if a significant decision was made

---

## 4. Working with the Developer Panel

The Developer Panel is available at `http://localhost:3000` and is the primary tool for testing auth and onboarding flows.

### Quick Auth Shortcuts
| Action | Button |
|---|---|
| New user flow | Auth tab → "New User" |
| Returning user flow | Auth tab → "Existing User" |
| Logout | Auth tab → "Logout" |

### Reset Application
App tab → "Reset Application + Reload" — clears all WorkSpace storage and reloads.

### Feature Flags
Flags tab → toggle any flag at runtime without code changes.

### Console Tools
```js
// Read all flags
window.__WS_FLAGS__.getAll()

// Disable developer panel
window.__WS_FLAGS__.set('enableDeveloperPanel', false)

// Check env
window.__WS_ENV_CONFIG__

// Read debug tool state
window.__WS_DEBUG__.getConfig()
```

---

## 5. Contribution Process

1. Pick an issue from `FeatureTickets.md` or create a new ticket
2. Create a branch: `feature/[TICKET-ID]-[description]`
3. Build the feature following the Coding Guidelines
4. Update module README
5. Update ChangeLog, FeatureTickets, and any relevant docs
6. Open a PR against `main` using the PR template from GitWorkflow.md
7. Address review feedback
8. Merge + delete branch

---

## 6. Developer Responsibilities by Role

### Frontend Developer
- Feature module development
- Component and service implementation
- CSS and animation
- Mock service implementation
- Module documentation

### Backend Developer
- API contract definition (`contracts/` files)
- Replacing mock services with real ones (only the mock layer changes)
- Auth token management
- Data schema design

### Electron Developer
- `window.__WS_ENV__` injection at app launch
- IPC bridge implementation (when needed)
- Native feature integration (notifications, idle detection)
- Electron main process setup

---

## 7. Code Review Checklist

### Reviewer checks
- [ ] Follows import rules (Component → Service → Mock, never Component → Mock)
- [ ] Storage keys are registered in `storageReset.js`
- [ ] No `document.querySelector` at module root scope (must be inside functions)
- [ ] No `localStorage.clear()` or `sessionStorage.clear()` (use `storageReset.js`)
- [ ] No `console.log` in non-dev code paths
- [ ] Module README is updated
- [ ] ChangeLog is updated
