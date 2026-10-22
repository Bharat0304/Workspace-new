/* ============================================================
   DASHBOARD MODULE — Page Controller (Bootstrapper)
   Auth check → service load → render loop.
   Mirrors the timetable/index.js pattern exactly.
   ============================================================ */

import { initNavbar }         from '../../shared/components/navbar.js';
import { authState }          from '../authentication/state/authState.js';
import { authService }        from '../authentication/services/authService.js';
import { dashboardState }     from './state/dashboardState.js';
import { dashboardService }   from './services/dashboardService.js';

import { renderConsistencyHeatmap } from './components/ConsistencyHeatmap/ConsistencyHeatmap.js';
import { renderProductivityGrowth } from './components/ProductivityGrowth/ProductivityGrowth.js';
import { renderFocusMonitoring, destroyFocusMonitoring } from './components/FocusMonitoring/FocusMonitoring.js';
import { renderSessionTimer, destroySessionTimer }       from './components/SessionTimer.js';
import { renderCurrentSession }     from './components/CurrentSession.js';

const mainEl = document.getElementById('dashboardMain');

// ── Init ──────────────────────────────────────────────────────

async function initPage() {
    initNavbar();
    _wireLogout();

    // Auth gating
    if (!authState.isLoggedIn()) {
        console.warn('[Dashboard] Not authenticated. Redirecting.');
        window.location.href = '../../../index.html';
        return;
    }

    // Show loading skeleton while data loads
    _renderLoading();

    // Load all dashboard data in parallel via service layer
    await dashboardService.load();

    // Render the full dashboard
    render();
}

// ── Render ─────────────────────────────────────────────────────

function render() {
    if (!mainEl) return;

    // Always clean up live components before re-rendering
    destroyFocusMonitoring();
    destroySessionTimer();

    const state = dashboardState.getState();

    if (state.isLoading) {
        _renderLoading();
        return;
    }

    if (state.error) {
        _renderError(state.error);
        return;
    }

    mainEl.innerHTML = `
        <!-- ── Extension Highlight Banner ── -->
        <section class="db-extension-banner" aria-label="Chrome Extension integration">
            <div class="db-extension-banner-left">
                <div class="db-extension-icon-wrap">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="4"/>
                        <line x1="21.17" y1="8" x2="12" y2="8"/>
                        <line x1="3.95" y1="6.06" x2="8.54" y2="14"/>
                        <line x1="10.88" y1="21.94" x2="15.46" y2="14"/>
                    </svg>
                </div>
                <div class="db-extension-banner-text">
                    <div class="db-extension-title-row">
                        <span class="db-extension-title">WorkSpace AI Tab Monitor</span>
                        <span class="db-extension-badge">Chrome Extension</span>
                    </div>
                    <p class="db-extension-desc">Track active study tabs, block digital distractions, and sync real-time focus states directly to your dashboard.</p>
                </div>
            </div>
            <a href="https://chromewebstore.google.com/detail/workspace-ai-tab-monitor/gkpkmkfcneilbmkekpgnifklkfchbaib" target="_blank" rel="noopener noreferrer" class="btn-amber db-extension-btn">
                <span>Get Extension</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px;">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
            </a>
        </section>

        <!-- ── Row 1: Consistency Heatmap + Focus Monitoring ── -->
        <div class="db-row-top">
            <div class="db-col-heatmap">
                <div id="dbConsistencyMount"></div>
            </div>
            <div class="db-col-monitor">
                <div id="dbMonitoringMount"></div>
            </div>
        </div>

        <!-- ── Row 2: Productivity Growth + Timer/Session ── -->
        <div class="db-row-bottom">
            <div class="db-col-growth">
                <div id="dbGrowthMount"></div>
            </div>
            <div class="db-col-session">
                <div id="dbTimerMount"></div>
                <div id="dbSessionMount"></div>
            </div>
        </div>
    `;

    // Mount each section
    renderConsistencyHeatmap(
        mainEl.querySelector('#dbConsistencyMount'),
        state.consistency
    );

    renderProductivityGrowth(
        mainEl.querySelector('#dbGrowthMount'),
        state.growth
    );

    renderFocusMonitoring(
        mainEl.querySelector('#dbMonitoringMount'),
        state.monitoring
    );

    renderSessionTimer(
        mainEl.querySelector('#dbTimerMount'),
        state.timer,
        null // tick callback — no full re-render needed for timer
    );

    renderCurrentSession(
        mainEl.querySelector('#dbSessionMount'),
        state.currentSession
    );
}

// ── Loading / Error States ────────────────────────────────────

function _renderLoading() {
    if (!mainEl) return;
    mainEl.innerHTML = `
        <div class="db-loading-state">
            <div class="db-loading-spinner"></div>
            <p class="db-loading-text">Loading your workspace…</p>
        </div>
    `;
}

function _renderError(message) {
    if (!mainEl) return;
    mainEl.innerHTML = `
        <div class="db-error-state">
            <p class="db-error-text">${message}</p>
            <button class="db-error-retry" id="dbRetryBtn">Retry</button>
        </div>
    `;
    mainEl.querySelector('#dbRetryBtn')?.addEventListener('click', async () => {
        _renderLoading();
        await dashboardService.load();
        render();
    });
}

// ── Logout ────────────────────────────────────────────────────

function _wireLogout() {
    const handleLogout = (e) => {
        e.preventDefault();
        destroyFocusMonitoring();
        destroySessionTimer();
        authService.logout();
        window.location.href = '../../../index.html';
    };

    document.getElementById('navLogoutBtn')
        ?.addEventListener('click', handleLogout);
    document.getElementById('mobileLogoutBtn')
        ?.addEventListener('click', handleLogout);
}

// ── Boot ─────────────────────────────────────────────────────

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}
