/* ============================================================
   DASHBOARD — Current Session Component
   Displays the active study session: subject, topic, goal, time.
   ============================================================ */

/**
 * Renders the Current Session panel.
 * @param {HTMLElement} container
 * @param {import('../contracts/DashboardContracts.js').CurrentSession} session
 */
export function renderCurrentSession(container, session) {
    if (!session) {
        container.innerHTML = `
            <section class="db-section db-session" aria-label="Current Session">
                <div class="db-section-label">NOW STUDYING</div>
                <div class="db-session-empty">No active session</div>
            </section>
        `;
        return;
    }

    container.innerHTML = `
        <section class="db-section db-session" aria-label="Current Session">
            <div class="db-section-label">NOW STUDYING</div>

            <div class="db-session-subject">${session.subject}</div>
            <div class="db-session-topic">${session.topic}</div>

            <div class="db-session-rows">
                <div class="db-session-row">
                    <span class="db-session-row-label">GOAL</span>
                    <span class="db-session-row-value">${session.goal}</span>
                </div>
                <div class="db-session-row">
                    <span class="db-session-row-label">ENDS</span>
                    <span class="db-session-row-value db-session-end">${session.endTime}</span>
                </div>
            </div>
        </section>
    `;
}
