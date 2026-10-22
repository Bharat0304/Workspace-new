/* ============================================================
   AUTHENTICATION — Auth Modal Component
   Full-screen modal overlay hosting the login card.
   Handles: keyboard (Esc), backdrop click, open/close animation.
   ============================================================ */

import { renderLoginCard } from './LoginCard.js';

let _overlayEl = null;
let _cardEl = null;
let _isOpen = false;

/**
 * Opens the auth modal. Creates it if it doesn't exist yet.
 */
export function openAuthModal() {
    if (_isOpen) return;
    _ensureDOM();
    requestAnimationFrame(() => {
        _overlayEl.classList.add('active');
        _isOpen = true;
        document.body.style.overflow = 'hidden';
    });
}

/**
 * Closes and hides the auth modal.
 */
export function closeAuthModal() {
    if (!_overlayEl || !_isOpen) return;
    _overlayEl.classList.remove('active');
    _isOpen = false;
    document.body.style.overflow = '';
}

// ── Private ──────────────────────────────────────────────────

function _ensureDOM() {
    if (_overlayEl) {
        // Re-render the card (reset state on each open)
        renderLoginCard(_cardEl, { onClose: closeAuthModal });
        return;
    }

    // Create overlay
    _overlayEl = document.createElement('div');
    _overlayEl.className = 'auth-overlay';
    _overlayEl.id = 'authOverlay';
    _overlayEl.setAttribute('role', 'dialog');
    _overlayEl.setAttribute('aria-modal', 'true');
    _overlayEl.setAttribute('aria-label', 'Sign in to WorkSpace');

    // Create card container
    _cardEl = document.createElement('div');
    _cardEl.className = 'auth-card';
    _cardEl.id = 'authCard';

    _overlayEl.appendChild(_cardEl);
    document.body.appendChild(_overlayEl);

    // Render login card into card container
    renderLoginCard(_cardEl, { onClose: closeAuthModal });

    // Backdrop click closes modal
    _overlayEl.addEventListener('click', (e) => {
        if (e.target === _overlayEl) {
            closeAuthModal();
        }
    });

    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && _isOpen) {
            closeAuthModal();
        }
    });
}
