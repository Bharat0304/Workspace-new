# WorkSpace — Coding Guidelines

**Version:** 0.2.0  
**Last Updated:** 2026-06-20

---

## 1. General Principles

1. **Single Responsibility** — Each function, component, and module does one thing well
2. **No duplicated logic** — Extract shared logic to `shared/` or a utility function
3. **Explicit over implicit** — Import what you need; never rely on globals
4. **Mock first** — Build against service interfaces, not real APIs
5. **Documentation first** — If you add a module, update its README and the ChangeLog

---

## 2. JavaScript

### Module Pattern
Every file is an ES Module. Use `export`/`import` — never `var`, never globals.

```js
// ✅ Correct
export function doSomething() { ... }
import { doSomething } from './somewhere.js';

// ❌ Wrong
window.doSomething = function() { ... }
```

### Private Functions
Prefix internal-only functions with `_`:
```js
function _buildInternalHTML() { ... }  // private to this module
export function renderComponent() { ... }  // public
```

### Constants
```js
// ✅ Module-level constants
const MAX_LOG_ENTRIES = 50;
const WS_PREFIX = 'ws_';

// ✅ Exported constants
export const FLAG_NAMES = Object.freeze({ ... });
```

### Async/Await
Always use `async/await` over raw `.then()` chains. Always handle errors:
```js
// ✅
try {
    const result = await authService.loginWithGoogle();
} catch (err) {
    _showError(err.message);
}

// ❌
authService.loginWithGoogle().then(result => ...).catch(err => ...)
```

### DOM Queries
- Prefer querying within a component's own container, not `document.querySelector`
- Always check for null before acting on a queried element

```js
// ✅
const btn = container.querySelector('#submitBtn');
if (btn) btn.addEventListener('click', handler);

// ❌
document.querySelector('#submitBtn').addEventListener('click', handler);
```

---

## 3. CSS

### Tokens First
Always use design tokens. Never hardcode colors or font sizes:
```css
/* ✅ */
color: var(--amber);
font-family: 'Outfit', sans-serif;

/* ❌ */
color: #D97706;
font-size: 16px;
```

### Module Scoping
Each module's CSS is prefixed with the module abbreviation:
```css
/* Authentication module */
.auth-modal { ... }
.auth-card { ... }

/* Onboarding module */
.ob-step { ... }
.ob-progress { ... }

/* Developer panel */
#wsDev .dev-tab { ... }
```

### Animation Rules
- Maximum animation duration for ambient effects: **6s**
- Micro-interactions (hover, click): **0.2–0.3s**
- No bounce, no elastic, no spring (except card entry which uses a single spring-eased scale)
- Always add `will-change` for animated transforms to hint to compositor

---

## 4. File Naming

| Type | Convention | Example |
|---|---|---|
| Component | `PascalCase.js` | `AuthModal.js` |
| Service | `camelCaseService.js` | `authService.js` |
| State | `camelCaseState.js` | `authState.js` |
| Mock | `mock[Name].js` | `mockAuth.js` |
| Styles | `camelCase.css` | `devPanel.css` |
| Contracts | `[name].contracts.js` | `auth.contracts.js` |
| Tests | `[name].test.js` | `authService.test.js` |

---

## 5. Folder Conventions

- New module → new folder under `modules/`
- New module MUST have: `index.js`, `README.md`
- New module SHOULD have: `components/`, `services/`, `state/`, `styles/`
- New module with API → add `contracts/`
- New module with mocking → add `mock/`

---

## 6. Storage Keys

Always prefix with `ws_`. Always register in `storageReset.js`:
```js
// In storageReset.js
const WS_LOCALSTORAGE_KEYS = [
    'ws_profile',
    'ws_onboarding_draft',
    'ws_your_new_key',  // ← register here
];
```

---

## 7. Error Handling

- Service layers must `throw` with descriptive `Error` objects
- Components must catch and display errors in the UI — never silently swallow
- Use `console.warn` for recoverable issues, `console.error` for unexpected failures

---

## 8. Comments

### File Header (required for all `.js` files)
```js
/* ============================================================
   MODULE NAME — File description
   One sentence explaining what this file does.
   ============================================================ */
```

### Function JSDoc (required for all exported functions)
```js
/**
 * Short description.
 * @param {string} param1
 * @param {boolean} [optionalParam=false]
 * @returns {Promise<Object>}
 */
export async function myFunction(param1, optionalParam = false) { ... }
```

### Inline comments
- Explain **why**, not **what**
- Mark TODO/FIXME with owner: `// TODO(frontend): implement real OAuth`
