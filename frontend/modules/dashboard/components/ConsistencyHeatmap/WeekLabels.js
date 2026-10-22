/* ============================================================
   CONSISTENCY HEATMAP — Week Labels Subcomponent
   Displays left-aligned vertical indicators for Mon, Wed, and Fri.
   ============================================================ */

/**
 * Computes week day SVG text elements.
 * @param {number} cell
 * @param {number} gap
 * @returns {string} SVG text element string
 */
export function renderWeekLabels(cell, gap) {
    const labels = [
        { text: 'Mon', row: 0 },
        { text: 'Wed', row: 2 },
        { text: 'Fri', row: 4 }
    ];

    return labels.map(l => {
        const y = l.row * (cell + gap) + cell - 1;
        return `<text x="-8" y="${y}" class="ch-label-week">${l.text}</text>`;
    }).join('');
}
