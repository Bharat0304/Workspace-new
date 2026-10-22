/* ============================================================
   CONSISTENCY HEATMAP — Heatmap Grid Subcomponent
   Prepares 365-day layout, pads columns, mounts subcomponents.
   ============================================================ */

import { renderMonthLabels } from './MonthLabels.js';
import { renderWeekLabels } from './WeekLabels.js';
import { renderHeatmapCell, bindCellEvents } from './HeatmapCell.js';
import { renderHeatmapLegend } from './HeatmapLegend.js';
import { initTooltip } from './HeatmapTooltip.js';

/**
 * Renders the full SVG grid and legend.
 * @param {HTMLElement} container
 * @param {import('../../contracts/DashboardContracts.js').HeatmapDay[]} heatmap
 */
export function renderHeatmapGrid(container, heatmap) {
    if (!container || !heatmap || heatmap.length === 0) return;

    // Layout configuration
    const CELL_SIZE = 10;
    const GAP = 3;
    const ROWS = 7;

    // Align grid so rows map strictly Mon-Sun (Monday first)
    const firstDateObj = new Date(heatmap[0].date + 'T00:00:00');
    const startPadCount = firstDateObj.getDay() === 0 ? 6 : firstDateObj.getDay() - 1;

    const todayDateObj = new Date(heatmap[heatmap.length - 1].date + 'T00:00:00');
    const endPadCount = 6 - (todayDateObj.getDay() === 0 ? 6 : todayDateObj.getDay() - 1);

    const startPads = Array(startPadCount).fill(null);
    const endPads = Array(endPadCount).fill(null);
    const padded = startPads.concat(heatmap).concat(endPads);

    const cols = padded.length / ROWS;

    const svgW = cols * (CELL_SIZE + GAP) - GAP;
    const svgH = ROWS * (CELL_SIZE + GAP) - GAP;

    // Render cells
    const cellRects = padded.map((day, i) => {
        const col = Math.floor(i / ROWS);
        const row = i % ROWS;
        const x = col * (CELL_SIZE + GAP);
        const y = row * (CELL_SIZE + GAP);
        return renderHeatmapCell(day, x, y, CELL_SIZE);
    }).join('');

    // Renders months and week labels
    const monthsSvg = renderMonthLabels(padded, CELL_SIZE, GAP);
    const weeksSvg = renderWeekLabels(CELL_SIZE, GAP);

    container.innerHTML = `
        <div class="ch-grid-wrapper">
            <svg
                class="ch-svg"
                viewBox="-24 -16 ${svgW + 24} ${svgH + 16}"
                width="${svgW + 24}"
                height="${svgH + 16}"
                aria-label="Yearly study consistency heatmap"
            >
                <!-- Weekday labels -->
                ${weeksSvg}
                <!-- Month labels -->
                ${monthsSvg}
                <!-- Cells -->
                <g>${cellRects}</g>
            </svg>
            ${renderHeatmapLegend()}
        </div>
    `;

    // Ensure floating tooltip DOM is initialized
    initTooltip();

    // Bind hover mouse event listeners
    bindCellEvents(container, padded);
}
