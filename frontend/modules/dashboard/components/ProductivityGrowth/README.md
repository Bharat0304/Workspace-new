# Productivity Growth Component

This component visualises long-term discipline growth over the course of a day. Rather than cluttering the screen with multiple KPIs or complex charts, it relies on a single clean SVG curve.

## Purpose

To answer: **"Am I improving over time?"**

The component uses a subtle Growth Score derived from Study Hours, Consistency, Focus, and Distractions.

## Architecture

```
ProductivityGrowth (Parent wrapper and metadata info)
└── GrowthChart (Responsive SVG spline renderer)
```

## Styling

Aligned with the WorkSpace dark desktop Command Center standards:
- Smooth cubic Bézier spline curve.
- Soft glowing stroke filter.
- Linear gradient fill beneath the curve fading to transparent.
- Subtle horizontal gridlines.
- Clear X/Y axis labels.
