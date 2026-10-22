/* ============================================================
   ONBOARDING — Form Card Component
   A labeled input wrapper with inline validation support.
   ============================================================ */

/**
 * Creates a form field with label, input, and error slot.
 * @param {Object} options
 * @param {string} options.id
 * @param {string} options.label
 * @param {string} [options.type='text']
 * @param {string} [options.placeholder]
 * @param {string} [options.value]
 * @param {boolean} [options.readOnly]
 * @param {string} [options.errorMessage]
 * @param {Function} [options.onChange]
 * @returns {HTMLElement}
 */
export function createFormCard({
    id,
    label,
    type = 'text',
    placeholder = '',
    value = '',
    readOnly = false,
    errorMessage = 'This field is required.',
    onChange,
} = {}) {
    const wrapper = document.createElement('div');
    wrapper.className = 'ob-form-field';

    wrapper.innerHTML = `
        <label class="ob-form-label" for="${id}">${label}</label>
        <input
            class="ob-form-input${readOnly ? ' readonly' : ''}"
            type="${type}"
            id="${id}"
            name="${id}"
            placeholder="${placeholder}"
            value="${value}"
            ${readOnly ? 'readonly tabindex="-1"' : ''}
            autocomplete="off"
        />
        <span class="ob-form-error" id="${id}-error" role="alert">${errorMessage}</span>
    `;

    const input = wrapper.querySelector('input');
    if (onChange && !readOnly) {
        input.addEventListener('input', () => {
            onChange(input.value);
            // Clear error on input
            wrapper.querySelector('.ob-form-error')?.classList.remove('visible');
            input.classList.remove('error');
        });
    }

    return wrapper;
}

/**
 * Marks a form field as invalid with an error message.
 * @param {HTMLElement} formCard
 * @param {string} [message]
 */
export function setFormCardError(formCard, message) {
    const input = formCard.querySelector('.ob-form-input');
    const error = formCard.querySelector('.ob-form-error');
    if (input) input.classList.add('error');
    if (error) {
        if (message) error.textContent = message;
        error.classList.add('visible');
    }
}

/**
 * Clears error state from a form card.
 * @param {HTMLElement} formCard
 */
export function clearFormCardError(formCard) {
    const input = formCard.querySelector('.ob-form-input');
    const error = formCard.querySelector('.ob-form-error');
    if (input) input.classList.remove('error');
    if (error) error.classList.remove('visible');
}
