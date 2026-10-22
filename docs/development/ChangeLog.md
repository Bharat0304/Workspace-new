# WorkSpace — Changelog

All notable changes to WorkSpace are documented here.  
Format: Semantic Versioning. Each version entry is append-only.

---

## [0.2.2] — 2026-06-21

### Added
- **Centralized Authentication API**: Created `openAuthentication()` as the single entry point function, and exposed it on `window.openAuthentication` to allow simple, future-proof integration for future CTA buttons.
- **Dynamic Path Heuristics**: Added context-aware directory path heuristics to the Authentication and Onboarding stylesheet injection functions, allowing pages in nested subdirectories (such as Analytics) to load assets correctly.

### Changed
- **Analytics Page CTA Integration**: Integrated the Analytics page (`analytics.html`) with the Authentication module by initializing `initAuth()` in the page load bundle and wiring the navbar and mobile overlay CTA buttons.

---

## [0.2.1] — 2026-06-20

### Added
- **Advanced Onboarding Inputs**: Inline-expanding text input for "Other" exam targets (Step 2) and numeric input for "Custom" study hours (Step 3).
- **Custom Validations**: Added required input validation for "Other" and range validation (1–16 hours) for "Custom" target study hours.

### Changed
- **Landing Page CTA Integration**: Connected all 4 landing page CTA buttons ("Start for Free", "Get Early Access", "Claim Your Spot", "Begin Your Baseline") and navbar/mobile "Log In" links to open the unified authentication modal.
- **Service Layer Formatting**: Form data is resolved to final types (e.g. float values for target study hours) before calling the profile service layer.

---

## [0.2.0] — 2026-06-20

### Added
- **Authentication Module** — mock Google OAuth + email/password, auth modal with spring animation
- **Onboarding Module** — 4-step new-user onboarding with option cards, form fields, review step, and loading overlay
- **Developer Module** — floating developer panel with 6 tabs (auth shortcuts, reset tools, navigation, state inspector, feature flags, simulation placeholders)
- **Environment Configuration** (`app/config/env.js`) — auto-detection with localStorage override
- **Feature Flags Registry** (`app/config/featureFlags.js`) — per-environment defaults, production hard-lock
- **Storage Reset System** — explicit key registry, safety scan, detailed removal report
- **Debug Tools Architecture** — 6 simulation placeholders (network delay, offline, 401, 500, corrupted data, slow response)
- **Documentation System** — `docs/product/`, `docs/architecture/`, `docs/development/` subdirectory structure
  - PRD, Roadmap, FeatureTickets, TechnicalArchitecture, FrontendSpecification, SecurityAndAccess, ArchitectureDecisions, ChangeLog, CodingGuidelines, GitWorkflow, Contributing
- **Module READMEs** — authentication, onboarding, development modules all have complete READMEs

### Changed
- `app/app.js` — added env config, feature flags, and dev panel initialization
- `docs/` — reorganized into `product/`, `architecture/`, `development/` subdirectories
- **Auth flow** — `loginWithGoogle()` now correctly checks localStorage for existing profile to determine `isNewUser`

### Architecture
- ADR-004: Mock-First Development
- ADR-005: Environment via Hostname Heuristics
- ADR-006: Developer Panel Lazy Loading
- ADR-007: Storage Reset via Explicit Key Registry

---

## [0.1.0] — 2026-06-17

### Added
- **Project Architecture** — Feature-based modular structure under `client/`
- **Landing Page** — hero, 3D face, bulb animation, pain sections, features, stats, testimonials, FAQ, final CTA
- **Shared Design System** — CSS variables, reset, button utilities
- **Navbar + Footer** — responsive navigation with hamburger menu
- **Analytics Placeholder** — basic analytics page scaffold
- **Bulb Interaction** — cursor-follow with 0.12s ease-out, particle field, glow aura
- **3D Face Animation** — scroll-driven rotation with linear interpolation
- **Scroll Reveal** — intersection observer for section entry animations
- **Design Guidelines** — `docs/architecture/DesignSystem.md` documenting tokens, typography, animation rules

### Fixed
- 3D face direction reversal at bottom of page (linear mapping, ADR-002)

### Architecture
- ADR-001: Feature-Based Architecture
- ADR-002: Linear Face Rotation Mapping
- ADR-003: Modular CSS Architecture

---

## [Unreleased]

### Planned for 0.3.0
- Session Timer module
- Post-session Reflection module
- SPA Router
- Dashboard module

---

*Versioning follows [Semantic Versioning](https://semver.org/). MAJOR.MINOR.PATCH where MINOR = new feature milestone.*
