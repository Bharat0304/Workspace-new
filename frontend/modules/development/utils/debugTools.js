/* ============================================================
   DEVELOPMENT MODULE — Debug Tools
   Architecture placeholders for future debug simulations.
   Currently: interface and logging only. No functionality.

   FUTURE IMPLEMENTATION NOTES (per simulation):
   ─────────────────────────────────────────────
   NETWORK_DELAY       → Intercept fetch/XHR, inject setTimeout before resolving.
   OFFLINE_MODE        → Intercept fetch, throw NetworkError or return cached stub.
   UNAUTHORIZED        → Intercept fetch, resolve with 401 status + JSON body.
   API_FAILURE         → Intercept fetch, resolve with 500 or reject with Error.
   CORRUPTED_DATA      → Mutate response JSON (swap types, nullify fields, inject NaN).
   SLOW_RESPONSE       → Add configurable delay (1000–8000ms) to all requests.
   ============================================================ */

import { featureFlags, FLAG_NAMES } from '../../../app/config/featureFlags.js';
import { devState } from '../state/devState.js';

// ── Simulation Configuration ────────────────────────────────

const _simulationConfig = {
    networkDelay: {
        enabled: false,
        delayMs: 2000,
    },
    offlineMode: {
        enabled: false,
    },
    unauthorizedResponse: {
        enabled: false,
        statusCode: 401,
    },
    apiFailure: {
        enabled: false,
        statusCode: 500,
        failureProbability: 1.0, // 1.0 = always fail
    },
    corruptedData: {
        enabled: false,
        corruptionLevel: 'partial', // 'partial' | 'full'
    },
    slowResponse: {
        enabled: false,
        minDelayMs: 2000,
        maxDelayMs: 8000,
    },
};

// ── Simulation Registry ──────────────────────────────────────

export const debugTools = Object.freeze({
    /**
     * Returns all current simulation configurations.
     */
    getConfig() {
        return JSON.parse(JSON.stringify(_simulationConfig));
    },

    /**
     * Network Delay Simulation
     * STATUS: Architecture placeholder — not yet implemented.
     * @param {boolean} enabled
     * @param {number} [delayMs=2000]
     */
    setNetworkDelay(enabled, delayMs = 2000) {
        _simulationConfig.networkDelay.enabled = !!enabled;
        _simulationConfig.networkDelay.delayMs = delayMs;
        devState.log(
            `[DEBUG] Network delay ${enabled ? `enabled (${delayMs}ms)` : 'disabled'} — placeholder, not yet functional`,
            'warn'
        );
        console.warn('[DebugTools] Network delay simulation: ARCHITECTURE PLACEHOLDER — implementation pending.');
    },

    /**
     * Offline Mode Simulation
     * STATUS: Architecture placeholder — not yet implemented.
     * @param {boolean} enabled
     */
    setOfflineMode(enabled) {
        _simulationConfig.offlineMode.enabled = !!enabled;
        devState.log(
            `[DEBUG] Offline mode ${enabled ? 'enabled' : 'disabled'} — placeholder, not yet functional`,
            'warn'
        );
        console.warn('[DebugTools] Offline mode simulation: ARCHITECTURE PLACEHOLDER — implementation pending.');
    },

    /**
     * Unauthorized Response Simulation
     * STATUS: Architecture placeholder — not yet implemented.
     * @param {boolean} enabled
     */
    setUnauthorizedResponse(enabled) {
        _simulationConfig.unauthorizedResponse.enabled = !!enabled;
        devState.log(
            `[DEBUG] Unauthorized response simulation ${enabled ? 'enabled' : 'disabled'} — placeholder`,
            'warn'
        );
        console.warn('[DebugTools] Unauthorized response simulation: ARCHITECTURE PLACEHOLDER — implementation pending.');
    },

    /**
     * API Failure Simulation
     * STATUS: Architecture placeholder — not yet implemented.
     * @param {boolean} enabled
     * @param {number} [failureProbability=1.0]
     */
    setApiFailure(enabled, failureProbability = 1.0) {
        _simulationConfig.apiFailure.enabled = !!enabled;
        _simulationConfig.apiFailure.failureProbability = Math.min(1, Math.max(0, failureProbability));
        devState.log(
            `[DEBUG] API failure simulation ${enabled ? 'enabled' : 'disabled'} — placeholder`,
            'warn'
        );
        console.warn('[DebugTools] API failure simulation: ARCHITECTURE PLACEHOLDER — implementation pending.');
    },

    /**
     * Corrupted Data Simulation
     * STATUS: Architecture placeholder — not yet implemented.
     * @param {boolean} enabled
     */
    setCorruptedData(enabled) {
        _simulationConfig.corruptedData.enabled = !!enabled;
        devState.log(
            `[DEBUG] Corrupted data simulation ${enabled ? 'enabled' : 'disabled'} — placeholder`,
            'warn'
        );
        console.warn('[DebugTools] Corrupted data simulation: ARCHITECTURE PLACEHOLDER — implementation pending.');
    },

    /**
     * Slow Response Simulation
     * STATUS: Architecture placeholder — not yet implemented.
     * @param {boolean} enabled
     * @param {number} [minMs=2000]
     * @param {number} [maxMs=8000]
     */
    setSlowResponse(enabled, minMs = 2000, maxMs = 8000) {
        _simulationConfig.slowResponse.enabled = !!enabled;
        _simulationConfig.slowResponse.minDelayMs = minMs;
        _simulationConfig.slowResponse.maxDelayMs = maxMs;
        devState.log(
            `[DEBUG] Slow response simulation ${enabled ? 'enabled' : 'disabled'} — placeholder`,
            'warn'
        );
        console.warn('[DebugTools] Slow response simulation: ARCHITECTURE PLACEHOLDER — implementation pending.');
    },

    /**
     * Resets all simulation settings to disabled state.
     */
    resetAll() {
        Object.keys(_simulationConfig).forEach(key => {
            _simulationConfig[key].enabled = false;
        });
        devState.log('[DEBUG] All simulations reset.', 'info');
    },
});

// Expose to console for debugging
window.__WS_DEBUG__ = debugTools;
