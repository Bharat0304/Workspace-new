/* ============================================================
   WORKSPACE — Feature Flags
   Centralised registry of all feature switches.

   RULES:
   - All flags default to safe/conservative values.
   - Flags must never depend on each other (flat, independent).
   - Production overrides always win over defaults.
   - Read flags via `flags.get(FLAG_NAME)` to allow future
     runtime updates (e.g. remote config, A/B testing).
   ============================================================ */

import { ENV } from './env.js';

const STORAGE_KEY = 'ws_feature_flags';

/**
 * Default flag values per environment.
 * Production values are the source of truth for what ships.
 */
const DEFAULTS = {
    development: {
        enableDeveloperPanel: true,
        enableMockServices: true,
        enableExperimentalFeatures: false,

        // Debug tools (architecture placeholders — not yet functional)
        enableNetworkDelay: false,
        enableOfflineMode: false,
        enableUnauthorizedResponse: false,
        enableApiFailureSimulation: false,
        enableCorruptedData: false,
        enableSlowResponse: false,
    },
    staging: {
        enableDeveloperPanel: false,
        enableMockServices: false,
        enableExperimentalFeatures: false,

        enableNetworkDelay: false,
        enableOfflineMode: false,
        enableUnauthorizedResponse: false,
        enableApiFailureSimulation: false,
        enableCorruptedData: false,
        enableSlowResponse: false,
    },
    production: {
        enableDeveloperPanel: false,
        enableMockServices: false,
        enableExperimentalFeatures: false,

        enableNetworkDelay: false,
        enableOfflineMode: false,
        enableUnauthorizedResponse: false,
        enableApiFailureSimulation: false,
        enableCorruptedData: false,
        enableSlowResponse: false,
    },
};

/** All valid flag names. Single source of truth. */
export const FLAG_NAMES = Object.freeze({
    DEVELOPER_PANEL: 'enableDeveloperPanel',
    MOCK_SERVICES: 'enableMockServices',
    EXPERIMENTAL: 'enableExperimentalFeatures',
    NETWORK_DELAY: 'enableNetworkDelay',
    OFFLINE_MODE: 'enableOfflineMode',
    UNAUTHORIZED_RESPONSE: 'enableUnauthorizedResponse',
    API_FAILURE: 'enableApiFailureSimulation',
    CORRUPTED_DATA: 'enableCorruptedData',
    SLOW_RESPONSE: 'enableSlowResponse',
});

// Load runtime overrides from localStorage (dev environment only)
function _loadOverrides() {
    if (ENV.isProduction) return {};
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function _saveOverrides(overrides) {
    if (ENV.isProduction) return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    } catch { /* noop */ }
}

const _baseDefaults = DEFAULTS[ENV.current] ?? DEFAULTS.production;
let _runtimeOverrides = _loadOverrides();
let _activeFlags = { ..._baseDefaults, ..._runtimeOverrides };

// Production hard-lock: always false for safety flags regardless of overrides
if (ENV.isProduction) {
    _activeFlags = { ...DEFAULTS.production };
}

export const featureFlags = Object.freeze({
    /**
     * Reads the current value of a flag.
     * @param {string} flagName
     * @returns {boolean}
     */
    get(flagName) {
        return !!_activeFlags[flagName];
    },

    /**
     * Sets a runtime flag override (dev/staging only).
     * Persists to localStorage. Updates take effect immediately.
     * @param {string} flagName
     * @param {boolean} value
     */
    set(flagName, value) {
        if (ENV.isProduction) {
            console.warn('[WorkSpace Flags] Cannot override flags in production.');
            return;
        }
        if (!(flagName in _baseDefaults)) {
            console.warn(`[WorkSpace Flags] Unknown flag: "${flagName}"`);
            return;
        }
        _runtimeOverrides[flagName] = !!value;
        _activeFlags[flagName] = !!value;
        _saveOverrides(_runtimeOverrides);
        console.info(`[WorkSpace Flags] "${flagName}" set to ${!!value}`);
    },

    /** Resets a specific flag to its environment default. */
    reset(flagName) {
        delete _runtimeOverrides[flagName];
        _activeFlags[flagName] = _baseDefaults[flagName] ?? false;
        _saveOverrides(_runtimeOverrides);
    },

    /** Resets all flags to environment defaults. */
    resetAll() {
        _runtimeOverrides = {};
        _activeFlags = { ..._baseDefaults };
        _saveOverrides({});
        console.info('[WorkSpace Flags] All flags reset to defaults.');
    },

    /** Returns a snapshot of all current flag values. */
    getAll() {
        return { ..._activeFlags };
    },

    /** Returns the environment-level defaults (before any overrides). */
    getDefaults() {
        return { ..._baseDefaults };
    },
});

// Expose to window for console debugging (non-production only)
if (!ENV.isProduction) {
    window.__WS_FLAGS__ = featureFlags;
}
