/* ============================================================
   DASHBOARD — Contracts
   JSDoc type definitions for all dashboard data shapes.
   UI, Services, State, and Mock all reference these types.
   ============================================================ */

/**
 * @typedef {Object} HeatmapDay
 * @property {string} date            - ISO date string "YYYY-MM-DD"
 * @property {number} studyHours      - Hours studied that day (0–16)
 * @property {number} targetHours     - Daily target hours for that day
 * @property {0|1|2|3|4} completionLevel - Visual intensity level (0: no study, 1: light, 2: mid, 3: target, 4: exceeded)
 */

/**
 * @typedef {Object} ConsistencyData
 * @property {HeatmapDay[]} heatmap      - Last 365 days of data
 */

/**
 * @typedef {Object} GrowthPoint
 * @property {string} period             - Period label e.g. "DAY 1", "DAY 7"
 * @property {number} studyTime          - Study time in hours (0–8)
 * @property {number} focusScore         - Focus score (0–8)
 * @property {number} productivityIndex  - Productivity index (0–8)
 * @property {number} diff               - Change relative to previous checkpoint
 */

/**
 * @typedef {Object} GrowthData
 * @property {number}       currentScore  - Latest growth score (0–100)
 * @property {number}       weekTrend     - % change vs last week (can be negative)
 * @property {GrowthPoint[]} history      - Trajectory data points across time periods
 */

/**
 * @typedef {Object} MonitoringStatus
 * @property {boolean} faceDetected      - Whether a face is currently visible
 * @property {boolean} monitoringActive  - Whether the monitoring engine is running
 * @property {string}  lastChecked       - ISO timestamp of last status update
 */

/**
 * @typedef {Object} CurrentSession
 * @property {string} subject   - e.g. "Physics"
 * @property {string} topic     - e.g. "Electrostatics"
 * @property {string} goal      - e.g. "Complete Chapter 3 Notes"
 * @property {string} endTime   - Display string e.g. "10:30 AM"
 * @property {string} startTime - Display string e.g. "09:00 AM"
 */

/**
 * @typedef {Object} TimerState
 * @property {number}  remainingSeconds - Seconds remaining in current session
 * @property {number}  totalSeconds     - Total duration in seconds of current session
 * @property {boolean} isRunning        - Whether countdown is active
 */

/**
 * @typedef {Object} DashboardState
 * @property {ConsistencyData|null}  consistency
 * @property {GrowthData|null}       growth
 * @property {MonitoringStatus|null} monitoring
 * @property {CurrentSession|null}   currentSession
 * @property {TimerState|null}       timer
 * @property {boolean}               isLoading
 * @property {string|null}           error
 */
