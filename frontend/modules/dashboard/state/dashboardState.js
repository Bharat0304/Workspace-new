/* ============================================================
   DASHBOARD — State Store
   Singleton state. UI reads from here; services write to here.
   ============================================================ */

/** @type {import('../contracts/DashboardContracts.js').DashboardState} */
const _defaults = {
    consistency:    null,
    growth:         null,
    monitoring:     null,
    currentSession: null,
    timer:          null,
    isLoading:      false,
    error:          null
};

let _state = { ..._defaults };

export const dashboardState = {
    /** Returns a deep copy of the current state. */
    getState() {
        return JSON.parse(JSON.stringify(_state));
    },

    /** Sets loading indicator. */
    setLoading(loading) {
        _state.isLoading = loading;
    },

    /** Stores a global error message. */
    setError(msg) {
        _state.error = msg;
        _state.isLoading = false;
    },

    /** Clears error state. */
    clearError() {
        _state.error = null;
    },

    /** Saves consistency data (heatmap + today hours). */
    setConsistency(data) {
        _state.consistency = data;
    },

    /** Saves growth score and history. */
    setGrowth(data) {
        _state.growth = data;
    },

    /** Saves monitoring engine status. */
    setMonitoring(data) {
        _state.monitoring = data;
    },

    /** Saves current active session info. */
    setCurrentSession(data) {
        _state.currentSession = data;
    },

    /** Saves timer state. */
    setTimer(data) {
        _state.timer = data;
    },

    /** Sets the running/countdown status of the session timer. */
    setTimerRunning(running) {
        if (_state.timer) {
            _state.timer.isRunning = running;
        }
    },

    /** Updates remaining seconds only (called by countdown interval). */
    tickTimer() {
        if (_state.timer && _state.timer.remainingSeconds > 0) {
            _state.timer.remainingSeconds -= 1;
        }
    },

    /** Resets state to defaults. */
    reset() {
        _state = { ..._defaults };
    }
};
