# screenshots/

Product screenshots for the README and documentation.

Add the following screenshots as the corresponding features ship:

| Filename | Content | Feature |
|---|---|---|
| `landing.png` | Landing page hero — bulb, animations, CTAs | `dashboard` module |
| `auth.png` | Authentication modal | `authentication` module |
| `onboarding.png` | Onboarding flow (any step) | `onboarding` module |
| `dashboard.png` | Main user dashboard | `dashboard` module *(planned)* |
| `heatmap.png` | Analytics performance heatmap | `analytics` module *(planned)* |
| `focus-monitor.png` | Active session focus monitor | `session` module *(planned)* |
| `study-capacity.png` | Study capacity visualization | `analytics` module *(planned)* |
| `dev-panel.png` | Developer panel (for contributors) | `development` module |

## Guidelines

- **Format:** PNG for UI screenshots, WebP acceptable for animated captures
- **Resolution:** 1280×800 minimum (desktop-first app)
- **Theme:** Always dark mode — WorkSpace is dark-only
- **No personal data:** Blur or mock any real email addresses or names
- **Consistent scale:** Capture at 100% browser zoom, no OS-level scaling

## How to Capture

1. Serve the app: `cd client && python -m http.server 3000`
2. Open `http://localhost:3000` in Chrome
3. Set DevTools device to 1280×800
4. Use the Developer Panel to navigate to the desired state
5. Capture with `⌘+Shift+5` (macOS) or Snipping Tool (Windows)
