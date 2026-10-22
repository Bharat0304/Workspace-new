/* ============================================================
   DEVELOPMENT MODULE — Developer State Store
   Tracks the developer panel's own UI state and debug context.
   Isolated from production state stores.
   ============================================================ */

const DEV_STATE_KEY = 'ws_dev_state';

const _defaults = {
    panelOpen: false,
    panelPosition: 'bottom-right',   // future: allow drag repositioning
    activeTab: 'auth',               // 'auth' | 'app' | 'navigation' | 'state' | 'flags' | 'simulation'
    logEntries: [],
    lastAction: null,
    lastActionTimestamp: null,
};

let _state = _loadState();

function _loadState() {
    try {
        const raw = sessionStorage.getItem(DEV_STATE_KEY);
        return raw ? { ..._defaults, ...JSON.parse(raw) } : { ..._defaults };
    } catch {
        return { ..._defaults };
    }
}

function _persist() {
    try {
        // Don't persist log entries to keep storage clean
        const { logEntries: _, ...stateToPersist } = _state;
        sessionStorage.setItem(DEV_STATE_KEY, JSON.stringify(stateToPersist));
    } catch { /* noop */ }
}

export const devState = {
    /** Returns a copy of the current dev state. */
    getState() {
        return { ..._state, logEntries: [..._state.logEntries] };
    },

    /** Opens or closes the developer panel. */
    setOpen(open) {
        _state.panelOpen = !!open;
        _persist();
    },

    /** Returns whether the panel is currently open. */
    isOpen() {
        return _state.panelOpen;
    },

    /** Sets the active panel tab. */
    setActiveTab(tab) {
        _state.activeTab = tab;
        _persist();
    },

    /** Returns the active tab name. */
    getActiveTab() {
        return _state.activeTab;
    },

    /**
     * Records a developer action to the in-memory log.
     * Max 50 entries (rolling).
     * @param {string} action
     * @param {'info'|'warn'|'error'|'success'} level
     */
    log(action, level = 'info') {
        const entry = {
            timestamp: new Date().toISOString(),
            action,
            level,
        };
        _state.logEntries.unshift(entry);
        if (_state.logEntries.length > 50) {
            _state.logEntries = _state.logEntries.slice(0, 50);
        }
        _state.lastAction = action;
        _state.lastActionTimestamp = entry.timestamp;
        // Mirror to console for easy debugging
        const consoleFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info;
        consoleFn(`[DevPanel] ${action}`);
        _persist();
    },

    /** Clears all log entries. */
    clearLog() {
        _state.logEntries = [];
    },

    /** Returns all log entries (most recent first). */
    getLogs() {
        return [..._state.logEntries];
    },

    /** Resets dev state to defaults. */
    reset() {
        _state = { ..._defaults };
        try { sessionStorage.removeItem(DEV_STATE_KEY); } catch { /* noop */ }
    },
};
