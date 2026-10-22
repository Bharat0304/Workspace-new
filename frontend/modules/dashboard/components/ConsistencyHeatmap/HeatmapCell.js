/* ============================================================
   CONSISTENCY HEATMAP — Cell Subcomponent
   Renders individual day cell SVG rects and handles mouse hovering.
   ============================================================ */

import { showTooltip, hideTooltip } from './HeatmapTooltip.js';

/**
 * Renders a single cell SVG rect.
 * @param {import('../../contracts/DashboardContracts.js').HeatmapDay|null} day
 * @param {number} x
 * @param {number} y
 * @param {number} size
 * @returns {string} SVG rect element string
 */
export function renderHeatmapCell(day, x, y, size) {
    const level = day ? day.completionLevel : 0;
    const hasData = !!day;

    return `
        <rect
            x="${x}" y="${y}"
            width="${size}" height="${size}"
            rx="1.5" ry="1.5"
            class="ch-cell ch-level-${level} ${!hasData ? 'ch-cell-empty' : ''}"
            data-index="${day ? day.date : ''}"
        ></rect>
    `;
}

/**
 * Binds mouse events to all cells in the grid.
 * @param {HTMLElement} svgContainer
 * @param {Array<import('../../contracts/DashboardContracts.js').HeatmapDay|null>} paddedHeatmap
 */
export function bindCellEvents(svgContainer, paddedHeatmap) {
    const cells = svgContainer.querySelectorAll('.ch-cell');
    cells.forEach(cell => {
        const dateStr = cell.getAttribute('data-index');
        if (!dateStr) return;

        const day = paddedHeatmap.find(d => d && d.date === dateStr);
        if (!day) return;

        cell.addEventListener('mouseenter', (e) => {
            showTooltip(e, day);
        });

        cell.addEventListener('mouseleave', () => {
            hideTooltip();
        });
    });
}
