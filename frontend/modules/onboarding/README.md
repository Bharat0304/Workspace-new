# Onboarding Module

Manages the 4-step new-user onboarding flow for WorkSpace. Triggered after successful authentication when `isNewUser = true`.

## Files

```
onboarding/
├── mock/
│   └── mockProfile.js       — Simulated profile creation with staged delays
├── state/
│   └── onboardingState.js   — State + auto-draft persistence to localStorage
├── services/
│   └── profileService.js    — Public profile API (UI only imports this)
├── components/
│   ├── ProgressBar.js       — 4-step visual progress indicator
│   ├── OptionCard.js        — Selectable card group component
│   ├── FormCard.js          — Labeled input with inline validation
│   ├── ReviewCard.js        — Key-value section with Edit button
│   └── LoadingOverlay.js    — Workspace creation animated loading screen
├── steps/
│   ├── Step1Personal.js     — Personal info (prefilled from Google)
│   ├── Step2Academic.js     — Exam target + current study hours
│   ├── Step3Goals.js        — Target hours, study time, motivation
│   └── Step4Review.js       — Review + Create Workspace CTA
├── styles/
│   └── onboarding.css       — Full onboarding page styles
├── contracts/
│   └── profile.contracts.js — API contract shapes (no backend)
└── index.js                 — Module entry: exports initOnboarding(user)
```

## Usage

```js
import { initOnboarding } from './modules/onboarding/index.js';
initOnboarding(user); // user = { name, email, photo }
```

Called automatically by `LoginCard.js` after a successful new-user login.

## Draft Persistence

All form data is auto-saved to `localStorage` under the key `ws_onboarding_draft`.
The draft is cleared after `profileService.createProfile()` completes.


## Custom Inputs & Validation

- **Step 2 (Academic)**: Selecting "Other" dynamically shows a text input field below the cards. Validates that it's not empty before proceeding.
- **Step 3 (Goals)**: Selecting "Custom" daily study hours reveals a numeric input field. Validates that it contains a valid number between `1` and `16` (inclusive, supports decimals). Selecting "Other" primary motivation reveals a text input field. Validates that it's not empty before proceeding.
- **Resolved Values**: Custom values replace generic options in state (e.g. `examTarget` is saved as the typed exam name, `primaryMotivation` is saved as the typed motivation). Numeric hours are parsed to floats before calling the profile service.


