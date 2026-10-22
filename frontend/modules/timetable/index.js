/* ============================================================
   TIMETABLE MODULE — Central Page Controller (Bootstrapper)
   Integrates auth checks, view states, validations, and subcomponents.
   ============================================================ */

import { initNavbar } from '../../shared/components/navbar.js';
import { authState } from '../authentication/state/authState.js';
import { authService } from '../authentication/services/authService.js';
import { timetableState } from './state/timetableState.js';
import { timetableService } from './services/timetableService.js';
import { showConfirm } from './components/ConfirmDialog.js';

// Import subcomponents
import { renderModeSelection } from './components/ModeSelection.js';
import { renderToolbar } from './components/Toolbar.js';
import { renderTableGrid } from './components/TableGrid.js';
import { renderActionBar } from './components/ActionBar.js';

const mainEl = document.getElementById('timetableMain');

/**
 * Initializes the Timetable page.
 */
async function initPage() {
    // 1. Initialize shared navbar
    initNavbar();
    _wireLogout();

    // 2. Auth gating (Mock auth support)
    const isLoggedIn = authState.isLoggedIn();
    if (!isLoggedIn) {
        // If not logged in, redirect to landing to authenticate
        console.warn('[Timetable] Not authenticated. Redirecting to landing.');
        window.location.href = '../../../index.html';
        return;
    }

    // 3. Load timetable data from storage/drafts
    await timetableService.loadTimetable();

    // 4. Render main views
    render();

    // 5. Setup unsaved changes tab warning
    window.addEventListener('beforeunload', (e) => {
        const state = timetableState.getState();
        if (state.hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = 'You have unsaved timetable changes. Are you sure you want to leave?';
            return e.returnValue;
        }
    });

    // 6. Click outside table clears selections
    document.addEventListener('click', (e) => {
        const isTable = e.target.closest('#ttGridTable');
        const isToolbar = e.target.closest('.tt-toolbar');
        const isDialog = e.target.closest('.tt-btn-reset-outline') || e.target.closest('.color-swatch') || e.target.closest('.dropdown-toggle');
        
        if (!isTable && !isToolbar && !isDialog) {
            const state = timetableState.getState();
            if (state.selectedCell) {
                timetableState.clearSelection();
                render();
            }
        }
    });
}

/**
 * Main render function determining view mode.
 */
function render() {
    if (!mainEl) return;
    const state = timetableState.getState();

    // If no layout mode chosen yet, display Selection Overlay
    if (state.mode === null) {
        mainEl.innerHTML = '<div id="ttModeSelectMount"></div>';
        const mount = mainEl.querySelector('#ttModeSelectMount');
        renderModeSelection(mount, {
            onSelectTemplate: async () => {
                await timetableService.resetToTemplate();
                render();
            },
            onSelectCustom: async () => {
                await timetableService.createBlankSheet();
                render();
            }
        });
        return;
    }

    // Render Full Workspace Grid Layout
    mainEl.innerHTML = `
        <!-- Title & Subtitle Header -->
        <header class="tt-header">
            <h1 class="tt-title">Your Study Sheet</h1>
            <p class="tt-subtitle">
                ${state.mode === 'template' 
                    ? 'WorkSpace Calibrated Schedule Template. Edit cells directly.' 
                    : 'Custom empty study sheet. Build your layout using columns and rows.'}
            </p>
        </header>

        <!-- Validation Summary (Visible on errors) -->
        <div id="ttValidationMount"></div>

        <!-- Format/Structure Toolbar -->
        <div id="ttToolbarMount"></div>

        <!-- Sheet Grid -->
        <div id="ttGridMount"></div>

        <!-- Bottom Action Bar -->
        <div id="ttActionBarMount"></div>
    `;

    // Mount Validation errors
    const valMount = mainEl.querySelector('#ttValidationMount');
    if (state.validationErrors.length > 0) {
        valMount.innerHTML = `
            <div class="tt-validation-summary">
                <div class="tt-validation-title">
                    <span>⚠️</span>
                    <span>Validation errors found:</span>
                </div>
                <ul class="tt-validation-list">
                    ${state.validationErrors.map(err => `<li>${err}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // Mount subcomponents
    renderToolbar(mainEl.querySelector('#ttToolbarMount'), { onAction: render });
    renderTableGrid(mainEl.querySelector('#ttGridMount'), {
        onSelect: () => {
            // Full re-render so row type changes (session↔break) update row styling immediately
            render();
        },
        onChange: () => {
            // Re-render action bar to show "Unsaved changes"
            renderActionBar(mainEl.querySelector('#ttActionBarMount'), {
                onSave: render,
                onDiscard: render,
                onReset: render
            });
        }
    });
    renderActionBar(mainEl.querySelector('#ttActionBarMount'), {
        onSave: render,
        onDiscard: render,
        onReset: render
    });
}

/**
 * Wires the navbar/mobile log out buttons.
 */
function _wireLogout() {
    const handleLogout = async (e) => {
        e.preventDefault();
        const state = timetableState.getState();
        if (state.hasUnsavedChanges) {
            const confirmed = await showConfirm({
                title: 'Unsaved Changes',
                message: 'You have unsaved changes. Logging out will discard them. Are you sure?',
                confirmLabel: 'Log Out',
                cancelLabel: 'Stay',
                variant: 'warn'
            });
            if (!confirmed) return;
        }
        authService.logout();
        timetableState.clearDraft();
        window.location.href = '../../../index.html';
    };

    const logoutBtn = document.getElementById('navLogoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);
}

// Boot page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}
