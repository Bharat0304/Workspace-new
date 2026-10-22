/* ============================================================
   CONSISTENCY HEATMAP — Tooltip Subcomponent
   Manages a single global absolute floating tooltip.
   ============================================================ */

let _tooltipEl = null;

/**
 * Initializes the global tooltip DOM element if not present.
 */
export function initTooltip() {
    if (_tooltipEl) return;
    _tooltipEl = document.createElement('div');
    _tooltipEl.className = 'ch-tooltip';
    document.body.appendChild(_tooltipEl);
}

/**
 * Computes, formats, and displays the tooltip based on mouse event coordinates.
 * @param {MouseEvent} e - The cell hover event.
 * @param {import('../../contracts/DashboardContracts.js').HeatmapDay} day - Hovered day data.
 */
export function showTooltip(e, day) {
    if (!_tooltipEl) initTooltip();
    if (!day) return;

    let content = '';
    const formattedDate = _formatDate(day.date);

    if (day.completionLevel === 0) {
        content = `
            <div class="ch-tooltip-date">${formattedDate}</div>
            <div class="ch-tooltip-status font-dim">No Study Session</div>
        `;
    } else {
        let badge = '';
        if (day.completionLevel === 4) badge = 'Daily Target Exceeded 🚀';
        else if (day.completionLevel === 3) badge = 'Daily Target Achieved ✅';
        else if (day.completionLevel === 2) badge = 'Good Study Session';
        else badge = 'Partial Progress';

        content = `
            <div class="ch-tooltip-date">${formattedDate}</div>
            <div class="ch-tooltip-status">Studied</div>
            <div class="ch-tooltip-hours">${_formatStudyHours(day.studyHours)}</div>
            <div class="ch-tooltip-badge">${badge}</div>
        `;
    }

    _tooltipEl.innerHTML = content;
    _tooltipEl.classList.add('visible');

    // absolute coordinates alignment
    const rect = e.target.getBoundingClientRect();
    const tooltipRect = _tooltipEl.getBoundingClientRect();

    const x = rect.left + window.scrollX + (rect.width - tooltipRect.width) / 2;
    const y = rect.top + window.scrollY - tooltipRect.height - 8;

    _tooltipEl.style.left = `${x}px`;
    _tooltipEl.style.top = `${y}px`;
}

/**
 * Hides the active tooltip.
 */
export function hideTooltip() {
    if (_tooltipEl) {
        _tooltipEl.classList.remove('visible');
    }
}

/**
 * Destroys the tooltip and removes from document.
 */
export function destroyTooltip() {
    if (_tooltipEl) {
        _tooltipEl.remove();
        _tooltipEl = null;
    }
}

// ── Private Formatters ────────────────────────────────────────

/**
 * Formats decimal hours to H:MM format string (e.g. 4.5 -> "4h 30m").
 */
function _formatStudyHours(hours) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}

/**
 * Formats "YYYY-MM-DD" string to "Month Day, Year" format.
 */
function _formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' });
}
