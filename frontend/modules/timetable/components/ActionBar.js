/* ============================================================
   TIMETABLE — Action Bar Component
   Saves, discards, or resets the timetable workspace.

   Save flow:
     Default → Saving… (disabled) → Saved ✓ (brief) → Default
   On error: shows Error state + toast
   ============================================================ */

import { timetableState }   from '../state/timetableState.js';
import { timetableService } from '../services/timetableService.js';
import { showConfirm }      from './ConfirmDialog.js';
import { showToast }        from '../../../shared/components/Toast.js';

/**
 * Renders the bottom action bar.
 * @param {HTMLElement} container
 * @param {Object} options
 * @param {Function} options.onSave    - Called when save completes successfully
 * @param {Function} options.onDiscard - Called when changes are discarded
 * @param {Function} options.onReset   - Called when reset completes successfully
 */
export function renderActionBar(container, { onSave, onDiscard, onReset }) {
    const state = timetableState.getState();
    const { isSaving, hasUnsavedChanges, lastSaved } = state;

    let savedLabel = '';
    if (lastSaved) {
        try {
            const date = new Date(lastSaved);
            savedLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch { /* noop */ }
    }

    container.innerHTML = `
        <div class="tt-action-bar">
            <div class="tt-action-status">
                ${isSaving
                    ? `<span class="tt-status-spinner"></span>
                       <span class="tt-status-text">Saving…</span>`
                    : hasUnsavedChanges
                    ? `<span class="tt-status-badge tt-status-badge--unsaved">Unsaved changes</span>`
                    : lastSaved
                    ? `<span class="tt-status-badge tt-status-badge--saved">Saved · ${savedLabel}</span>`
                    : `<span class="tt-status-badge tt-status-badge--empty">Workspace ready</span>`
                }
            </div>

            <div class="tt-action-buttons">
                <button type="button" class="tt-btn-reset-outline" id="ttResetBtn"
                    title="Reset to initial layout">
                    Reset Layout
                </button>
                <button type="button" class="tt-btn-secondary" id="ttDiscardBtn"
                    ${!hasUnsavedChanges ? 'disabled' : ''}
                    title="Discard unsaved changes">
                    Discard
                </button>
                <button type="button" class="tt-btn-amber" id="ttSaveBtn"
                    ${!hasUnsavedChanges || isSaving ? 'disabled' : ''}
                    title="Save timetable">
                    ${isSaving ? 'Saving…' : 'Save Timetable'}
                </button>
            </div>
        </div>
    `;

    // ── Save ──────────────────────────────────────────────────

    const saveBtn = container.querySelector('#ttSaveBtn');

    saveBtn.addEventListener('click', async () => {
        // Enter saving state immediately
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving…';

        const result = await timetableService.saveTimetable();

        if (result.success) {
            // Brief "Saved ✓" state
            saveBtn.textContent = 'Saved ✓';
            saveBtn.classList.add('tt-btn-amber--saved');

            showToast({
                message: 'Timetable saved successfully',
                type: 'success',
                duration: 3000
            });

            setTimeout(() => {
                if (onSave) onSave();
            }, 800); // Small delay so user sees the "Saved ✓" state

        } else {
            showToast({
                message: result.error || 'Unable to save timetable. Please try again.',
                type: 'error',
                duration: 5000
            });

            // Re-render to restore normal state
            if (onSave) onSave();
        }
    });

    // ── Discard ───────────────────────────────────────────────

    container.querySelector('#ttDiscardBtn').addEventListener('click', async () => {
        const confirmed = await showConfirm({
            title: 'Discard Changes',
            message: 'Are you sure you want to discard your unsaved changes? This cannot be undone.',
            confirmLabel: 'Discard',
            cancelLabel: 'Keep Editing',
            variant: 'danger'
        });
        if (confirmed) {
            timetableState.clearDraft();
            timetableState.reset();
            if (onDiscard) onDiscard();
        }
    });

    // ── Reset Layout ──────────────────────────────────────────

    container.querySelector('#ttResetBtn').addEventListener('click', async () => {
        const isTemplate = state.mode === 'template';
        const confirmed = await showConfirm({
            title: 'Reset Layout',
            message: isTemplate
                ? 'This will restore the default template and discard all current changes. Are you sure?'
                : 'This will clear all data and start a blank sheet. All current data will be lost.',
            confirmLabel: 'Reset',
            cancelLabel: 'Cancel',
            variant: 'danger'
        });
        if (confirmed) {
            if (isTemplate) {
                await timetableService.resetToTemplate();
            } else {
                await timetableService.createBlankSheet();
            }
            if (onReset) onReset();
        }
    });
}
