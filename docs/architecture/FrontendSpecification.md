# WorkSpace — Frontend Specification

**Version:** 0.2.0  
**Last Updated:** 2026-06-20

---

## 1. UI Architecture

WorkSpace is a **desktop-first**, single-page application built with HTML, CSS, and Vanilla JavaScript (ES Modules). There is no framework, no virtual DOM, and no build tool at this stage.

### Design Philosophy
- **Dark Theme Only** — `#000000` / `#0A0A0A` backgrounds
- **Minimal + Premium** — Generous whitespace, amber accents, no decoration for decoration's sake
- **Breathing Animations** — All animations are slow, organic, non-jarring
- **Desktop-First** — Optimized for 1280px+ screens; mobile is a secondary concern

---

## 2. Design Tokens

All tokens are defined in `shared/styles/variables.css`.

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--black` | `#000000` | Primary background |
| `--white` | `#FFFFFF` | Primary text |
| `--amber` | `#D97706` | Brand accent, CTAs, active states |
| `--surface` | `#0D0D0D` | Card backgrounds |
| `--border` | `rgba(255,255,255,0.08)` | Dividers, card borders |
| `--text-body` | `rgba(255,255,255,0.75)` | Body copy |
| `--text-muted` | `rgba(255,255,255,0.50)` | Secondary text |
| `--text-dim` | `rgba(255,255,255,0.30)` | Captions, labels |
| `--red` | `#EF4444` | Errors, destructive actions |

### Typography

| Font | Use Cases |
|---|---|
| **Outfit** | Headlines, logo, bold UI labels |
| **DM Sans** | Body copy, descriptions |
| **DM Mono** | Labels, badges, code, metadata |
| **Syne** | Button text |
| **Bebas Neue** | Display numbers, large stats |

---

## 3. Component Rules

### Do
- Components render to a provided container element
- Components accept configuration via a plain options object
- Components return DOM elements, not HTML strings (when possible)
- Components use IDs only for unique interactive elements

### Don't
- Components don't import from `mock/` directly
- Components don't manage business logic
- Components don't modify global state directly
- Components don't use `document.write()`

### Component Anatomy
```js
/**
 * Creates a [ComponentName] element.
 * @param {Object} options
 * @returns {HTMLElement}
 */
export function createComponentName(options) {
    const el = document.createElement('div');
    el.className = 'component-class';
    // ... build DOM
    return el;
}
```

---

## 4. Module Responsibilities

| Module | Responsibility | Does Not |
|---|---|---|
| `dashboard` | Landing page UI + animations | Handle auth, manage user state |
| `authentication` | Auth modal, login flows, auth state | Navigate to routes, manage onboarding |
| `onboarding` | 4-step profile collection, draft saving | Handle auth, write to auth state |
| `development` | Dev tooling, panel, storage reset | Ship to production, modify prod behavior |
| `shared` | Design tokens, reset, common components | Contain feature-specific logic |
| `app` | Bootstrap, env config, feature flags | Contain business logic |

---

## 5. Naming Conventions

### Files
| Type | Convention | Example |
|---|---|---|
| Component | PascalCase | `AuthModal.js`, `LoginCard.js` |
| Service | camelCase + `Service` | `authService.js`, `profileService.js` |
| State | camelCase + `State` | `authState.js`, `onboardingState.js` |
| Mock | camelCase + `Mock` prefix or `mock` folder | `mockAuth.js` |
| Style | camelCase | `auth.css`, `devPanel.css` |
| Contract | camelCase + `.contracts.js` | `auth.contracts.js` |

### CSS Classes
- App styles: `kebab-case` (e.g. `.auth-modal`, `.ob-step`)
- Module prefix for multi-word: `auth-`, `ob-` (onboarding), `dev-`
- Never use `camelCase` or `PascalCase` in CSS

### JavaScript
- Constants: `SCREAMING_SNAKE_CASE`
- Private functions: `_prefixedWithUnderscore`
- Exported functions: `camelCase`
- Exported classes: `PascalCase`

### Storage Keys
- Always prefixed with `ws_`
- Registered in `storageReset.js`
- Example: `ws_profile`, `ws_auth_state`, `ws_onboarding_draft`

---

## 6. CSS Architecture Rules

1. Global design tokens in `variables.css` — never hardcode colors or font names
2. Module styles scoped to module-specific class prefix
3. Developer panel styles scoped to `#wsDev *` to prevent bleed
4. Never use `!important` unless overriding third-party styles
5. Prefer CSS custom properties for all theme values
6. Prefer `transition` over `animation` for simple state changes
7. Prefer `ease-in-out` for ambient effects, `ease-out` for user-triggered

---

## 7. Import Rules

```
✅  Component → Service
✅  Component → State (read-only)
✅  Service   → Mock
✅  Service   → State (read/write)
✅  Module    → Shared

❌  Component → Mock (never)
❌  Module A  → Module B's state (never, use events or shared state)
❌  Shared    → Module (never)
❌  app.js    → Mock (never directly)
```

---

## 8. Custom Input & Validation Handling

### Inline-Expand Fields
During onboarding, select choices may require custom values (e.g. "Other" exam target, "Custom" study hours):
- **Behavior**: These choices expand in-place, revealing text or numeric inputs below the option groups.
- **State Heuristic**: The selection state is derived by checking if the saved value matches predefined choices. If not, the custom option is automatically selected and the input is prefilled on load.
- **Validation**: Custom validation is run inline on step continue:
  - Specifying text inputs must not be empty.
  - Custom study hours must be a valid number between `1` and `16` hours.
- **Resolved Values**: All values are resolved to final types (e.g. `examTarget` as text, `targetStudyHours` as a numeric float like `5.5`) in Step 4 before calling the service layer.

### Centralized Authentication Entry Point
- **Exposed API**: Exposes `openAuthentication()` as the single unified entry point for starting the authentication flow.
- **Global Availability**: Exposes `window.openAuthentication` to allow future/non-module buttons to easily trigger authentication without direct JS module imports.
- **Trigger Attribute**: Wiring dynamically binds any element containing the `data-auth-trigger` attribute to trigger this centralized function.

### Subfolder Path Resolution
- **Style Injection Heuristics**: Authentication and Onboarding stylesheets are injected dynamically relative to the current window page context. It detects subdirectory page depths (e.g., inside `/modules/.../pages/`) to automatically prepend `../../../` relative path prefixes, ensuring assets load correctly on deep nested pages.

