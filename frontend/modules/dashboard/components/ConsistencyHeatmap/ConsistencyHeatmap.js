/* ============================================================
   CONSISTENCY HEATMAP — Parent Component
   Only displays the title and mounts the heatmap grid.
   No analytics, metrics, or streak stats inside this container.
   ============================================================ */

import { renderHeatmapGrid } from './HeatmapGrid.js';

/**
 * Renders the Consistency Heatmap parent wrapper.
 * @param {HTMLElement} container - The element to mount into.
 * @param {import('../../contracts/DashboardContracts.js').ConsistencyData} data - The yearly study data.
 */
export function renderConsistencyHeatmap(container, data) {
    if (!container) return;

    if (!data || !data.heatmap) {
        container.innerHTML = '<div class="ch-loading">Loading study consistency…</div>';
        return;
    }

    container.innerHTML = `
        <section class="ch-container" aria-label="Study Consistency Over Time">
            <h3 class="ch-title">Consistency Over Time</h3>
            <div class="ch-grid-mount" id="chGridMount"></div>
        </section>
    `;

    const gridMount = container.querySelector('#chGridMount');
    if (gridMount) {
        renderHeatmapGrid(gridMount, data.heatmap);
    }
}
