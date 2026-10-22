/* ============================================================
   ONBOARDING — Review Card Component
   Displays a labelled key-value row in the Step 4 review.
   ============================================================ */

/**
 * Creates a review section showing a group of collected values.
 * @param {Object} options
 * @param {string} options.title - Section heading (e.g. "Personal Info")
 * @param {Array<{label: string, value: string}>} options.items
 * @param {number} options.editStep - Which step to jump to when "Edit" is clicked
 * @param {Function} options.onEdit - Called with editStep number
 * @returns {HTMLElement}
 */
export function createReviewCard({ title, items, editStep, onEdit }) {
    const card = document.createElement('div');
    card.className = 'ob-review-card';

    const rows = items
        .filter(item => item.value)
        .map(item => `
            <div class="ob-review-row">
                <span class="ob-review-key">${item.label}</span>
                <span class="ob-review-value">${item.value}</span>
            </div>
        `)
        .join('');

    card.innerHTML = `
        <div class="ob-review-header">
            <span class="ob-review-title">${title}</span>
            <button class="ob-review-edit" type="button" aria-label="Edit ${title}">
                Edit
            </button>
        </div>
        <div class="ob-review-rows">
            ${rows || '<div class="ob-review-empty">No information provided.</div>'}
        </div>
    `;

    card.querySelector('.ob-review-edit').addEventListener('click', () => {
        if (onEdit) onEdit(editStep);
    });

    return card;
}
