/* ============================================================
   TIMETABLE — Table Grid Component

   Every row is an independent timeline block (session OR break).
   No row owns another row. Breaks are siblings, not children.

   Session/Break cell (col.id === 'session') renders:
     - A type toggle (Session | Break)
     - Start time input
     - End time input

   Break rows receive the `.tt-row--break` class for muted styling.
   ============================================================ */

import { timetableState } from '../state/timetableState.js';

/**
 * Renders the editable table grid.
 * @param {HTMLElement} container
 * @param {Object} options
 * @param {Function} options.onSelect  - Callback when cell focus/selection changes
 * @param {Function} options.onChange  - Callback on any data change
 */
export function renderTableGrid(container, { onSelect, onChange }) {
    const state = timetableState.getState();
    const { columns, sessions, selectedCell } = state;

    container.innerHTML = `
        <div class="tt-grid-container">
            <table class="tt-grid-table" id="ttGridTable">
                <thead>
                    <tr id="ttHeaderRow"></tr>
                </thead>
                <tbody id="ttBody"></tbody>
            </table>
        </div>
    `;

    const headerRow = container.querySelector('#ttHeaderRow');
    const tableBody = container.querySelector('#ttBody');

    // ── 1. Column Headers ─────────────────────────────────────
    columns.forEach((col, colIdx) => {
        const th = document.createElement('th');
        th.dataset.colId = col.id;
        th.className = 'tt-th';
        if (col.width) th.style.width = `${col.width}px`;

        th.innerHTML = `
            <div class="tt-th-inner">
                <span class="tt-th-label">${col.label}</span>
                ${col.id !== 'session'
                    ? `<div class="tt-resize-handle" data-col-idx="${colIdx}"></div>`
                    : ''}
            </div>
        `;
        headerRow.appendChild(th);
    });

    // ── 2. Rows ───────────────────────────────────────────────
    sessions.forEach((row, rowIdx) => {
        const isBreak    = row.type === 'break';
        const isSelected = state.selectedRow === rowIdx;

        const tr = document.createElement('tr');
        tr.className = [
            'tt-row',
            isBreak    ? 'tt-row--break'    : '',
            isSelected ? 'tt-row--selected' : ''
        ].filter(Boolean).join(' ');
        tr.dataset.rowIdx = rowIdx;

        columns.forEach(col => {
            const td = document.createElement('td');
            td.dataset.colId  = col.id;
            td.dataset.rowIdx = rowIdx;

            const isCellSelected = selectedCell
                && selectedCell.rowIndex === rowIdx
                && selectedCell.colId   === col.id;
            if (isCellSelected) td.classList.add('selected');

            if (col.id === 'session') {
                // ── Session/Break timeline cell ───────────────
                td.className = 'tt-td-session';
                td.innerHTML = _renderTimelineCell(row, rowIdx);
            } else {
                // ── User editable text cell ───────────────────
                td.className = 'tt-td-text';
                const cellData = row.cells[col.id] || { value: '' };

                let cellStyle = '';
                if (cellData.bold)       cellStyle += 'font-weight:bold;';
                if (cellData.italic)     cellStyle += 'font-style:italic;';
                if (cellData.underline)  cellStyle += 'text-decoration:underline;';
                if (cellData.color)      cellStyle += `color:${cellData.color};`;
                if (cellData.background) cellStyle += `background-color:${cellData.background};`;
                if (cellData.align)      cellStyle += `text-align:${cellData.align};`;

                const editor = document.createElement('div');
                editor.className       = 'tt-cell-editor';
                editor.contentEditable = 'true';
                editor.setAttribute('style', cellStyle);
                editor.innerHTML = cellData.value || '';
                td.appendChild(editor);
            }

            tr.appendChild(td);
        });

        tableBody.appendChild(tr);
    });

    // ── 3. Event Listeners ────────────────────────────────────

    // Cell selection
    tableBody.addEventListener('click', (e) => {
        const td = e.target.closest('td');
        if (!td) return;

        // Don't interfere with interactive inputs inside the timeline cell
        if (e.target.closest('.tt-type-toggle') || e.target.tagName === 'SELECT') return;

        const rowIdx = parseInt(td.dataset.rowIdx, 10);
        const colId  = td.dataset.colId;

        if (!selectedCell || selectedCell.rowIndex !== rowIdx || selectedCell.colId !== colId) {
            timetableState.setSelectedCell(rowIdx, colId);
            if (onSelect) onSelect(rowIdx, colId);
        }
    });

    // ContentEditable blur — save text value
    tableBody.addEventListener('blur', (e) => {
        const editor = e.target.closest('.tt-cell-editor');
        if (!editor) return;

        const td     = editor.closest('td');
        const rowIdx = parseInt(td.dataset.rowIdx, 10);
        const colId  = td.dataset.colId;
        const text   = editor.innerHTML.trim();

        timetableState.updateCell(rowIdx, colId, text);
        if (onChange) onChange();
    }, true);

    // Enter key blurs cell editor
    tableBody.addEventListener('keydown', (e) => {
        const editor = e.target.closest('.tt-cell-editor');
        if (!editor) return;
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            editor.blur();
        }
    });

    // Timeline cell input changes (type selector, start/end time)
    tableBody.addEventListener('change', (e) => {
        const input = e.target;
        const td    = input.closest('td');
        if (!td || td.dataset.colId !== 'session') return;

        const rowIdx = parseInt(td.dataset.rowIdx, 10);

        if (input.classList.contains('tt-type-select')) {
            timetableState.updateCell(rowIdx, 'session', { type: input.value });
            // Re-render the row to apply break/session class immediately
            if (onSelect) onSelect(rowIdx, 'session');
        } else if (input.classList.contains('tt-start-time')) {
            timetableState.updateCell(rowIdx, 'session', { startTime: input.value.trim() });
        } else if (input.classList.contains('tt-end-time')) {
            timetableState.updateCell(rowIdx, 'session', { endTime: input.value.trim() });
        }

        if (onChange) onChange();
    });

    // ── 4. Column Resizing ────────────────────────────────────
    let startX = 0, startWidth = 0, resizingColIdx = -1;

    container.querySelectorAll('.tt-resize-handle').forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            resizingColIdx = parseInt(handle.dataset.colIdx, 10);
            const colId = columns[resizingColIdx].id;
            const th    = container.querySelector(`th[data-col-id="${colId}"]`);
            startX     = e.pageX;
            startWidth = th.offsetWidth;
            document.addEventListener('mousemove', _onMouseMove);
            document.addEventListener('mouseup',   _onMouseUp);
        });
    });

    function _onMouseMove(e) {
        if (resizingColIdx === -1) return;
        const newWidth = Math.max(80, startWidth + e.pageX - startX);
        const colId    = columns[resizingColIdx].id;
        const th       = container.querySelector(`th[data-col-id="${colId}"]`);
        if (th) th.style.width = `${newWidth}px`;
        timetableState.updateColumnWidth(colId, newWidth);
    }

    function _onMouseUp() {
        if (resizingColIdx === -1) return;
        resizingColIdx = -1;
        document.removeEventListener('mousemove', _onMouseMove);
        document.removeEventListener('mouseup',   _onMouseUp);
        if (onChange) onChange();
    }
}

// ── Internal: Timeline Cell HTML ──────────────────────────────

/**
 * Renders the inner HTML for the Session/Break timeline cell.
 * Shows a type toggle and start/end time inputs.
 */
function _renderTimelineCell(row, rowIdx) {
    const type  = row.type || 'session';
    const start = row.startTime || '';
    const end   = row.endTime   || '';

    return `
        <div class="tt-timeline-cell">
            <div class="tt-type-toggle">
                <select class="tt-type-select" aria-label="Row type" data-row-idx="${rowIdx}">
                    <option value="session" ${type === 'session' ? 'selected' : ''}>Session</option>
                    <option value="break"   ${type === 'break'   ? 'selected' : ''}>Break</option>
                </select>
            </div>
            <div class="tt-time-range-row">
                <input
                    type="text"
                    class="tt-time-field tt-start-time"
                    value="${start}"
                    placeholder="09:00"
                    autocomplete="off"
                    aria-label="Start time" />
                <span class="tt-time-separator">–</span>
                <input
                    type="text"
                    class="tt-time-field tt-end-time"
                    value="${end}"
                    placeholder="10:30"
                    autocomplete="off"
                    aria-label="End time" />
            </div>
        </div>
    `;
}
