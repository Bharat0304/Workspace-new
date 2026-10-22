/* ============================================================
   CONSISTENCY HEATMAP — Month Labels Subcomponent
   Positions short month labels across columns where months transition.
   ============================================================ */

/**
 * Computes month label SVG text elements aligned to columns.
 * @param {Array<import('../../contracts/DashboardContracts.js').HeatmapDay|null>} heatmap
 * @param {number} cell
 * @param {number} gap
 * @returns {string} SVG text element string
 */
export function renderMonthLabels(heatmap, cell, gap) {
    const labels = [];
    const seenMonths = new Set();
    const totalCols = heatmap.length / 7;

    for (let col = 0; col < totalCols; col++) {
        let monthName = null;
        for (let row = 0; row < 7; row++) {
            const day = heatmap[col * 7 + row];
            if (day) {
                monthName = day.date.slice(0, 7); // Get "YYYY-MM"
                break;
            }
        }

        if (monthName && !seenMonths.has(monthName)) {
            seenMonths.add(monthName);
            const x = col * (cell + gap);
            const date = new Date(monthName + '-01T00:00:00');
            const label = date.toLocaleString('default', { month: 'short' });
            labels.push(`<text x="${x}" y="-5" class="ch-label-month">${label}</text>`);
        }
    }

    return labels.join('');
}
