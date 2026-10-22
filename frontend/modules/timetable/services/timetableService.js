/* ============================================================
   TIMETABLE — Service Layer
   Handles business logic, calls mock API, and updates state.
   ============================================================ */

import { timetableState } from '../state/timetableState.js';
import {
    mockGetTimetable,
    mockSaveTimetable,
    mockResetTimetable,
    DEFAULT_TEMPLATE_COLUMNS,
    DEFAULT_TEMPLATE_SESSIONS,
    DEFAULT_BLANK_COLUMNS,
    DEFAULT_BLANK_SESSIONS
} from '../mock/mockTimetable.js';
import { parseTimeToMinutes, validateTimeRange } from '../utils/timeHelper.js';

export const timetableService = {
    /**
     * Loads the timetable from mock backend or uses draft if present.
     */
    async loadTimetable() {
        const state = timetableState.getState();
        if (state.mode !== null) {
            return state; // Draft already loaded
        }

        const saved = await mockGetTimetable();
        if (saved) {
            timetableState.setData(saved.mode, saved.columns, saved.sessions, saved.lastSaved);
        } else {
            timetableState.reset(); // null mode → triggers ModeSelection screen
        }
        return timetableState.getState();
    },

    /**
     * Saves the current state to mock backend.
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async saveTimetable() {
        const state = timetableState.getState();

        // Run validations first
        const errors = this.validateTimetable(state);
        if (errors.length > 0) {
            timetableState.setErrors(errors);
            return { success: false, error: errors[0] };
        }

        timetableState.clearErrors();
        timetableState.setSaving(true);

        try {
            const result = await mockSaveTimetable({
                mode: state.mode,
                columns: state.columns,
                sessions: state.sessions,
                version: state.version
            });

            timetableState.setLastSaved(result.lastSaved);
            timetableState.clearDraft();
            return { success: true };
        } catch (err) {
            const msg = 'Failed to save: ' + err.message;
            timetableState.setErrors([msg]);
            return { success: false, error: msg };
        } finally {
            timetableState.setSaving(false);
        }
    },

    /**
     * Initializes the predefined template workspace.
     */
    async resetToTemplate() {
        timetableState.setData('template', DEFAULT_TEMPLATE_COLUMNS, DEFAULT_TEMPLATE_SESSIONS);
        timetableState.clearDraft();
        await this.saveTimetable();
    },

    /**
     * Initializes the blank study sheet custom layout.
     */
    async createBlankSheet() {
        timetableState.setData('custom', DEFAULT_BLANK_COLUMNS, DEFAULT_BLANK_SESSIONS);
        timetableState.clearDraft();
        await this.saveTimetable();
    },

    /**
     * Resets mock database storage and state completely.
     */
    async resetDatabase() {
        await mockResetTimetable();
        timetableState.reset();
        timetableState.clearDraft();
    },

    /**
     * Adds a row at a specific index or at the end.
     * New rows default to 'session' type and auto-calculate times from the previous row.
     */
    insertRow(index = null) {
        const state = timetableState.getState();
        let startTime = '09:00';
        let endTime   = '10:00';

        if (state.sessions.length > 0) {
            const prevRowIndex = index === null
                ? state.sessions.length - 1
                : Math.max(0, index - 1);
            const prevRow = state.sessions[prevRowIndex];
            if (prevRow) {
                const prevEnd = parseTimeToMinutes(prevRow.endTime);
                if (prevEnd !== null) {
                    startTime = this._minutesToTimeString(prevEnd);
                    endTime   = this._minutesToTimeString(prevEnd + 60);
                }
            }
        }

        timetableState.addRow(index, {
            id: `row_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            type: 'session',
            startTime,
            endTime,
            cells: {}
        });
    },

    /** Deletes the row at the given index. */
    deleteRow(rowIndex) {
        timetableState.deleteRow(rowIndex);
    },

    /** Adds a custom column. */
    insertColumn(label) {
        const cleanLabel = label.trim();
        if (!cleanLabel) return { error: 'Column header cannot be empty' };

        const id = cleanLabel.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const state = timetableState.getState();

        const exists = state.columns.some(col => col.id === id);
        if (exists) {
            return { error: `Column "${cleanLabel}" already exists` };
        }

        timetableState.addColumn(cleanLabel, id);
        return { success: true };
    },

    /** Deletes a custom column. */
    deleteColumn(colId) {
        if (colId === 'session') return { error: 'Session column cannot be removed' };
        timetableState.deleteColumn(colId);
        return { success: true };
    },

    /** Moves a row up or down. */
    moveRow(fromIndex, toIndex) { timetableState.moveRow(fromIndex, toIndex); },
    moveRowUp(index)   { if (index > 0) this.moveRow(index, index - 1); },
    moveRowDown(index) {
        const state = timetableState.getState();
        if (index < state.sessions.length - 1) this.moveRow(index, index + 1);
    },

    /**
     * Duplicates the specified row directly underneath it.
     * Adjusts start/end times to follow the source row's end time.
     */
    duplicateRow(index) {
        const state = timetableState.getState();
        const sourceRow = state.sessions[index];
        if (!sourceRow) return;

        const duplicated = JSON.parse(JSON.stringify(sourceRow));
        duplicated.id = `row_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

        // Shift times by same duration as source
        const srcStart = parseTimeToMinutes(sourceRow.startTime);
        const srcEnd   = parseTimeToMinutes(sourceRow.endTime);
        if (srcStart !== null && srcEnd !== null) {
            const duration = srcEnd - srcStart;
            duplicated.startTime = this._minutesToTimeString(srcEnd);
            duplicated.endTime   = this._minutesToTimeString(srcEnd + duration);
        }

        timetableState.addRow(index + 1, duplicated);
    },

    /**
     * Validates the timetable before saving.
     * Kept deliberately permissive — the sheet is a flexible timeline editor.
     * @param {Object} state
     * @returns {Array<string>}
     */
    validateTimetable(state) {
        const errors = [];

        // 1. Session column must be present
        const sessionCol = state.columns.find(c => c.id === 'session');
        if (!sessionCol) {
            errors.push('CRITICAL: Session/Break column is missing.');
        }

        // 2. Duplicate column IDs
        const columnIds = state.columns.map(c => c.id);
        if (columnIds.length !== new Set(columnIds).size) {
            errors.push('Column headers must have unique identifiers.');
        }

        // 3. At least one row required
        if (state.sessions.length === 0) {
            errors.push('A study sheet must contain at least one row.');
        }

        // 4. Per-row time validation
        state.sessions.forEach((row, i) => {
            const label = `Row ${i + 1}`;

            if (!row.startTime || !row.endTime) {
                errors.push(`${label}: Start and end times are required.`);
                return;
            }

            const rangeCheck = validateTimeRange(row.startTime, row.endTime);
            if (!rangeCheck.valid) {
                errors.push(`${label}: ${rangeCheck.error}.`);
            }

            // Validate type field
            if (row.type && !['session', 'break'].includes(row.type)) {
                errors.push(`${label}: Unknown row type "${row.type}".`);
            }
        });

        return errors;
    },

    // ── Internal Helpers ────────────────────────────────────────

    _minutesToTimeString(totalMinutes) {
        const normalized = ((totalMinutes % 1440) + 1440) % 1440;
        const hours   = Math.floor(normalized / 60);
        const minutes = normalized % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
};
