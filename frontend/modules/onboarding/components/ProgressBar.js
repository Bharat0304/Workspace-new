/* ============================================================
   ONBOARDING — Progress Bar Component
   Renders a 4-step visual progress indicator.
   ============================================================ */

/**
 * Creates a progress bar element.
 * @param {number} totalSteps
 * @param {number} currentStep - 1-based
 * @param {string[]} stepLabels
 * @returns {HTMLElement}
 */
export function createProgressBar(totalSteps, currentStep, stepLabels = []) {
    const el = document.createElement('div');
    el.className = 'ob-progress';
    el.setAttribute('role', 'progressbar');
    el.setAttribute('aria-valuenow', currentStep);
    el.setAttribute('aria-valuemin', 1);
    el.setAttribute('aria-valuemax', totalSteps);

    el.innerHTML = _buildHTML(totalSteps, currentStep, stepLabels);
    return el;
}

/**
 * Updates an existing progress bar element in-place.
 * @param {HTMLElement} el
 * @param {number} currentStep
 */
export function updateProgressBar(el, currentStep) {
    const dots = el.querySelectorAll('.ob-progress-dot');
    const lines = el.querySelectorAll('.ob-progress-line');
    const labels = el.querySelectorAll('.ob-progress-label');

    dots.forEach((dot, i) => {
        dot.classList.remove('active', 'completed');
        if (i + 1 < currentStep) dot.classList.add('completed');
        else if (i + 1 === currentStep) dot.classList.add('active');
    });

    lines.forEach((line, i) => {
        line.classList.remove('filled');
        if (i + 1 < currentStep) line.classList.add('filled');
    });

    labels.forEach((label, i) => {
        label.classList.remove('active');
        if (i + 1 === currentStep) label.classList.add('active');
    });

    el.setAttribute('aria-valuenow', currentStep);
}

function _buildHTML(totalSteps, currentStep, stepLabels) {
    const items = [];
    for (let i = 1; i <= totalSteps; i++) {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;

        items.push(`
            <div class="ob-progress-step">
                <div class="ob-progress-dot ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}">
                    ${isCompleted ? `<svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>` : `<span>${i}</span>`}
                </div>
                ${stepLabels[i-1]
                    ? `<span class="ob-progress-label ${isActive ? 'active' : ''}">${stepLabels[i-1]}</span>`
                    : ''}
            </div>
        `);

        if (i < totalSteps) {
            items.push(`<div class="ob-progress-line ${isCompleted ? 'filled' : ''}"></div>`);
        }
    }
    return `<div class="ob-progress-track">${items.join('')}</div>`;
}
