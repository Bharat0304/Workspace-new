/* ============================================================
   WORKSPACE — Environment Configuration
   Controls runtime environment and enables/disables subsystems.

   HOW TO USE:
   - Change ENV.current to switch environments.
   - Never check ENV.current directly in feature code.
   - Always read through ENV.isDevelopment / ENV.isProduction.
   - Feature flags are the correct gate for all optional behavior.
   ============================================================ */

const ENVIRONMENTS = {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
    STAGING: 'staging',
};

/**
 * Detect environment from:
 * 1. window.__WS_ENV__ (injected by build tool or Electron main)
 * 2. localStorage override (allows devs to flip env without rebuilding)
 * 3. hostname heuristic
 * 4. Default: development
 */
function detectEnvironment() {
    // Hard override from build/Electron
    if (typeof window !== 'undefined' && window.__WS_ENV__) {
        return window.__WS_ENV__;
    }

    // localStorage developer override (only available in browser)
    try {
        const override = localStorage.getItem('ws_env_override');
        if (override && Object.values(ENVIRONMENTS).includes(override)) {
            return override;
        }
    } catch {
        // localStorage unavailable
    }

    // Hostname heuristic
    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1' || host === '') {
            return ENVIRONMENTS.DEVELOPMENT;
        }
        if (host.includes('staging') || host.includes('test')) {
            return ENVIRONMENTS.STAGING;
        }
        if (host.includes('workspace.app') || host.includes('workspace.io')) {
            return ENVIRONMENTS.PRODUCTION;
        }
    }

    // Default: development (safe for local file:// development)
    return ENVIRONMENTS.DEVELOPMENT;
}

const currentEnv = detectEnvironment();

export const ENV = Object.freeze({
    current: currentEnv,

    /** True when running in development mode. */
    isDevelopment: currentEnv === ENVIRONMENTS.DEVELOPMENT,

    /** True when running in staging mode. */
    isStaging: currentEnv === ENVIRONMENTS.STAGING,

    /** True when running in production mode. */
    isProduction: currentEnv === ENVIRONMENTS.PRODUCTION,

    /** Human-readable environment label. */
    label: currentEnv.toUpperCase(),

    /** All valid environment names (for tooling reference). */
    ENVIRONMENTS,

    /**
     * Allows developer override from console:
     *   ENV.setOverride('production')
     * Requires page reload to take effect.
     */
    setOverride(env) {
        if (!Object.values(ENVIRONMENTS).includes(env)) {
            console.warn(`[WorkSpace ENV] Unknown environment: "${env}". Valid options: ${Object.values(ENVIRONMENTS).join(', ')}`);
            return;
        }
        try {
            localStorage.setItem('ws_env_override', env);
            console.info(`[WorkSpace ENV] Override set to "${env}". Reload the page to apply.`);
        } catch {
            console.error('[WorkSpace ENV] Could not write to localStorage.');
        }
    },

    /** Clears any dev environment override. */
    clearOverride() {
        try {
            localStorage.removeItem('ws_env_override');
            console.info('[WorkSpace ENV] Override cleared. Reload to apply.');
        } catch { /* noop */ }
    },
});

// Expose to window for console debugging (non-production only)
if (currentEnv !== ENVIRONMENTS.PRODUCTION) {
    window.__WS_ENV_CONFIG__ = ENV;
    console.info(`[WorkSpace] Environment: ${ENV.label}`);
}
