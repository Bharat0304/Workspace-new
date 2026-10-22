/* ============================================================
   TIMETABLE — State Store
   Manages session rows, columns, selections, edit modes, and unsaved drafts.

   ROW SCHEMA (v2): Every row is an independent timeline block.
   { id, type: 'session'|'break', startTime, endTime, cells: {} }
   ============================================================ */

const DRAFT_KEY = 'ws_timetable_draft';

const _defaults = {
    mode: null,            // 'template' | 'custom' | null
    columns: [],
    sessions: [],          // array of independent timeline rows (sessions AND breaks)
    selectedCell: null,    // { rowIndex: number, colId: string } | null
    selectedRow: null,     // number | null
    isEditing: false,
    isSaving: false,
    hasUnsavedChanges: false,
    lastSaved: null,
    validationErrors: []
};

let _state = _loadDraft();

function _loadDraft() {
    try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            // Migrate old rows that have breakDuration to new schema
            if (parsed.sessions) {
                parsed.sessions = parsed.sessions.map(row => _migrateRow(row));
            }
            return parsed;
        }
    } catch { /* noop */ }
    return { ..._defaults, columns: [], sessions: [], validationErrors: [] };
}

/**
 * Migrates a v1 row (with breakDuration) to v2 schema (with type).
 * Safe to call on already-migrated rows.
 */
function _migrateRow(row) {
    if (row.type) return row; // Already v2
    return {
        id: row.id,
        type: 'session',
        startTime: row.startTime,
        endTime: row.endTime,
        cells: row.cells || {}
        // breakDuration intentionally dropped
    };
}

function _saveDraft() {
    try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(_state));
    } catch {
        // storage not available
    }
}

export const timetableState = {
    /** Returns a deep copy of the state. */
    getState() {
        return JSON.parse(JSON.stringify(_state));
    },

    /** Resets state to default. */
    reset() {
        _state = JSON.parse(JSON.stringify(_defaults));
        _saveDraft();
    },

    /** Sets the full timetable data (loaded from service). */
    setData(mode, columns, sessions, lastSaved = null) {
        _state.mode = mode;
        _state.columns = JSON.parse(JSON.stringify(columns));
        // Ensure all rows are migrated to v2 schema
        _state.sessions = JSON.parse(JSON.stringify(sessions)).map(_migrateRow);
        _state.lastSaved = lastSaved;
        _state.hasUnsavedChanges = false;
        _saveDraft();
    },

    /**
     * Updates a single cell's value.
     * For 'session' column: updates type, startTime, endTime.
     * For other columns: updates the cell's text value.
     */
    updateCell(rowIndex, colId, value, format = {}) {
        const session = _state.sessions[rowIndex];
        if (!session) return;

        if (colId === 'session') {
            // Managed timeline column — update type/startTime/endTime
            if (value.type      !== undefined) session.type      = value.type;
            if (value.startTime !== undefined) session.startTime = value.startTime;
            if (value.endTime   !== undefined) session.endTime   = value.endTime;
        } else {
            if (!session.cells[colId]) {
                session.cells[colId] = { value: '' };
            }
            session.cells[colId].value = value;
            Object.assign(session.cells[colId], format);
        }

        _state.hasUnsavedChanges = true;
        _saveDraft();
    },

    /** Updates formatting/styling parameters of a cell. */
    updateCellFormat(rowIndex, colId, format) {
        const session = _state.sessions[rowIndex];
        if (!session || colId === 'session') return;

        if (!session.cells[colId]) {
            session.cells[colId] = { value: '' };
        }
        Object.assign(session.cells[colId], format);
        _state.hasUnsavedChanges = true;
        _saveDraft();
    },

    /** Updates column width configuration. */
    updateColumnWidth(colId, width) {
        const col = _state.columns.find(c => c.id === colId);
        if (col) {
            col.width = width;
            _saveDraft();
        }
    },

    /**
     * Adds a new row at the specified index or at the end.
     * @param {number|null} index
     * @param {Object|null} defaultData
     */
    addRow(index = null, defaultData = null) {
        const rowId = `row_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const newRow = defaultData ? JSON.parse(JSON.stringify(defaultData)) : {
            id: rowId,
            type: 'session',
            startTime: '09:00',
            endTime: '10:00',
            cells: {}
        };

        // Ensure new cells match columns list
        _state.columns.forEach(col => {
            if (col.id !== 'session' && !newRow.cells[col.id]) {
                newRow.cells[col.id] = { value: '' };
            }
        });

        if (index === null || index >= _state.sessions.length) {
            _state.sessions.push(newRow);
        } else {
            _state.sessions.splice(index, 0, newRow);
        }

        _state.hasUnsavedChanges = true;
        _saveDraft();
        return newRow;
    },

    /** Deletes the row at the given index. */
    deleteRow(rowIndex) {
        if (rowIndex >= 0 && rowIndex < _state.sessions.length) {
            _state.sessions.splice(rowIndex, 1);
            _state.hasUnsavedChanges = true;
            _saveDraft();
        }
    },

    /** Moves a row from one position to another. */
    moveRow(fromIndex, toIndex) {
        if (
            fromIndex >= 0 && fromIndex < _state.sessions.length &&
            toIndex >= 0 && toIndex < _state.sessions.length
        ) {
            const row = _state.sessions.splice(fromIndex, 1)[0];
            _state.sessions.splice(toIndex, 0, row);
            _state.hasUnsavedChanges = true;
            _saveDraft();
        }
    },

    /** Adds a custom column. */
    addColumn(label, colId = null) {
        const id = colId || `col_${Date.now()}`;
        const newCol = { id, label, width: 200 };
        _state.columns.push(newCol);

        _state.sessions.forEach(session => {
            session.cells[id] = { value: '' };
        });

        _state.hasUnsavedChanges = true;
        _saveDraft();
        return newCol;
    },

    /** Deletes a custom column. */
    deleteColumn(colId) {
        if (colId === 'session') return;
        const colIndex = _state.columns.findIndex(c => c.id === colId);
        if (colIndex !== -1) {
            _state.columns.splice(colIndex, 1);
            _state.sessions.forEach(session => {
                delete session.cells[colId];
            });
            _state.hasUnsavedChanges = true;
            _saveDraft();
        }
    },

    /** Selects a specific cell. */
    setSelectedCell(rowIndex, colId) {
        _state.selectedCell = (rowIndex !== null && colId !== null)
            ? { rowIndex, colId }
            : null;
        _state.selectedRow = rowIndex;
    },

    /** Clears active grid selections. */
    clearSelection() {
        _state.selectedCell = null;
        _state.selectedRow  = null;
    },

    /** Toggles saving state indicator. */
    setSaving(saving) {
        _state.isSaving = saving;
    },

    /** Sets the last saved timestamp and clears unsaved flag. */
    setLastSaved(timestamp) {
        _state.lastSaved = timestamp;
        _state.hasUnsavedChanges = false;
        _saveDraft();
    },

    /** Sets validation errors. */
    setErrors(errors) {
        _state.validationErrors = [...errors];
    },

    /** Clears all validation errors. */
    clearErrors() {
        _state.validationErrors = [];
    },

    /** Clears the draft from localStorage. */
    clearDraft() {
        try {
            localStorage.removeItem(DRAFT_KEY);
        } catch { /* noop */ }
    }
};
