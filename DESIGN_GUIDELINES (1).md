# WORKSPACE — Landing Page Design Guidelines

> A comprehensive design system and guideline document for the WORKSPACE landing page.
> Derived from the established hero section visual identity.

---

## 1. Brand Identity

### Concept
WORKSPACE is a focused, immersive study/productivity platform. The brand communicates:
- **Deep focus** — Dark, distraction-free environment
- **Illumination** — Knowledge as light, the bulb as the central metaphor
- **Human element** — Real students, real work, relatable imagery
- **Premium quality** — Refined typography, subtle animations, polished details

### Visual Metaphor
> A student studying under the glow of a single light bulb — the WORKSPACE bulb.
> The bulb replaces the "A" in SPACE, becoming both brand identity and narrative anchor.

---

## 2. Color Palette

### Primary Colors

| Token              | Value                          | Usage                              |
|---------------------|--------------------------------|--------------------------------------|
| `--bg-primary`      | `#000000`                      | Page background, dominant color      |
| `--text-primary`    | `#FFFFFF`                      | Foreground text (SPACE letters)      |
| `--text-secondary`  | `rgba(255, 255, 255, 0.55)`    | Background text (WORK), muted labels |
| `--glow-white`      | `rgba(255, 255, 255, 0.5)`     | Bulb glow, light effects             |
| `--glow-soft`       | `rgba(255, 255, 255, 0.12)`    | Ambient auras, text shadows          |

### Accent Colors (for future sections)

| Token              | Value                          | Usage                              |
|---------------------|--------------------------------|--------------------------------------|
| `--accent-blue`     | `#3B82F6`                      | CTAs, links, interactive highlights  |
| `--accent-blue-dim` | `rgba(59, 130, 246, 0.15)`     | Hover states, subtle backgrounds     |
| `--surface-dark`    | `#0A0A0A`                      | Card backgrounds, elevated surfaces  |
| `--surface-mid`     | `#111111`                      | Section dividers, subtle contrast    |
| `--border-subtle`   | `rgba(255, 255, 255, 0.06)`    | Card borders, separators             |

### Rules
- **No bright, saturated colors** in the hero or main content area.
- All color should feel **desaturated, cool, and monochromatic**.
- Accent blue is used **sparingly** — only for interactive elements.
- Light effects are always **white** — never warm/amber.

---

## 3. Typography

### Font Family
```css
font-family: 'Outfit', sans-serif;
```
Loaded from Google Fonts: `wght@400;700;800;900`

### Type Scale

| Element            | Weight | Size                              | Color                           | Notes                    |
|--------------------|--------|------------------------------------|---------------------------------|--------------------------|
| WORK (bg text)     | 900    | `clamp(5rem, 13vw, 15rem)`        | `rgba(255,255,255,0.55)`        | Blurred 0.8px, breathing anim |
| SPACE (fg text)    | 800    | `clamp(3rem, 6.5vw, 8rem)`        | `#FFFFFF`                       | Crisp, subtle text-shadow |
| Section Headings   | 800    | `clamp(2rem, 4vw, 3.5rem)`        | `#FFFFFF`                       |                          |
| Subheadings        | 700    | `clamp(1.2rem, 2vw, 1.8rem)`      | `rgba(255,255,255,0.7)`         |                          |
| Body Text          | 400    | `clamp(0.95rem, 1.2vw, 1.1rem)`   | `rgba(255,255,255,0.6)`         |                          |
| Captions / Labels  | 400    | `clamp(0.75rem, 0.9vw, 0.85rem)`  | `rgba(255,255,255,0.4)`         | Uppercase, letter-spacing |
| Buttons            | 700    | `1rem`                            | `#FFFFFF`                       |                          |

### Rules
- **All text is uppercase** for headings and labels.
- Letter-spacing: `0.06em` – `0.08em` for display text.
- No decorative or serif fonts — Outfit only.
- Line height: `1.4` for body, `1.1` for display headings.

---

## 4. Visual Hierarchy & Layout

### Hero Section Structure
```
┌─────────────────────────────────────────────┐
│                                             │
│              W O R K                        │  ← Background layer, z-index: 1
│            S P 💡 C E                       │  ← Foreground layer, z-index: 5
│               ◉ (glow)                      │  ← Bulb + aura, z-index: 6
│                                             │
│         ┌──────────────────┐                │
│         │  🧑‍💻 Student      │                │  ← Student section (below hero)
│         │  at desk          │                │
│         └──────────────────┘                │
│                                             │
└─────────────────────────────────────────────┘
```

### Layer Stack (z-index)

| Layer              | z-index | Description                        |
|--------------------|---------|------------------------------------|
| Background text    | 1       | "WORK" — large, muted, blurred     |
| Ambient glow       | 2       | Soft radial gradient overlay        |
| Particle field     | 3       | Tiny floating white particles       |
| Student image      | 4       | Below hero, separate section        |
| Foreground text    | 5       | "SPACE" — crisp white               |
| Bulb + wrapper     | 6       | Interactive bulb with glow auras    |

### Spacing System

| Token         | Value    | Usage                              |
|---------------|----------|------------------------------------|
| `--space-xs`  | `0.5rem` | Inner element padding              |
| `--space-sm`  | `1rem`   | Component gaps                     |
| `--space-md`  | `2rem`   | Section inner padding              |
| `--space-lg`  | `4rem`   | Between sections                   |
| `--space-xl`  | `6rem`   | Major section separators           |
| `--space-2xl` | `8rem`   | Hero bottom to content             |

### Grid
- Max content width: `1200px`, centered.
- 12-column grid with `1.5rem` gutter for content sections.
- Hero is full-bleed (`100vw`).

---

## 5. Imagery & Photography

### Student Image Treatment
- **Source**: Real photography, not illustrations.
- **Background**: Must be transparent or deep black — blends into `#000000`.
- **Lighting**: Top-down or slightly angled, white/cool tones only.
- **Processing**: If background isn't pure black, use canvas pixel manipulation:
  - Remove light pixels (brightness > 180, saturation < 0.15) → transparent
  - Smooth anti-aliased edges in transition zone (brightness 140–180)
- **CSS masking**: Radial gradient mask for soft edge fade:
  ```css
  mask-image: radial-gradient(
      ellipse 95% 90% at 50% 48%,
      black 65%, transparent 100%
  );
  ```
- **Brightness boost**: `filter: brightness(1.15) contrast(1.05)` for clarity on dark bg.

### Bulb Image Treatment
- **Source**: 3D rendered photorealistic light bulb (tilted, inverted).
- **Background removal**: Canvas pixel processing — remove dark pixels (brightness < 35).
- **Desaturation**: Convert to greyscale for pure white light emission.
- **Glow**: CSS `drop-shadow` stacking for multi-layer white glow.

### General Image Rules
- No stock photo watermarks.
- All images must feel **moody, dark, focused**.
- Avoid bright, busy, or colorful imagery.
- People shown should be **actively studying/working** — never posing.

---

## 6. Effects & Animations

### Glow Effects
```css
/* Bulb glow — stacked drop-shadows */
filter:
    drop-shadow(0 0 30px rgba(255, 255, 255, 0.5))
    drop-shadow(0 0 70px rgba(255, 255, 255, 0.25))
    drop-shadow(0 0 120px rgba(255, 255, 255, 0.12));

/* Text shadow — letter glow */
text-shadow:
    0 0 25px rgba(255, 255, 255, 0.2),
    0 0 50px rgba(255, 255, 255, 0.08),
    0 0 80px rgba(255, 255, 255, 0.04);
```

### Animation Timing

| Animation         | Duration | Easing          | Notes                       |
|-------------------|----------|-----------------|-----------------------------|
| Bulb float        | 5s       | `ease-in-out`   | Subtle vertical bob (±5px)  |
| Aura pulse        | 4–5.5s   | `ease-in-out`   | Scale 1→1.12, opacity shift |
| Text breathe      | 6s       | `ease-in-out`   | Opacity 0.55→0.7            |
| Letter glow       | 4s       | `ease-in-out`   | Adjacent letters shimmer    |
| Ambient breathe   | 5s       | `ease-in-out`   | Background glow oscillation |
| Particle drift    | 2.5–6s   | `ease-in-out`   | Random direction, fade out  |
| Cursor follow     | 0.12s    | `ease-out`      | Bulb tracks mouse position  |

### Rules
- **Never use jarring animations** — everything is slow, smooth, breathing.
- Prefer `ease-in-out` for ambient effects.
- Prefer `ease-out` for user-triggered responses (cursor interaction).
- No bounce, no elastic, no spring physics.
- All animations should feel like **breathing** — organic, living, calm.

---

## 7. Interaction Design

### Cursor Interaction
- **Only the bulb** responds to mouse movement.
- Movement amount: `12px` max offset from center.
- Smoothing: `mouseX += (target - mouseX) * 0.05` per frame (lerp).
- Text layers are **completely fixed** — no parallax.

### Hover States (for future elements)
```css
/* Button hover */
transition: all 0.3s ease;
&:hover {
    background: rgba(59, 130, 246, 0.15);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);
    transform: translateY(-2px);
}

/* Card hover */
transition: all 0.4s ease;
&:hover {
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}
```

### Scroll Behavior
- Smooth scrolling enabled.
- Sections reveal naturally on scroll — no hijacked scroll.
- Optional: Subtle fade-in for content sections as they enter viewport.

---

## 8. Component Guidelines (Future Sections)

### Navigation Bar
- Fixed/sticky at top, transparent background with backdrop blur.
- Logo on left, nav links on right.
- Slim height: `60–72px`.
- Background becomes `rgba(0,0,0,0.8)` + `blur(12px)` on scroll.

### Feature Cards
```
┌─────────────────────────────┐
│                             │
│   🎯  Feature Icon          │
│                             │
│   Feature Title              │
│   Brief description of the  │
│   feature in 1-2 lines.     │
│                             │
└─────────────────────────────┘
```
- Background: `#0A0A0A`
- Border: `1px solid rgba(255,255,255,0.06)`
- Border-radius: `12px`
- Padding: `2rem`
- Hover: subtle lift + border brighten

### Call-to-Action Buttons
```css
.btn-primary {
    background: #3B82F6;
    color: #FFFFFF;
    padding: 0.8rem 2rem;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1rem;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-secondary {
    background: transparent;
    color: #FFFFFF;
    padding: 0.8rem 2rem;
    border-radius: 8px;
    font-weight: 700;
    border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Testimonial / Quote Block
- Large opening quotation mark in `rgba(255,255,255,0.1)`.
- Quote text in `rgba(255,255,255,0.7)`, italic.
- Author name in `#FFFFFF`, bold.
- Author role in `rgba(255,255,255,0.4)`.

### Footer
- Background: `#050505`
- Minimal, grid-based layout.
- Social icons in `rgba(255,255,255,0.4)`, brighten on hover.

---

## 9. Responsive Breakpoints

| Breakpoint  | Width        | Adjustments                                    |
|-------------|--------------|------------------------------------------------|
| Desktop     | ≥ 1024px     | Default layout                                 |
| Tablet      | 768–1023px   | Reduce hero height, scale text down             |
| Mobile      | < 768px      | Hero `50vh`, text significantly smaller, student image `50vw` |

### Mobile-Specific Rules
- WORK: `clamp(4rem, 16vw, 8rem)`
- SPACE: `clamp(2.5rem, 10vw, 5rem)`
- Bulb canvas: `80px` width
- Student image: `clamp(220px, 65vw, 380px)`
- Touch support: `touchmove` event for bulb interaction.

---

## 10. Performance Guidelines

- **Canvas processing**: Run image pixel manipulation once on load, not per frame.
- **Animation**: Use `requestAnimationFrame` for smooth 60fps cursor tracking.
- **Will-change**: Apply `will-change: transform` only to animated elements (bulb wrapper).
- **Passive listeners**: All `mousemove` and `touchmove` listeners use `{ passive: true }`.
- **Image formats**: Use `.png` for images requiring transparency processing; `.webp` for static.
- **Font loading**: `preconnect` to Google Fonts, load only needed weights.

---

## 11. Accessibility

- All interactive elements must have unique IDs.
- Maintain heading hierarchy: single `<h1>` per page.
- Decorative images (bulb, particles, glows) use `pointer-events: none`.
- Ensure text meets minimum contrast ratio against dark backgrounds.
- Provide `prefers-reduced-motion` media query to disable animations.
- Keyboard navigation support for all interactive sections below the hero.

---

## 12. File Structure

```
workspace/
├── index.html          # Main HTML structure
├── style.css           # All styles — design system + components
├── main.js             # JavaScript — image processing, animations, interactions
├── bulb.png            # 3D rendered light bulb image
├── student2.png        # Student studying at desk (transparent bg)
└── DESIGN_GUIDELINES.md # This file
```

---

## Quick Reference — The WORKSPACE Look

> **Dark. Focused. Alive.**

1. Pure black background — always `#000000`.
2. White light — never warm, never colored.
3. Slow breathing animations — never jarring.
4. Real photography — never illustrations.
5. Monochromatic palette — accent blue only for interactions.
6. Premium typography — Outfit, heavy weights, generous spacing.
7. Layered depth — background text, foreground text, floating bulb, student below.
8. Seamless blending — transparent backgrounds, radial masks, soft edges.
