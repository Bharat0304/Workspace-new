# WorkSpace — Dashboard Module (Study Command Center)

The Dashboard is the home page and central **Study Command Center** for the WorkSpace application. Rather than behaving like a passive marketing or SaaS analytics portal, it acts as a cockpit that answers the user's primary discipline questions at a glance.

---

## 🎯 Purpose & Goals

The Dashboard is built to provide immediate answers to four fundamental questions when a student opens WorkSpace:
1. **Have I been consistent?** (Answered by the **Consistency Heatmap**)
2. **Am I improving?** (Answered by the **Productivity Growth Score** and trajectory sparkline)
3. **Is WorkSpace monitoring me?** (Answered by the **Focus Monitoring Status** overlay)
4. **What should I be doing right now?** (Answered by the **Session Timer** and **Now Studying** cards)

---

## 🏗️ Component Hierarchy

The Dashboard follows a modular component-driven architecture:

```
[dashboardMain] (Page Container)
├── ConsistencyTracker
│   └── ContributionHeatmap (GitHub-style 90-day SVG grid)
└── db-command-center (Layout Grid)
    ├── db-col-left (Left Column)
    │   └── ProductivityGrowth (Score + SVG sparkline trend)
    └── db-col-right (Right Column)
        ├── FocusMonitoring (Camera simulation + live SVG face mesh animation)
        ├── SessionTimer (MM:SS Countdown manager)
        └── CurrentSession (Subject card displaying current goal + end time)
```

---

## 💾 State Management (`state/`)

All dashboard module state is managed in a centralized singleton store (`dashboardState.js`):
- `consistency`: Holds 90-day study logs, today's total hours, goal hours, and streak counter.
- `growth`: Holds current Growth Score, weekly change percentage, and 12-week historical scores.
- `monitoring`: Holds face detection flags, monitoring engine state, and heartbeat checks.
- `currentSession`: Details the active timetable row (subject, topic, goal, timings).
- `timer`: Tracks countdown state (remaining seconds, running flag).
- `isLoading` / `error`: Manages global module async states.

---

## ⚙️ Services & Mock Data Layer (`services/` & `mock/`)

- **`dashboardService.js`**: Exposes interface queries (`load()`, getters) and tick handlers to the components. It isolates components from the details of the backend layer.
- **`dashboardMock.js`**: Simulates a high-performance database and monitoring engine. Generates realistic noise-injected data for 90 consistency logs and 12 weeks of growth scores.

---

## 🔌 Dependencies

- **Global Auth Store (`authentication/state/authState.js`)**: Gates dashboard page load; redirects non-authenticated requests to `index.html`.
- **Shared Navbar (`shared/components/navbar.js`)**: Renders the persistent desktop and mobile app shell structure.
- **Global Design Tokens (`shared/styles/variables.css`)**: Pulls typography styles, dark theme surface colors, and hover micro-animations.

---

## 🚀 Current Implementation Status (Beta V1)

- [x] **Page Bootstrapping**: Implemented dynamic lifecycle mounting and auth checking.
- [x] **Consistency Heatmap**: Done. 90-day right-aligned SVG grid mapping study intensity levels (empty, light, mid, full) based on user goal metrics.
- [x] **Productivity Growth**: Done. Custom mathematical-model sparkline generated using pure SVG `polyline` elements with micro-animations.
- [x] **Focus Monitoring**: Done. Live face landmark mesh animated on a canvas drawing 2D nodes, connections, scanline filters, and status heartbeats.
- [x] **Countdown Timer**: Done. Multi-hour parsing countdown displaying `H:MM:SS` or `MM:SS` format.
- [x] **Current Session Details**: Done. Reads active study session schema dynamically.
- [x] **Navigation & Integration**: Done. Integrated shell navbar redirection links and DevPanel shortcut routing.

---

## 🔮 Future Improvements

1. **Production Backend Integration**: Replace mock API delays with live Database query providers.
2. **Monitoring Engine Hook**: Connect the canvas SVG face mesh component to real face tracking/camera inputs.
3. **Session engine synchronization**: Wire the timer and active subject card directly to the active session engine once timetable countdown actions launch.
