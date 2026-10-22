# Consistency Heatmap Component

This component provides a yearly timeline visualization (365 days) of study habit consistency. Inspired by GitHub's contribution graph, it communicates study behaviour over the last year with minimal cognitive load.

## Purpose

To answer: **"How consistently have I shown up to study?"**

This component focuses *exclusively* on history, omitting daily metrics, streaks, or focus charts which belong to other modules.

## Layout Hierarchy

```
ConsistencyHeatmap (Container)
├── HeatmapGrid (SVG grid scheduler)
│   ├── WeekLabels ("Mon", "Wed", "Fri")
│   ├── MonthLabels (Transitions e.g. "Jul", "Aug")
│   └── HeatmapCell (Individual SVG rect elements with hover bindings)
├── HeatmapLegend (Legend wrapper Less -> More)
└── HeatmapTooltip (Global absolute positioned tooltip card)
```

## Styling

Uses clean typography, compact SVG layout, and dark themes aligned with WorkSpace variables.
- Level 0: No study (Dark background)
- Level 1: Under 50% target (Light green)
- Level 2: 50% to target (Medium green)
- Level 3: Target met exactly (Bright green)
- Level 4: Target exceeded (Brightest green)
