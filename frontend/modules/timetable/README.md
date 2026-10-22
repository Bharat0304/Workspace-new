# Timetable Module

A lightweight, paper-like digital study sheet designed for establishing baseline routines, progressive cognitive overload calibration, and study accountability.

## Architecture

Following **Feature-Based Architecture**, the module is decoupled into state stores, service wrappers, API mock structures, and interactive UI views.

```
client/modules/timetable/
├── contracts/
│   └── timetable.contracts.js   # API Endpoint schemas
├── state/
│   └── timetableState.js       # Active workspace state & local storage drafts
├── mock/
│   └── mockTimetable.js        # Mock data storage with latency simulation
├── services/
│   └── timetableService.js     # Grid manipulations and validation logic
├── utils/
│   └── timeHelper.js           # Hour/minute string parser and overlap checkers
├── components/
│   ├── ModeSelection.js        # Card overlays for layout choice
│   ├── Toolbar.js              # Formatting triggers and custom colors
│   ├── TableGrid.js            # Spreadsheet editable table grid
│   └── ActionBar.js            # Bottom actions (Save, Discard, Reset)
├── styles/
│   └── timetable.css           # Layout dimensions, drag outlines, theme styles
├── pages/
│   └── timetable.html          # HTML dashboard template shell
└── index.js                    # Bootstrapper (verification and mounts)
```

## Data Schema & Contracts

### Column Configuration (`ColumnDef`)
```typescript
interface ColumnDef {
  id: string;      // Unique key (e.g. "session", "work", "description", "extraWork")
  label: string;   // Visual header title
  width?: number;  // Grid column width in pixels (drag-resizable)
}
```

### Session Row Configuration (`SessionRow`)
```typescript
interface SessionRow {
  id: string;
  startTime: string;      // Time string format: "HH:MM"
  endTime: string;        // Time string format: "HH:MM"
  breakDuration: number;  // Break length in minutes
  cells: {
    [columnId: string]: {
      value: string;
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      color?: string;       // Custom text hex/variable code
      background?: string;  // Custom background swatch
      align?: "left" | "center" | "right";
    }
  }
}
```

## Validations
The `timetableService.validateTimetable()` service runs verification checks:
1. **Time Column Safety**: Managed `session` time tracker column cannot be deleted or renamed.
2. **Interval Boundaries**: Start time must be chronologically before the end time (`startTime < endTime`).
3. **Value Completion**: Valid numerical inputs for breaks (positive limits).
4. **Layout Uniqueness**: Duplicate column identifiers are rejected.

## Verification & Testing
To run tests, open the browser test runner locally:
```
http://localhost:3000/modules/timetable/tests/timetable.test.html
```
This runs assertions asserting:
- `parseTimeToMinutes` boundary checks.
- State mutation functions (pushing, slicing, re-indexing rows).
- Validation intercept limits.
