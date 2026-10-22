# WorkSpace — Architecture Decision Records (ADR)

All significant technical decisions are recorded here in ADR format.  
Decisions are append-only — never deleted, only superseded.

---

## ADR-001: Feature-Based Architecture

**Date:** 2026-06-17  
**Status:** Accepted

### Context
The project has three developers working in parallel (Frontend, Backend, Electron). A flat file structure would cause constant merge conflicts and unclear ownership boundaries.

### Decision
Adopt a **Feature-Based Module Architecture** where each product feature lives in its own `modules/[feature]/` directory containing components, services, state, mock, styles, and contracts.

### Alternatives Considered
- **Layer-based (MVC):** All components in one folder, all services in another. Rejected — causes conflicts when multiple devs work on related features.
- **Atomic design:** Components organized by size (atoms, molecules, organisms). Rejected — doesn't map naturally to feature ownership.

### Consequences
- Each developer can own a module end-to-end
- Modules are independently testable
- Imports are explicit and traceable
- Adding a new feature = adding a new module folder

### Future Considerations
When a build tool is introduced, module boundaries will map cleanly to code-splitting chunks.

---

## ADR-002: Linear Face Rotation Mapping

**Date:** 2026-06-17  
**Status:** Accepted

### Context
The 3D face on the landing page was using a quadratic scroll mapping that caused direction reversal near the bottom of the page, creating a jarring user experience.

### Decision
Refactor scroll rotation to use linear interpolation (`lerp`) from far left to far right across the full scroll range. Rotation angle is clamped and never reverses.

### Consequences
- Smooth, predictable 3D face behavior
- No direction reversal at any scroll position
- Simplified scroll handler logic

---

## ADR-003: Modular CSS Architecture

**Date:** 2026-06-17  
**Status:** Accepted

### Context
A single `style.css` file was becoming unmanageable and causing unintended style collisions between page sections.

### Decision
Split styles into:
- `shared/styles/variables.css` — global design tokens
- `shared/styles/reset.css` — CSS reset + button utilities
- `shared/components/navbar.css` — navbar styles
- `modules/[feature]/styles/[feature].css` — module-local styles

### Consequences
- Styles are co-located with features
- No global namespace collisions
- Easier to onboard new developers

---

## ADR-004: Mock-First Development Pattern

**Date:** 2026-06-18  
**Status:** Accepted

### Context
The backend and Electron layers are not yet built. Frontend development needed to proceed without blocking on real API availability.

### Decision
All service modules include a `mock/` subdirectory with implementations that simulate real API behavior including realistic delays. The service layer calls mock implementations transparently. When the backend is ready, only the service layer needs to change — components are unaffected.

### Alternatives Considered
- **Hardcoded data in components:** Rejected — creates deep coupling that's expensive to remove.
- **JSON fixture files:** Rejected — doesn't exercise async patterns or error handling.

### Consequences
- Frontend development is fully decoupled from backend readiness
- Mock services exercise the same code paths as production
- Testing is easier because mock behavior is deterministic

---

## ADR-005: Environment Configuration via Hostname Heuristics

**Date:** 2026-06-20  
**Status:** Accepted

### Context
Without a build tool, there is no standard way to inject environment variables at build time. The application needed a reliable way to detect development vs. production.

### Decision
Detect environment via a priority chain:
1. `window.__WS_ENV__` (build-tool or Electron injection)
2. `localStorage` override (`ws_env_override`) for developer convenience
3. Hostname heuristics (`localhost` → development, `workspace.app` → production)
4. Default: `development`

### Consequences
- Works without any build tooling
- Developers can override locally without touching code
- Electron can inject the correct environment at launch
- Adding a build tool later only requires setting `window.__WS_ENV__`

---

## ADR-006: Developer Panel Lazy Loading

**Date:** 2026-06-20  
**Status:** Accepted

### Context
The Developer Panel must be completely absent from production builds. With no build tool, dynamic imports are the only mechanism.

### Decision
`modules/development/index.js` double-gates the panel load:
1. `ENV.isProduction` check — returns immediately, no imports triggered
2. Feature flag check — panel disabled even in development if flag is off

The `DevPanel.js` component is loaded via `import()` (dynamic) so it's never part of the initial module graph in production.

### Consequences
- Zero production bundle impact
- Developer tooling is completely isolated
- The panel can be safely imported from `app.js` with no risk

---

## ADR-007: Storage Reset via Explicit Key Registry

**Date:** 2026-06-20  
**Status:** Accepted

### Context
A "Reset Application" feature needed to clear WorkSpace data without affecting unrelated browser storage (other apps, auth cookies, etc.).

### Decision
Maintain explicit arrays of known WorkSpace localStorage and sessionStorage keys in `storageReset.js`. Reset only keys in the registry. Add a safety scan for any `ws_` prefixed keys not yet in the registry (logs a warning to prompt registration).

### Alternatives Considered
- **`localStorage.clear()`:** Rejected — deletes all browser data for the origin, including non-WorkSpace data.
- **Wildcard prefix deletion only:** Accepted as secondary safety scan but not primary mechanism.

### Consequences
- Reset is surgical and safe
- Developers must register new keys (enforced by the safety scan warning)
- Transparent reporting of what was removed
