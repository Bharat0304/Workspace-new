/* ============================================================
   WORKSPACE — Toast Notification Component
   Reusable, non-blocking, auto-dismiss toast notifications.

   Usage:
     import { showToast } from '../../shared/components/Toast.js';
     showToast({ message: 'Saved!', type: 'success' });
     showToast({ message: 'Error saving', type: 'error', duration: 5000 });

   Types: 'success' | 'error' | 'info' | 'warn'
   ============================================================ */

const TOAST_CONTAINER_ID = 'wsToastContainer';

/**
 * Gets or creates the shared toast container in the DOM.
 * @returns {HTMLElement}
 */
function _getContainer() {
    let container = document.getElementById(TOAST_CONTAINER_ID);
    if (!container) {
        container = document.createElement('div');
        container.id = TOAST_CONTAINER_ID;
        container.setAttribute('role', 'status');
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'false');
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Icons for each toast type.
 */
const ICONS = {
    success: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="4 10 8 14 16 6"/></svg>`,
    error:   `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><line x1="6" y1="6" x2="14" y2="14"/><line x1="14" y1="6" x2="6" y2="14"/></svg>`,
    warn:    `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M10 3L18 17H2L10 3z"/><line x1="10" y1="9" x2="10" y2="13"/><circle cx="10" cy="15.5" r="0.5" fill="currentColor"/></svg>`,
    info:    `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="10" cy="10" r="7"/><line x1="10" y1="9" x2="10" y2="14"/><circle cx="10" cy="6.5" r="0.5" fill="currentColor"/></svg>`
};

/**
 * Shows a toast notification.
 * @param {Object} options
 * @param {string}   options.message            - The text to display
 * @param {'success'|'error'|'warn'|'info'} [options.type='info'] - Visual variant
 * @param {number}   [options.duration=3000]    - Auto-dismiss time in ms (0 = no auto-dismiss)
 * @param {boolean}  [options.dismissible=true] - Show a close button
 */
export function showToast({
    message,
    type = 'info',
    duration = 3000,
    dismissible = true
}) {
    const container = _getContainer();

    const toast = document.createElement('div');
    toast.className = `ws-toast ws-toast--${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <span class="ws-toast-icon">${ICONS[type] || ICONS.info}</span>
        <span class="ws-toast-message">${message}</span>
        ${dismissible ? `<button type="button" class="ws-toast-close" aria-label="Dismiss notification">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                <line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/>
            </svg>
        </button>` : ''}
    `;

    container.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.add('ws-toast--visible');
        });
    });

    function _dismiss() {
        toast.classList.remove('ws-toast--visible');
        toast.classList.add('ws-toast--leaving');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }

    // Auto-dismiss
    let timer = null;
    if (duration > 0) {
        timer = setTimeout(_dismiss, duration);
    }

    // Manual dismiss
    const closeBtn = toast.querySelector('.ws-toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            clearTimeout(timer);
            _dismiss();
        });
    }

    return _dismiss; // Return dismiss function for programmatic control
}
