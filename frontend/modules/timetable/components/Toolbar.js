/* ============================================================
   TIMETABLE — Toolbar Component
   Formatting options and structural table operations.
   Uses native in-app dialogs — no window.confirm/alert/prompt.
   Color picker dropdowns use mouseenter/mouseleave for reliable hover.
   ============================================================ */

import { timetableState } from '../state/timetableState.js';
import { timetableService } from '../services/timetableService.js';
import { showConfirm, showPrompt } from './ConfirmDialog.js';

/**
 * Renders the toolbar.
 * @param {HTMLElement} container
 * @param {Object} options
 * @param {Function} options.onAction - Triggered on any state change to re-render parent page
 */
export function renderToolbar(container, { onAction }) {
    const state = timetableState.getState();
    const isCustomMode = state.mode === 'custom';
    const cellSelected = !!state.selectedCell;
    const activeCell = cellSelected ? state.sessions[state.selectedCell.rowIndex]?.cells[state.selectedCell.colId] : null;

    // Active formatting states for toggled styles
    const isBold      = activeCell?.bold      || false;
    const isItalic    = activeCell?.italic    || false;
    const isUnderline = activeCell?.underline || false;
    const currentAlign = activeCell?.align || 'left';

    // Disable text-formatting buttons when the session/time column is selected
    const textFmtDisabled = !cellSelected || state.selectedCell?.colId === 'session';

    container.innerHTML = `
        <div class="tt-toolbar" role="toolbar" aria-label="Timetable Formatting">
            <!-- GROUP 1: Structural operations (Rows) -->
            <div class="tt-toolbar-group">
                <button type="button" class="tt-tb-btn" id="ttAddRow" title="Add Row Below">
                    <span class="tt-tb-icon">➕</span>
                    <span>Row</span>
                </button>
                <button type="button" class="tt-tb-btn" id="ttDeleteRow" title="Delete Selected Row" ${state.selectedRow === null ? 'disabled' : ''}>
                    <span class="tt-tb-icon">➖</span>
                </button>
                <button type="button" class="tt-tb-btn" id="ttDuplicateRow" title="Duplicate Selected Row" ${state.selectedRow === null ? 'disabled' : ''}>
                    <span class="tt-tb-icon">❐</span>
                </button>
                <button type="button" class="tt-tb-btn" id="ttMoveRowUp" title="Move Row Up" ${state.selectedRow === null || state.selectedRow === 0 ? 'disabled' : ''}>
                    <span class="tt-tb-icon">↑</span>
                </button>
                <button type="button" class="tt-tb-btn" id="ttMoveRowDown" title="Move Row Down" ${state.selectedRow === null || state.selectedRow === state.sessions.length - 1 ? 'disabled' : ''}>
                    <span class="tt-tb-icon">↓</span>
                </button>
            </div>

            <!-- GROUP 2: Structural operations (Columns) -->
            <div class="tt-toolbar-group">
                <button type="button" class="tt-tb-btn" id="ttAddCol" title="Add Custom Column" ${!isCustomMode ? 'disabled' : ''} style="${!isCustomMode ? 'display:none;' : ''}">
                    <span class="tt-tb-icon">➕</span>
                    <span>Col</span>
                </button>
                <button type="button" class="tt-tb-btn" id="ttDeleteCol" title="Delete Column"
                    ${!cellSelected || state.selectedCell?.colId === 'session' ? 'disabled' : ''}>
                    <span class="tt-tb-icon">🗑️</span>
                    <span>Col</span>
                </button>
            </div>

            <!-- GROUP 3: Text formatting -->
            <div class="tt-toolbar-group">
                <button type="button" class="tt-tb-btn ${isBold ? 'active' : ''}" id="ttBold" title="Bold" ${textFmtDisabled ? 'disabled' : ''}>
                    <b>B</b>
                </button>
                <button type="button" class="tt-tb-btn ${isItalic ? 'active' : ''}" id="ttItalic" title="Italic" ${textFmtDisabled ? 'disabled' : ''}>
                    <i>I</i>
                </button>
                <button type="button" class="tt-tb-btn ${isUnderline ? 'active' : ''}" id="ttUnderline" title="Underline" ${textFmtDisabled ? 'disabled' : ''}>
                    <u>U</u>
                </button>
            </div>

            <!-- GROUP 4: Alignment -->
            <div class="tt-toolbar-group">
                <button type="button" class="tt-tb-btn ${currentAlign === 'left'   ? 'active' : ''}" id="ttAlignLeft"   title="Align Left"   ${textFmtDisabled ? 'disabled' : ''}>⫷</button>
                <button type="button" class="tt-tb-btn ${currentAlign === 'center' ? 'active' : ''}" id="ttAlignCenter" title="Align Center" ${textFmtDisabled ? 'disabled' : ''}>⫸⫷</button>
                <button type="button" class="tt-tb-btn ${currentAlign === 'right'  ? 'active' : ''}" id="ttAlignRight"  title="Align Right"  ${textFmtDisabled ? 'disabled' : ''}>⫸</button>
            </div>

            <!-- GROUP 5: Colors -->
            <div class="tt-toolbar-group">
                <!-- Text Color -->
                <div class="tt-tb-dropdown-container" id="ttTextColorContainer">
                    <button type="button" class="tt-tb-btn dropdown-toggle" id="ttTextColorBtn" title="Text Color" ${textFmtDisabled ? 'disabled' : ''}>
                        <span style="border-bottom: 2px solid ${activeCell?.color || 'var(--white)'}">A</span>
                    </button>
                    <div class="tt-tb-dropdown-content" id="ttTextColorMenu">
                        <button type="button" class="color-swatch" style="background:#FFFFFF" data-color="var(--white)"      title="White"></button>
                        <button type="button" class="color-swatch" style="background:#D97706" data-color="var(--amber)"      title="Amber"></button>
                        <button type="button" class="color-swatch" style="background:#22C55E" data-color="var(--green)"      title="Green"></button>
                        <button type="button" class="color-swatch" style="background:#EF4444" data-color="var(--red)"        title="Red"></button>
                        <button type="button" class="color-swatch" style="background:#888888" data-color="var(--text-muted)" title="Gray"></button>
                    </div>
                </div>

                <!-- Background Color -->
                <div class="tt-tb-dropdown-container" id="ttBgColorContainer">
                    <button type="button" class="tt-tb-btn dropdown-toggle" id="ttBgColorBtn" title="Fill Color" ${textFmtDisabled ? 'disabled' : ''}>
                        <span class="fill-bucket">🪣</span>
                    </button>
                    <div class="tt-tb-dropdown-content" id="ttBgColorMenu">
                        <button type="button" class="color-swatch transparent"                                   data-color="transparent"        title="No Fill"></button>
                        <button type="button" class="color-swatch" style="background:rgba(217,119,6,0.15)"      data-color="var(--amber-dim)"   title="Amber"></button>
                        <button type="button" class="color-swatch" style="background:rgba(34,197,94,0.15)"      data-color="var(--green-dim)"   title="Green"></button>
                        <button type="button" class="color-swatch" style="background:rgba(239,68,68,0.15)"      data-color="var(--red-dim)"     title="Red"></button>
                        <button type="button" class="color-swatch" style="background:#111"                      data-color="var(--surface-mid)" title="Dark"></button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // ── Bind Event Listeners ───────────────────────────────────

    const _triggerAction = () => {
        if (onAction) onAction();
    };

    // ── Row Operations ─────────────────────────────────────────

    container.querySelector('#ttAddRow').addEventListener('click', () => {
        timetableService.insertRow(state.selectedRow !== null ? state.selectedRow + 1 : null);
        _triggerAction();
    });

    if (state.selectedRow !== null) {
        container.querySelector('#ttDeleteRow')?.addEventListener('click', () => {
            timetableService.deleteRow(state.selectedRow);
            timetableState.clearSelection();
            _triggerAction();
        });

        container.querySelector('#ttDuplicateRow')?.addEventListener('click', () => {
            timetableService.duplicateRow(state.selectedRow);
            _triggerAction();
        });

        container.querySelector('#ttMoveRowUp')?.addEventListener('click', () => {
            timetableService.moveRowUp(state.selectedRow);
            timetableState.setSelectedCell(state.selectedRow - 1, state.selectedCell?.colId || 'session');
            _triggerAction();
        });

        container.querySelector('#ttMoveRowDown')?.addEventListener('click', () => {
            timetableService.moveRowDown(state.selectedRow);
            timetableState.setSelectedCell(state.selectedRow + 1, state.selectedCell?.colId || 'session');
            _triggerAction();
        });
    }

    // ── Column Operations ──────────────────────────────────────

    if (isCustomMode) {
        container.querySelector('#ttAddCol').addEventListener('click', async () => {
            const name = await showPrompt({
                title: 'Add Column',
                message: 'Enter a header name for the new column:',
                placeholder: 'e.g. Subject, Priority…',
                confirmLabel: 'Add Column',
                cancelLabel: 'Cancel'
            });
            if (name) {
                const res = timetableService.insertColumn(name);
                if (res.error) {
                    await showConfirm({
                        title: 'Cannot Add Column',
                        message: res.error,
                        confirmLabel: 'OK',
                        cancelLabel: '',
                        variant: 'default'
                    });
                } else {
                    _triggerAction();
                }
            }
        });
    }

    if (cellSelected && state.selectedCell?.colId !== 'session') {
        container.querySelector('#ttDeleteCol').addEventListener('click', async () => {
            const confirmed = await showConfirm({
                title: 'Delete Column',
                message: `Are you sure you want to delete the column "<strong>${state.selectedCell.colId}</strong>"? All data in this column will be lost.`,
                confirmLabel: 'Delete Column',
                cancelLabel: 'Cancel',
                variant: 'danger'
            });
            if (confirmed) {
                timetableService.deleteColumn(state.selectedCell.colId);
                timetableState.clearSelection();
                _triggerAction();
            }
        });

        // ── Text Formatting ────────────────────────────────────

        container.querySelector('#ttBold').addEventListener('click', () => {
            timetableState.updateCellFormat(state.selectedCell.rowIndex, state.selectedCell.colId, { bold: !isBold });
            _triggerAction();
        });

        container.querySelector('#ttItalic').addEventListener('click', () => {
            timetableState.updateCellFormat(state.selectedCell.rowIndex, state.selectedCell.colId, { italic: !isItalic });
            _triggerAction();
        });

        container.querySelector('#ttUnderline').addEventListener('click', () => {
            timetableState.updateCellFormat(state.selectedCell.rowIndex, state.selectedCell.colId, { underline: !isUnderline });
            _triggerAction();
        });

        // ── Alignment ──────────────────────────────────────────

        container.querySelector('#ttAlignLeft').addEventListener('click', () => {
            timetableState.updateCellFormat(state.selectedCell.rowIndex, state.selectedCell.colId, { align: 'left' });
            _triggerAction();
        });
        container.querySelector('#ttAlignCenter').addEventListener('click', () => {
            timetableState.updateCellFormat(state.selectedCell.rowIndex, state.selectedCell.colId, { align: 'center' });
            _triggerAction();
        });
        container.querySelector('#ttAlignRight').addEventListener('click', () => {
            timetableState.updateCellFormat(state.selectedCell.rowIndex, state.selectedCell.colId, { align: 'right' });
            _triggerAction();
        });
    }

    // ── Color Picker — JS-driven hover (stays open on cursor move) ──

    _bindColorDropdown(container, 'ttTextColorContainer', 'ttTextColorMenu', (color) => {
        if (cellSelected && state.selectedCell?.colId !== 'session') {
            timetableState.updateCellFormat(state.selectedCell.rowIndex, state.selectedCell.colId, { color });
            _triggerAction();
        }
    });

    _bindColorDropdown(container, 'ttBgColorContainer', 'ttBgColorMenu', (color) => {
        if (cellSelected && state.selectedCell?.colId !== 'session') {
            timetableState.updateCellFormat(state.selectedCell.rowIndex, state.selectedCell.colId, { background: color });
            _triggerAction();
        }
    });
}

// ── Internal: JS-driven dropdown so hover gap doesn't close menu ──────────

function _bindColorDropdown(container, containerId, menuId, onSelect) {
    const wrapper = container.querySelector(`#${containerId}`);
    const menu    = container.querySelector(`#${menuId}`);
    if (!wrapper || !menu) return;

    let _leaveTimer = null;

    const _open  = () => { clearTimeout(_leaveTimer); menu.classList.add('open'); };
    const _close = () => { _leaveTimer = setTimeout(() => menu.classList.remove('open'), 120); };

    wrapper.addEventListener('mouseenter', _open);
    wrapper.addEventListener('mouseleave', _close);
    menu.addEventListener('mouseenter', _open);
    menu.addEventListener('mouseleave', _close);

    menu.addEventListener('click', (e) => {
        const swatch = e.target.closest('.color-swatch');
        if (swatch) {
            onSelect(swatch.dataset.color);
            menu.classList.remove('open');
        }
    });
}
