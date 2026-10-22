/* ============================================================
   DEVELOPMENT MODULE — Developer Panel Component
   Floating collapsible UI for developer tools.
   Only rendered when featureFlags.get('enableDeveloperPanel') === true.
   Zero production impact: this file is never imported in production builds.
   ============================================================ */

import { devState } from '../state/devState.js';
import { devService } from '../services/devService.js';
import { featureFlags, FLAG_NAMES } from '../../../app/config/featureFlags.js';
import { ENV } from '../../../app/config/env.js';
import { debugTools } from '../utils/debugTools.js';

let _panelEl = null;
let _toggleEl = null;
let _toastEl = null;
let _stateRefreshInterval = null;

const TABS = [
    { id: 'auth',       label: 'Auth' },
    { id: 'app',        label: 'App' },
    { id: 'navigation', label: 'Nav' },
    { id: 'state',      label: 'State' },
    { id: 'flags',      label: 'Flags' },
    { id: 'simulation', label: 'Sim' },
];

const LOGO_SVG = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M9 21h6M12 3a6 6 0 0 0-4 10.5V17h8v-3.5A6 6 0 0 0 12 3z"/>
    <line x1="10" y1="17" x2="10" y2="21"/><line x1="14" y1="17" x2="14" y2="21"/>
</svg>`;

// ── Public API ────────────────────────────────────────────────

/**
 * Initializes the developer panel.
 * Injects styles + DOM, wires event listeners.
 * Safe to call multiple times (idempotent).
 */
export function initDevPanel() {
    if (!featureFlags.get(FLAG_NAMES.DEVELOPER_PANEL)) {
        console.info('[DevPanel] Disabled via feature flag.');
        return;
    }
    if (_toggleEl) return; // already initialized

    _injectStyles();
    _buildToggleButton();
    _buildPanel();
    _buildToast();

    // Restore panel open state
    if (devState.isOpen()) {
        _showPanel();
    }

    // Auto-refresh state inspector every 2s when panel is open
    _stateRefreshInterval = setInterval(() => {
        if (devState.isOpen()) {
            const activeTab = devState.getActiveTab();
            if (activeTab === 'state') {
                _renderTabContent('state');
            }
        }
    }, 2000);

    devState.log('Developer Panel initialized', 'info');
}

// ── DOM Construction ──────────────────────────────────────────

function _injectStyles() {
    if (document.getElementById('ws-dev-panel-styles')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.id = 'ws-dev-panel-styles';
    link.href = 'modules/development/styles/devPanel.css';
    document.head.appendChild(link);
}

function _buildToggleButton() {
    _toggleEl = document.createElement('button');
    _toggleEl.id = 'wsDevToggle';
    _toggleEl.setAttribute('aria-label', 'Toggle Developer Panel');
    _toggleEl.setAttribute('title', 'WorkSpace Dev Panel');
    _toggleEl.innerHTML = `<span style="font-size:13px;font-weight:900;letter-spacing:-0.02em;color:#D97706;">⚙</span>`;

    _toggleEl.addEventListener('click', () => {
        const isOpen = devState.isOpen();
        if (isOpen) {
            _hidePanel();
        } else {
            _showPanel();
        }
    });

    document.body.appendChild(_toggleEl);
}

function _buildPanel() {
    _panelEl = document.createElement('div');
    _panelEl.id = 'wsDevPanel';
    _panelEl.setAttribute('role', 'complementary');
    _panelEl.setAttribute('aria-label', 'WorkSpace Developer Panel');

    _panelEl.innerHTML = `
        <div class="dev-header">
            <div class="dev-header-brand">
                ${LOGO_SVG}
                WorkSpace DevPanel
                <span class="dev-header-badge">DEV</span>
            </div>
            <span class="dev-header-env">${ENV.label}</span>
        </div>
        <div class="dev-tabs" id="wsDevTabs"></div>
        <div class="dev-body" id="wsDevBody"></div>
        <div class="dev-footer">
            <span class="dev-footer-text">WorkSpace • Dev Infrastructure</span>
            <button class="dev-refresh-btn" id="wsDevRefreshState">↺ Refresh</button>
        </div>
    `;

    // Build tabs
    const tabsEl = _panelEl.querySelector('#wsDevTabs');
    TABS.forEach(tab => {
        const btn = document.createElement('button');
        btn.className = `dev-tab${tab.id === devState.getActiveTab() ? ' active' : ''}`;
        btn.textContent = tab.label;
        btn.dataset.tab = tab.id;
        btn.addEventListener('click', () => {
            devState.setActiveTab(tab.id);
            _panelEl.querySelectorAll('.dev-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            _renderTabContent(tab.id);
        });
        tabsEl.appendChild(btn);
    });

    // Refresh button
    _panelEl.querySelector('#wsDevRefreshState').addEventListener('click', () => {
        _renderTabContent(devState.getActiveTab());
        _toast('State refreshed', 'info');
    });

    document.body.appendChild(_panelEl);
    _renderTabContent(devState.getActiveTab());
}

function _buildToast() {
    _toastEl = document.createElement('div');
    _toastEl.className = 'dev-toast';
    _toastEl.id = 'wsDevToast';
    document.body.appendChild(_toastEl);
}

// ── Panel Visibility ──────────────────────────────────────────

function _showPanel() {
    devState.setOpen(true);
    _panelEl.classList.add('visible');
    _toggleEl.classList.add('panel-open');
    _renderTabContent(devState.getActiveTab());
}

function _hidePanel() {
    devState.setOpen(false);
    _panelEl.classList.remove('visible');
    _toggleEl.classList.remove('panel-open');
}

// ── Tab Content Renderers ─────────────────────────────────────

function _renderTabContent(tabId) {
    const body = _panelEl.querySelector('#wsDevBody');
    if (!body) return;

    switch (tabId) {
        case 'auth':       body.innerHTML = _renderAuthTab(); break;
        case 'app':        body.innerHTML = _renderAppTab(); break;
        case 'navigation': body.innerHTML = _renderNavTab(); break;
        case 'state':      body.innerHTML = _renderStateTab(); break;
        case 'flags':      body.innerHTML = _renderFlagsTab(); break;
        case 'simulation': body.innerHTML = _renderSimulationTab(); break;
    }

    _attachTabListeners(tabId, body);
}

// ── Auth Tab ──────────────────────────────────────────────────

function _renderAuthTab() {
    return `
        <div class="dev-section">
            <div class="dev-section-title">Authentication</div>
            <div class="dev-btn-row">
                <button class="dev-btn success" id="devLoginNew">
                    ✦ New User
                </button>
                <button class="dev-btn amber" id="devLoginExisting">
                    ↩ Existing User
                </button>
            </div>
            <div class="dev-btn-row-single">
                <button class="dev-btn danger" id="devLogout">
                    ⎋ Logout
                </button>
            </div>
        </div>
        <div class="dev-section">
            <div class="dev-section-title">Activity Log</div>
            ${_renderLog()}
        </div>
    `;
}

// ── App Tab ───────────────────────────────────────────────────

function _renderAppTab() {
    return `
        <div class="dev-section">
            <div class="dev-section-title">Application</div>
            <div class="dev-btn-row-single">
                <button class="dev-btn danger" id="devResetApp">
                    ⚠ Reset Application + Reload
                </button>
            </div>
            <div class="dev-btn-row">
                <button class="dev-btn" id="devClearStorage">
                    ⌫ Clear WS Storage
                </button>
                <button class="dev-btn" id="devResetMock">
                    ↺ Reset Mock Data
                </button>
            </div>
        </div>
        <div class="dev-section">
            <div class="dev-section-title">Activity Log</div>
            ${_renderLog()}
        </div>
    `;
}

// ── Navigation Tab ────────────────────────────────────────────

function _renderNavTab() {
    const routes = [
        { route: 'landing',        label: '⌂ Landing' },
        { route: 'authentication',  label: '🔑 Authentication' },
        { route: 'onboarding',     label: '⤴ Onboarding' },
        { route: 'dashboard',      label: '◈ Dashboard' },
        { route: 'analytics',      label: '◉ Analytics' },
    ];

    const btns = routes.map(r =>
        `<button class="dev-btn nav-btn" data-route="${r.route}">${r.label}</button>`
    ).join('');

    return `
        <div class="dev-section">
            <div class="dev-section-title">Routes</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                ${btns}
            </div>
        </div>
        <div class="dev-section">
            <div class="dev-section-title">Activity Log</div>
            ${_renderLog()}
        </div>
    `;
}

// ── State Inspector Tab ────────────────────────────────────────

function _renderStateTab() {
    const snap = devService.getStateSnapshot();

    const rows = (obj, indent = 0) =>
        Object.entries(obj).map(([key, val]) => {
            if (typeof val === 'object' && val !== null) {
                return `<div class="dev-state-row"><span class="dev-state-key">${key}</span><span class="dev-state-value amber">{ }</span></div>
                        ${rows(val, indent + 1)}`;
            }
            const displayVal = val === null ? 'null' : String(val);
            const cls = val === true ? 'true' : val === false ? 'false' : val === null ? 'null' : '';
            return `<div class="dev-state-row" style="padding-left:${indent * 8}px">
                <span class="dev-state-key">${key}</span>
                <span class="dev-state-value ${cls}">${displayVal}</span>
            </div>`;
        }).join('');

    return `
        <div class="dev-section">
            <div class="dev-section-title">Auth State</div>
            <div class="dev-state-block">${rows(snap.auth)}</div>
        </div>
        <div class="dev-section">
            <div class="dev-section-title">Onboarding State</div>
            <div class="dev-state-block">${rows(snap.onboarding)}</div>
        </div>
        <div class="dev-section">
            <div class="dev-section-title">Route State</div>
            <div class="dev-state-block">${rows(snap.route)}</div>
        </div>
        <div class="dev-section">
            <div class="dev-section-title">Storage Keys</div>
            <div class="dev-state-block">
                <div class="dev-state-row">
                    <span class="dev-state-key">localStorage</span>
                    <span class="dev-state-value">${snap.storage.localStorageKeys.length} ws_ keys</span>
                </div>
                <div class="dev-state-row">
                    <span class="dev-state-key">sessionStorage</span>
                    <span class="dev-state-value">${snap.storage.sessionStorageKeys.length} ws_ keys</span>
                </div>
            </div>
        </div>
        <div class="dev-section">
            <div class="dev-section-title">Active Flags</div>
            <div class="dev-state-block">${rows(snap.flags)}</div>
        </div>
    `;
}

// ── Feature Flags Tab ─────────────────────────────────────────

function _renderFlagsTab() {
    const flags = [
        { name: FLAG_NAMES.MOCK_SERVICES,  label: 'Mock Services', sub: 'Use mock auth + profile APIs' },
        { name: FLAG_NAMES.DEVELOPER_PANEL, label: 'Developer Panel', sub: 'Show this panel (takes effect on reload)' },
        { name: FLAG_NAMES.EXPERIMENTAL,   label: 'Experimental Features', sub: 'Unlock in-progress features' },
    ];

    const flagRows = flags.map((f, i) => {
        const checked = featureFlags.get(f.name);
        return `
            <div class="dev-flag-row">
                <div>
                    <span class="dev-flag-label">${f.label}</span>
                    <span class="dev-flag-sub">${f.sub}</span>
                </div>
                <label class="dev-toggle">
                    <input type="checkbox" data-flag="${f.name}" ${checked ? 'checked' : ''}/>
                    <span class="dev-toggle-track"></span>
                </label>
            </div>
        `;
    }).join('');

    return `
        <div class="dev-section">
            <div class="dev-section-title">Feature Flags</div>
            <div class="dev-state-block">
                ${flagRows}
            </div>
        </div>
        <div class="dev-section">
            <div class="dev-section-title">Actions</div>
            <div class="dev-btn-row-single">
                <button class="dev-btn" id="devResetFlags">↺ Reset All Flags to Defaults</button>
            </div>
        </div>
    `;
}

// ── Simulation Tab ────────────────────────────────────────────

function _renderSimulationTab() {
    const simulations = [
        { id: 'networkDelay', label: 'Network Delay', sub: '2000ms added to all requests' },
        { id: 'offlineMode', label: 'Offline Mode', sub: 'All requests throw NetworkError' },
        { id: 'unauthorizedResponse', label: 'Unauthorized (401)', sub: 'All requests return 401' },
        { id: 'apiFailure', label: 'API Failure (500)', sub: 'All requests return 500' },
        { id: 'corruptedData', label: 'Corrupted Data', sub: 'Response JSON is mutated' },
        { id: 'slowResponse', label: 'Slow Response', sub: '2–8s added to all requests' },
    ];

    const rows = simulations.map(s => `
        <div class="dev-flag-row">
            <div>
                <span class="dev-flag-label">
                    ${s.label}
                    <span class="dev-placeholder-badge">Placeholder</span>
                </span>
                <span class="dev-flag-sub">${s.sub}</span>
            </div>
            <label class="dev-toggle">
                <input type="checkbox" data-sim="${s.id}" />
                <span class="dev-toggle-track"></span>
            </label>
        </div>
    `).join('');

    return `
        <div class="dev-section">
            <div class="dev-section-title">Network & API Simulations</div>
            <div class="dev-state-block">
                ${rows}
            </div>
            <div style="margin-top:8px;font-size:8px;color:rgba(255,255,255,0.2);line-height:1.5;text-align:center;">
                ⚠ All simulations are architecture placeholders.<br/>
                Toggles are tracked in state but do not affect functionality yet.
            </div>
        </div>
    `;
}

// ── Log Renderer ──────────────────────────────────────────────

function _renderLog() {
    const logs = devState.getLogs().slice(0, 10);
    if (!logs.length) {
        return `<div class="dev-log"><div class="dev-log-empty">No activity yet.</div></div>`;
    }
    const entries = logs.map(e => {
        const time = new Date(e.timestamp).toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return `<div class="dev-log-entry ${e.level}">
            <span class="dev-log-time">${time}</span>
            <span class="dev-log-msg">${e.action}</span>
        </div>`;
    }).join('');
    return `<div class="dev-log">${entries}</div>`;
}

// ── Event Listeners per Tab ───────────────────────────────────

function _attachTabListeners(tabId, body) {
    switch (tabId) {
        case 'auth':
            body.querySelector('#devLoginNew')?.addEventListener('click', async () => {
                _toast('Logging in as new user…', 'info');
                await devService.loginAsNewUser();
                _hidePanel();
            });
            body.querySelector('#devLoginExisting')?.addEventListener('click', async () => {
                _toast('Logging in as existing user…', 'info');
                await devService.loginAsExistingUser();
                _hidePanel();
            });
            body.querySelector('#devLogout')?.addEventListener('click', () => {
                devService.logout();
                _toast('Logged out', 'warn');
                _renderTabContent('auth');
            });
            break;

        case 'app':
            body.querySelector('#devResetApp')?.addEventListener('click', async () => {
                _toast('Resetting application…', 'warn');
                await devService.resetApplication();
            });
            body.querySelector('#devClearStorage')?.addEventListener('click', () => {
                const report = devService.clearWorkSpaceStorage();
                _toast(`Cleared ${report.total} key(s)`, 'success');
                _renderTabContent('state');
            });
            body.querySelector('#devResetMock')?.addEventListener('click', () => {
                devService.resetMockData();
                _toast('Mock data reset', 'success');
            });
            break;

        case 'navigation':
            body.querySelectorAll('.nav-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    devService.navigateTo(btn.dataset.route);
                    _toast(`Navigating to ${btn.dataset.route}`, 'info');
                    _hidePanel();
                });
            });
            break;

        case 'flags':
            body.querySelectorAll('input[data-flag]').forEach(input => {
                input.addEventListener('change', () => {
                    devService.setFlag(input.dataset.flag, input.checked);
                    _toast(`${input.dataset.flag}: ${input.checked}`, 'info');
                });
            });
            body.querySelector('#devResetFlags')?.addEventListener('click', () => {
                featureFlags.resetAll();
                _toast('Flags reset to defaults', 'success');
                _renderTabContent('flags');
            });
            break;

        case 'simulation':
            body.querySelectorAll('input[data-sim]').forEach(input => {
                input.addEventListener('change', () => {
                    const sim = input.dataset.sim;
                    debugTools[`set${sim.charAt(0).toUpperCase() + sim.slice(1)}`]?.(input.checked);
                    _toast(`${sim}: ${input.checked} (placeholder)`, 'warn');
                });
            });
            break;
    }
}

// ── Toast Notifications ───────────────────────────────────────

let _toastTimer = null;

function _toast(message, level = 'info') {
    if (!_toastEl) return;
    _toastEl.textContent = message;
    _toastEl.className = `dev-toast show ${level}`;
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => {
        _toastEl.className = 'dev-toast';
    }, 2200);
}
