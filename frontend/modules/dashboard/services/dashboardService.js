/* ============================================================
   DASHBOARD — Service Layer
   All dashboard data must flow through here.
   UI never calls mock directly. Replace mock imports here
   when a real backend becomes available — no UI changes needed.
   ============================================================ */

import { dashboardState } from '../state/dashboardState.js';
import {
    mockGetConsistency,
    mockGetGrowth,
    mockGetMonitoringStatus,
    mockGetCurrentSession,
    mockGetTimer
} from '../mock/dashboardMock.js';

export const dashboardService = {
    /**
     * Loads all dashboard data in parallel and populates state.
     * @returns {Promise<void>}
     */
    async load() {
        dashboardState.setLoading(true);
        dashboardState.clearError();

        try {
            const [consistency, growth, monitoring, currentSession, timer] = await Promise.all([
                mockGetConsistency(),
                mockGetGrowth(),
                mockGetMonitoringStatus(),
                mockGetCurrentSession(),
                mockGetTimer()
            ]);

            dashboardState.setConsistency(consistency);
            dashboardState.setGrowth(growth);
            dashboardState.setMonitoring(monitoring);
            dashboardState.setCurrentSession(currentSession);
            dashboardState.setTimer(timer);
        } catch (err) {
            dashboardState.setError('Failed to load dashboard data. Please refresh.');
            console.error('[Dashboard] Load error:', err);
        } finally {
            dashboardState.setLoading(false);
        }
    },

    /**
     * Refreshes consistency data only (e.g., after a session ends).
     */
    async refreshConsistency() {
        try {
            const data = await mockGetConsistency();
            dashboardState.setConsistency(data);
        } catch (err) {
            console.error('[Dashboard] Consistency refresh error:', err);
        }
    },

    /**
     * Refreshes monitoring status (called periodically by the monitoring engine).
     */
    async refreshMonitoring() {
        try {
            const data = await mockGetMonitoringStatus();
            dashboardState.setMonitoring(data);
        } catch (err) {
            console.error('[Dashboard] Monitoring refresh error:', err);
        }
    },

    /**
     * Returns current consistency data from state.
     * @returns {import('../contracts/DashboardContracts.js').ConsistencyData|null}
     */
    getConsistency() {
        return dashboardState.getState().consistency;
    },

    /**
     * Returns current growth data from state.
     * @returns {import('../contracts/DashboardContracts.js').GrowthData|null}
     */
    getGrowth() {
        return dashboardState.getState().growth;
    },

    /**
     * Returns current monitoring status from state.
     * @returns {import('../contracts/DashboardContracts.js').MonitoringStatus|null}
     */
    getMonitoringStatus() {
        return dashboardState.getState().monitoring;
    },

    /**
     * Returns current session from state.
     * @returns {import('../contracts/DashboardContracts.js').CurrentSession|null}
     */
    getCurrentSession() {
        return dashboardState.getState().currentSession;
    },

    /**
     * Returns timer state from state.
     * @returns {import('../contracts/DashboardContracts.js').TimerState|null}
     */
    getTimer() {
        return dashboardState.getState().timer;
    },

    /**
     * Toggles play/pause status of the active session timer countdown.
     * @param {boolean} running
     */
    setTimerRunning(running) {
        dashboardState.setTimerRunning(running);
    },

    /**
     * Decrements the timer by one second. Called by SessionTimer's interval.
     */
    tickTimer() {
        dashboardState.tickTimer();
    }
};
