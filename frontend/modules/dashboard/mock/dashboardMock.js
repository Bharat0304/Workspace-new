/* ============================================================
   DASHBOARD — Mock Data Layer
   Simulates a backend/monitoring engine with realistic data.
   All methods return Promises to mirror real async API calls.
   ============================================================ */

// ── Utilities ─────────────────────────────────────────────────

function _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function _isoDate(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
}

function _levelFromHours(hours, target) {
    if (hours === 0) return 0;
    if (hours > target) return 4;
    if (hours === target) return 3;
    if (hours >= target * 0.6) return 2;
    return 1;
}

// ── Consistency Heatmap Mock ──────────────────────────────────

const DAILY_TARGET = 6; // hours

/**
 * Generates 365 days of realistic study history.
 * Students tend to miss weekends occasionally and have productive weekdays.
 */
function _generateHeatmap() {
    const days = [];
    for (let i = 364; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
        const isToday = i === 0;

        let hours = 0;
        if (isToday) {
            hours = 4.5; // today partial
        } else if (dayOfWeek === 0) {
            // Sunday — 30% chance of studying
            hours = Math.random() < 0.3 ? +(Math.random() * 4).toFixed(1) : 0;
        } else if (dayOfWeek === 6) {
            // Saturday — 50% chance
            hours = Math.random() < 0.5 ? +(Math.random() * 5 + 1).toFixed(1) : 0;
        } else {
            // Weekday — 80% chance, varying intensity
            if (Math.random() < 0.8) {
                const rand = Math.random();
                if (rand < 0.2) {
                    // Level 3 (target met exactly)
                    hours = DAILY_TARGET;
                } else if (rand < 0.5) {
                    // Level 4 (target exceeded)
                    hours = +(DAILY_TARGET + 0.5 + Math.random() * 4).toFixed(1);
                } else if (rand < 0.8) {
                    // Level 2 (good study session)
                    hours = +(DAILY_TARGET * 0.6 + Math.random() * (DAILY_TARGET * 0.35)).toFixed(1);
                } else {
                    // Level 1 (light session)
                    hours = +(0.5 + Math.random() * (DAILY_TARGET * 0.5)).toFixed(1);
                }
            } else {
                hours = 0;
            }
        }

        days.push({
            date: _isoDate(i),
            studyHours: hours,
            targetHours: DAILY_TARGET,
            completionLevel: _levelFromHours(hours, DAILY_TARGET)
        });
    }
    return days;
}

/**
 * Returns 365-day consistency heatmap data.
 * @returns {Promise<import('../contracts/DashboardContracts.js').ConsistencyData>}
 */
export async function mockGetConsistency() {
    await _delay(200);
    const heatmap = _generateHeatmap();

    return {
        heatmap
    };
}

export async function mockGetGrowth() {
    await _delay(250);

    const history = [
        { period: "DAY 1", studyTime: 2.3, focusScore: 1.6, productivityIndex: 1.5, diff: 1.5 },
        { period: "DAY 7", studyTime: 3.0, focusScore: 2.6, productivityIndex: 3.8, diff: 2.3 },
        { period: "DAY 14", studyTime: 4.2, focusScore: 3.2, productivityIndex: 5.0, diff: 1.2 },
        { period: "DAY 30", studyTime: 5.2, focusScore: 3.9, productivityIndex: 6.1, diff: 1.1 }
    ];

    const current = 82;
    const weekTrend = 8.0;

    return {
        currentScore: current,
        weekTrend,
        history
    };
}

// ── Monitoring Status Mock ────────────────────────────────────

/**
 * Returns the current monitoring engine status.
 * @returns {Promise<import('../contracts/DashboardContracts.js').MonitoringStatus>}
 */
export async function mockGetMonitoringStatus() {
    await _delay(100);
    return {
        faceDetected: true,
        monitoringActive: true,
        lastChecked: new Date().toISOString()
    };
}

// ── Current Session Mock ──────────────────────────────────────

/**
 * Returns the current active study session from the timetable.
 * @returns {Promise<import('../contracts/DashboardContracts.js').CurrentSession>}
 */
export async function mockGetCurrentSession() {
    await _delay(150);
    return {
        subject: 'Physics',
        topic: 'Electrostatics',
        goal: 'Complete Chapter 3 Notes',
        startTime: '09:00 AM',
        endTime: '10:30 AM'
    };
}

// ── Session Timer Mock ────────────────────────────────────────

/**
 * Returns mock timer state (remaining seconds in current session).
 * @returns {Promise<import('../contracts/DashboardContracts.js').TimerState>}
 */
export async function mockGetTimer() {
    await _delay(50);
    return {
        remainingSeconds: 45 * 60 + 23, // 45:23
        totalSeconds: 90 * 60, // 90 minutes
        isRunning: true
    };
}
