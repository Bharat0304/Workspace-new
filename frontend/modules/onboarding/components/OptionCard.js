/* ============================================================
   ONBOARDING — Option Card Component
   A selectable card for choice-based questions.
   ============================================================ */

/**
 * Creates a group of selectable option cards.
 * @param {Object} options
 * @param {Array<{label: string, value: string, emoji?: string}>} options.choices
 * @param {string|null} options.selected - currently selected value
 * @param {Function} options.onSelect - called with the selected value
 * @param {string} [options.groupName] - for aria-group
 * @returns {HTMLElement} wrapper containing all cards
 */
export function createOptionCardGroup({ choices, selected, onSelect, groupName = 'options' }) {
    const wrapper = document.createElement('div');
    wrapper.className = 'ob-option-group';
    wrapper.setAttribute('role', 'group');
    wrapper.setAttribute('aria-label', groupName);

    choices.forEach(choice => {
        const card = _createCard(choice, selected === choice.value, (val) => {
            // Deselect all, select clicked
            wrapper.querySelectorAll('.ob-option-card').forEach(c => {
                c.classList.remove('selected');
                c.setAttribute('aria-pressed', 'false');
            });
            const target = wrapper.querySelector(`[data-value="${val}"]`);
            if (target) {
                target.classList.add('selected');
                target.setAttribute('aria-pressed', 'true');
            }
            if (onSelect) onSelect(val);
        });
        wrapper.appendChild(card);
    });

    return wrapper;
}

function _createCard({ label, value, emoji }, isSelected, onClick) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `ob-option-card${isSelected ? ' selected' : ''}`;
    card.setAttribute('data-value', value);
    card.setAttribute('aria-pressed', String(isSelected));
    card.setAttribute('role', 'button');

    card.innerHTML = `
        ${emoji ? `<span class="ob-option-emoji">${emoji}</span>` : ''}
        <span class="ob-option-label">${label}</span>
        <span class="ob-option-check" aria-hidden="true">
            <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </span>
    `;

    card.addEventListener('click', () => onClick(value));

    return card;
}
