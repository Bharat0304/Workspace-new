# Focus Monitoring Component (Beta V1)

This module provides visual confirmation that the WorkSpace monitoring session is active. It initializes the webcam and overlays a real-time facial landmark mesh on the local camera feed.

## Purpose

To answer: **"Is WorkSpace actively monitoring my study session?"**

This component operates entirely on-device via browser APIs and MediaPipe, keeping tracking strictly private.

## Architecture

Follows a modular structure:

```
FocusMonitoring (Parent lifecycle)
└── FocusMonitoringContainer (State/Service subscriber)
    ├── WebcamPreview (HTML5 Video & permission cards)
    ├── FaceLandmarkOverlay (Futuristic SVG canvas mesh)
    └── MonitoringStatus (Camera Active & Face Detected indicators)
```

## Services & State

- **`cameraService.js`**: Starts/stops track stream allocations.
- **`faceDetectionService.js`**: Dynamic importer of MediaPipe WebAssembly modules.
- **`focusMonitoringState.js`**: Centralized store hosting permission, landmarks array, and status.

## Future Plans

- Eye tracking and looking-away notification hooks.
- Drowsiness indicators and strictness adaptation callbacks.
