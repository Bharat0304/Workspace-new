/* ============================================================
   DASHBOARD — Consistency Tracker Section
   Full-width section: heatmap + today's study hours + streak.
   ============================================================ */

import { renderContributionHeatmap } from './ContributionHeatmap.js';

/**
 * Renders the Consistency Tracker section.
 * @param {HTMLElement} container
 * @param {import('../contracts/DashboardContracts.js').ConsistencyData} data
 */
export function renderConsistencyTracker(container, data) {
    if (!data) {
        container.innerHTML = '<div class="db-section-loading">Loading consistency data…</div>';
        return;
    }

    const trendDir = data.streakDays > 0 ? '🔥' : '';

    container.innerHTML = `
        <section class="db-section db-consistency" aria-label="Study Consistency">
            <div class="db-consistency-header">
                <div class="db-section-label">CONSISTENCY</div>
                <div class="db-consistency-meta">
                    <div class="db-meta-stat">
                        <span class="db-meta-value">${data.todayHours}h</span>
                        <span class="db-meta-label">Today</span>
                    </div>
                    <div class="db-meta-divider"></div>
                    <div class="db-meta-stat">
                        <span class="db-meta-value">${data.streakDays} ${trendDir}</span>
                        <span class="db-meta-label">Day Streak</span>
                    </div>
                    <div class="db-meta-divider"></div>
                    <div class="db-meta-stat">
                        <span class="db-meta-value">${data.dailyTarget}h</span>
                        <span class="db-meta-label">Daily Goal</span>
                    </div>
                </div>
            </div>
            <div class="db-heatmap-mount" id="dbHeatmapMount"></div>
        </section>
    `;

    renderContributionHeatmap(
        container.querySelector('#dbHeatmapMount'),
        data.heatmap
    );
}
