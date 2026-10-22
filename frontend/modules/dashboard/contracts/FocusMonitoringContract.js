/* ============================================================
   FOCUS MONITORING — Contracts
   JSDoc type definitions for the monitoring state and payloads.
   ============================================================ */

/**
 * @typedef {Object} LandmarkPoint
 * @property {number} x - Normalized X coordinate (0.0 to 1.0)
 * @property {number} y - Normalized Y coordinate (0.0 to 1.0)
 * @property {number} z - Normalized Z coordinate
 */

/**
 * @typedef {Object} FocusMonitoringState
 * @property {'prompt'|'granted'|'denied'} cameraPermission - User's webcam permission state
 * @property {'off'|'loading'|'active'|'error'} cameraStatus - Active camera connection state
 * @property {boolean} faceDetected - True if at least one face was detected in the frame
 * @property {LandmarkPoint[]} landmarks - Array of normalized landmarks from the face landmarker
 * @property {string|null} error - Holds permission error messages or initialization failures
 */
