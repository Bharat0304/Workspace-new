/* ============================================================
   CONSISTENCY HEATMAP — Legend Subcomponent
   Renders the bottom legend showing color scale mappings from Less to More.
   ============================================================ */

/**
 * Returns HTML string of the legend indicator.
 * @returns {string} HTML string
 */
export function renderHeatmapLegend() {
    return `
        <div class="ch-legend">
            <span class="ch-legend-label">Less</span>
            <span class="ch-legend-cell ch-level-0" title="No Study"></span>
            <span class="ch-legend-cell ch-level-1" title="Studied"></span>
            <span class="ch-legend-cell ch-level-2" title="Good Study Session"></span>
            <span class="ch-legend-cell ch-level-3" title="Daily Target Achieved"></span>
            <span class="ch-legend-cell ch-level-4" title="Daily Target Exceeded"></span>
            <span class="ch-legend-label">More</span>
        </div>
    `;
}
