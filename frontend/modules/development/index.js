/* ============================================================
   DEVELOPMENT MODULE — Entry Point
   Exports initDevPanel(). Completely disabled in production.
   Safe to import in app.js — the env check is internal.
   ============================================================ */

import { ENV } from '../../app/config/env.js';
import { featureFlags, FLAG_NAMES } from '../../app/config/featureFlags.js';

/**
 * Initializes the Developer Panel if the environment and feature
 * flag permit it.
 *
 * Production environments: this function returns immediately without
 * any DOM mutation, style injection, or module import.
 *
 * @returns {Promise<void>}
 */
export async function initDevPanel() {
    // Hard production gate — must be first check, no exceptions
    if (ENV.isProduction) {
        return;
    }

    // Feature flag gate
    if (!featureFlags.get(FLAG_NAMES.DEVELOPER_PANEL)) {
        console.info('[DevPanel] Feature flag "enableDeveloperPanel" is off. Panel not initialized.');
        return;
    }

    // Lazy-load the panel component (not included in production bundle)
    const { initDevPanel: _init } = await import('./components/DevPanel.js');
    _init();
}
