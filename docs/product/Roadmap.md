# WorkSpace — Product Roadmap

**Last Updated:** 2026-06-20

---

## Milestones

### ✅ Milestone 0.1 — Foundation (Complete)
> *Project structure, landing page, 3D face animation*

- [x] Feature-based architecture established
- [x] Shared design tokens and reset CSS
- [x] Navbar and footer components
- [x] Landing page — hero, pain sections, features, stats, FAQ
- [x] 3D face (scroll-driven rotation, linear interpolation)
- [x] Bulb interaction (cursor follow, particle effects)
- [x] Analytics placeholder page
- [x] Mobile-responsive navigation

---

### ✅ Milestone 0.2 — Authentication & Onboarding (Complete)
> *New user entry flow*

- [x] Environment configuration (`env.js`)
- [x] Feature flags registry (`featureFlags.js`)
- [x] Authentication module (mock Google + email/password)
- [x] Auth modal (overlay, spring animation, loading/error states)
- [x] 4-step onboarding flow
  - Step 1: Personal info (Google prefill)
  - Step 2: Academic profile (exam target + study hours)
  - Step 3: Goals (target hours, study time, motivation)
  - Step 4: Review + Create Workspace
- [x] Workspace creation loading overlay (4-stage animation)
- [x] Draft persistence (auto-save to localStorage)
- [x] Developer Panel (floating, collapsible, 6 tabs)
- [x] Developer Infrastructure (dev module, storage reset, debug placeholders)
- [x] Documentation system established

---

### 🔲 Milestone 0.3 — Session Engine (Planned)
> *Core product loop — the study session*

- [ ] Session module scaffolding
- [ ] Session timer UI (minimal, focused)
- [ ] Subject/topic selection before session
- [ ] Session pause/resume
- [ ] Post-session summary screen
- [ ] Reflection prompt (3 questions)
- [ ] Session data persistence

---

### 🔲 Milestone 0.4 — Dashboard (Planned)
> *The central hub*

- [ ] Dashboard module
- [ ] Today's session status card
- [ ] Streak counter
- [ ] Weekly session heatmap
- [ ] Goal progress ring
- [ ] Recent sessions list

---

### 🔲 Milestone 0.5 — Analytics (Planned)
> *Pattern visibility*

- [ ] Analytics module (replacing placeholder)
- [ ] Subject distribution chart
- [ ] Focus quality trend
- [ ] Daily/weekly/monthly views
- [ ] Comparison vs. goals

---

### 🔲 Milestone 0.6 — Electron Integration (Planned)
> *Desktop-native features*

- [ ] Electron main process setup
- [ ] Native notifications
- [ ] System idle detection
- [ ] Auto-launch on startup
- [ ] Offline-first data sync

---

### 🔲 Milestone 1.0 — Production Release (Future)
> *Polish and launch*

- [ ] Backend integration (replace mock services)
- [ ] Real Google OAuth
- [ ] User data API
- [ ] Performance audit
- [ ] Accessibility audit
- [ ] Landing page final polish
- [ ] Production build pipeline

---

## Upcoming (Next Sprint)

| Item | Priority | Owner |
|---|---|---|
| Session module scaffold | High | Frontend |
| Session timer UI | High | Frontend |
| Dashboard module scaffold | High | Frontend |
| Routing layer (SPA-style) | High | Frontend |
| Backend API design | High | Backend |
| Electron project setup | Medium | Electron |
