/* ============================================================
   TIMETABLE — Mode Selection Component
   First-time screen prompting layout selections.
   ============================================================ */

/**
 * Renders the mode selection screen.
 * @param {HTMLElement} container
 * @param {Object} options
 * @param {Function} options.onSelectTemplate - Callback when template mode is selected
 * @param {Function} options.onSelectCustom - Callback when custom mode is selected
 */
export function renderModeSelection(container, { onSelectTemplate, onSelectCustom }) {
    container.innerHTML = `
        <div class="tt-mode-select">
            <div class="tt-mode-header">
                <span class="tt-mode-tag">TIMETABLE SETUP</span>
                <h1 class="tt-mode-title">Choose your planning style</h1>
                <p class="tt-mode-sub">Every brain is structured differently. Select the layout that fits your routine.</p>
            </div>

            <div class="tt-mode-grid">
                <button type="button" class="tt-mode-card" id="ttModeTemplate">
                    <span class="tt-mode-card-emoji">🏆</span>
                    <span class="tt-mode-card-label">WorkSpace Template <span class="tt-recommend-badge">Recommended</span></span>
                    <span class="tt-mode-card-desc">Get a predefined, scientifically calibrated study-break schedule. Ready to go immediately.</span>
                </button>

                <button type="button" class="tt-mode-card" id="ttModeCustom">
                    <span class="tt-mode-card-emoji">📝</span>
                    <span class="tt-mode-card-label">Create Your Own Study Sheet</span>
                    <span class="tt-mode-card-desc">Start with a blank sheet. Build rows, columns, and layout properties from scratch.</span>
                </button>
            </div>
        </div>
    `;

    // Click listeners
    container.querySelector('#ttModeTemplate').addEventListener('click', () => {
        if (onSelectTemplate) onSelectTemplate();
    });

    container.querySelector('#ttModeCustom').addEventListener('click', () => {
        if (onSelectCustom) onSelectCustom();
    });
}
