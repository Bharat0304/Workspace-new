/* ============================================================
   PRODUCTIVITY GROWTH — Parent Component
   Presents the Study Capacity headers, weekly trend pill, legend and mounts chart.
   ============================================================ */

import { renderGrowthChart } from './GrowthChart.js';

/**
 * Renders the Study Capacity Growth card module.
 * @param {HTMLElement} container - The container element to mount into.
 * @param {import('../../contracts/DashboardContracts.js').GrowthData} data - The trajectory metrics.
 */
export function renderProductivityGrowth(container, data) {
    if (!container) return;

    if (!data) {
        container.innerHTML = '<div class="pg-loading">Loading growth trajectory…</div>';
        return;
    }

    const trendUp = data.weekTrend >= 0;
    const trendIcon = trendUp ? '↑' : '↓';
    const trendClass = trendUp ? 'pg-trend--up' : 'pg-trend--down';

    container.innerHTML = `
        <section class="pg-container" aria-label="Study Capacity Growth Tracking">
            <div class="pg-header-row">
                <div class="pg-header-left">
                    <span class="pg-subtitle">06 / PERFORMANCE DATA</span>
                    <h3 class="pg-title">Study Capacity Growth</h3>
                </div>
                <div class="pg-header-right">
                    <span class="pg-trend-pill ${trendClass}">
                        ${trendIcon} +${Math.abs(data.weekTrend)}% this week
                    </span>
                </div>
            </div>

            <!-- Custom Legend Block -->
            <div class="pg-legend">
                <div class="pg-legend-item">
                    <span class="pg-legend-color pg-color-orange"></span>
                    <span class="pg-legend-text">Study Time (hrs)</span>
                </div>
                <div class="pg-legend-item">
                    <span class="pg-legend-color pg-color-gray"></span>
                    <span class="pg-legend-text">Focus Score</span>
                </div>
                <div class="pg-legend-item">
                    <span class="pg-legend-symbol pg-symbol-line-dot"></span>
                    <span class="pg-legend-text">Productivity Index</span>
                </div>
            </div>

            <div id="pgChartMount"></div>
        </section>
    `;

    const chartMount = container.querySelector('#pgChartMount');
    if (chartMount) {
        renderGrowthChart(chartMount, data.history);
    }
}
