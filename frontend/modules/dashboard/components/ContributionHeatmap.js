/* ============================================================
   DASHBOARD — Contribution Heatmap Component
   Renders a GitHub-style 90-day study grid.
   4 levels: empty / light / mid / full
   ============================================================ */

/**
 * Renders the contribution heatmap into the container.
 * @param {HTMLElement} container
 * @param {import('../contracts/DashboardContracts.js').HeatmapDay[]} heatmap
 */
export function renderContributionHeatmap(container, heatmap) {
    // Layout: 13 columns (weeks) × 7 rows (days Mon–Sun)
    // We'll arrange the 90 days in a right-aligned grid

    const COLS = 13;
    const ROWS = 7;
    const CELL = 12;  // px — cell size
    const GAP  = 3;   // px — gap between cells

    const svgW = COLS * (CELL + GAP) - GAP;
    const svgH = ROWS * (CELL + GAP) - GAP;

    // Pad heatmap array to fill the grid (fill empty at beginning)
    const totalCells = COLS * ROWS;
    const padded = Array(totalCells - heatmap.length).fill(null).concat(heatmap);

    // Day labels (Mon–Sun) on the left
    const dayLabels = ['M', '', 'W', '', 'F', '', 'S'];

    // Month labels across the top — compute from dates
    const monthLabels = _computeMonthLabels(heatmap, COLS, CELL, GAP);

    const cellRects = padded.map((day, i) => {
        const col = Math.floor(i / ROWS);
        const row = i % ROWS;
        const x = col * (CELL + GAP);
        const y = row * (CELL + GAP);
        const level = day ? day.level : 'empty';
        const title = day ? `${day.date}: ${day.studyHours}h` : '';

        return `<rect
            x="${x}" y="${y}"
            width="${CELL}" height="${CELL}"
            rx="2" ry="2"
            class="hm-cell hm-cell--${level}"
            data-date="${day ? day.date : ''}"
            data-hours="${day ? day.studyHours : 0}">
            ${title ? `<title>${title}</title>` : ''}
        </rect>`;
    }).join('');

    const dayLabelsSvg = dayLabels.map((label, i) => {
        const y = i * (CELL + GAP) + CELL - 2;
        return label ? `<text x="-6" y="${y}" class="hm-label-day">${label}</text>` : '';
    }).join('');

    container.innerHTML = `
        <div class="hm-wrapper">
            <svg
                class="hm-svg"
                viewBox="-20 -18 ${svgW + 20} ${svgH + 18}"
                width="${svgW + 20}"
                height="${svgH + 18}"
                aria-label="Study consistency heatmap">
                <!-- Day labels -->
                ${dayLabelsSvg}
                <!-- Month labels -->
                ${monthLabels}
                <!-- Cells -->
                <g transform="translate(0, 0)">
                    ${cellRects}
                </g>
            </svg>
            <div class="hm-legend">
                <span class="hm-legend-label">Less</span>
                <span class="hm-legend-cell hm-cell--empty"></span>
                <span class="hm-legend-cell hm-cell--light"></span>
                <span class="hm-legend-cell hm-cell--mid"></span>
                <span class="hm-legend-cell hm-cell--full"></span>
                <span class="hm-legend-label">More</span>
            </div>
        </div>
    `;
}

/**
 * Computes month label positions for SVG text elements.
 */
function _computeMonthLabels(heatmap, cols, cell, gap) {
    const months = [];
    const seen = new Set();

    heatmap.forEach((day, i) => {
        const padOffset = (cols * 7) - heatmap.length;
        const idx = i + padOffset;
        const col = Math.floor(idx / 7);
        const month = day.date.slice(0, 7); // "YYYY-MM"

        if (!seen.has(month)) {
            seen.add(month);
            const x = col * (cell + gap);
            const label = new Date(day.date + 'T00:00:00').toLocaleString('default', { month: 'short' });
            months.push(`<text x="${x}" y="-5" class="hm-label-month">${label}</text>`);
        }
    });

    return months.join('');
}
