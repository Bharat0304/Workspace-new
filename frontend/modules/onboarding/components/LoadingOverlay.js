/* ============================================================
   ONBOARDING — Loading Overlay Component
   Full-screen workspace creation loading screen.
   Shows staged checklist items appearing with animation.
   ============================================================ */

const STAGES = [
    'Creating Profile',
    'Building Baseline',
    'Preparing Focus Engine',
    'Almost Ready',
];

const LOGO_SVG = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#D97706" stroke-width="1.5">
    <path d="M9 21h6M12 3a6 6 0 0 0-4 10.5V17h8v-3.5A6 6 0 0 0 12 3z"/>
    <line x1="10" y1="17" x2="10" y2="21"/>
    <line x1="14" y1="17" x2="14" y2="21"/>
</svg>`;

let _overlayEl = null;

/**
 * Shows the loading overlay. Returns an object with a `completeStage(index)` method.
 * @returns {{ completeStage: (index: number) => void, dismiss: () => void }}
 */
export function showLoadingOverlay() {
    _ensureDOM();
    requestAnimationFrame(() => {
        _overlayEl.classList.add('active');
    });

    return {
        completeStage(index) {
            const items = _overlayEl.querySelectorAll('.ob-loading-item');
            if (items[index]) {
                items[index].classList.add('done');
            }
        },
        dismiss() {
            if (_overlayEl) {
                _overlayEl.classList.add('fade-out');
                setTimeout(() => {
                    _overlayEl?.remove();
                    _overlayEl = null;
                }, 500);
            }
        },
    };
}

function _ensureDOM() {
    if (_overlayEl) {
        _overlayEl.remove();
        _overlayEl = null;
    }

    _overlayEl = document.createElement('div');
    _overlayEl.className = 'ob-loading-overlay';
    _overlayEl.id = 'obLoadingOverlay';

    const stageItems = STAGES.map((label, i) => `
        <div class="ob-loading-item" data-stage="${i}" style="transition-delay: ${i * 0.05}s">
            <div class="ob-loading-check" aria-hidden="true">
                <svg viewBox="0 0 14 14" width="12" height="12" fill="none">
                    <path d="M2 7l4 4 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <span class="ob-loading-label">${label}</span>
        </div>
    `).join('');

    _overlayEl.innerHTML = `
        <div class="ob-loading-inner">
            <div class="ob-loading-brand">
                ${LOGO_SVG}
            </div>
            <h2 class="ob-loading-heading">Creating your WorkSpace…</h2>
            <div class="ob-loading-stages">
                ${stageItems}
            </div>
            <div class="ob-loading-pulse" aria-hidden="true">
                <div class="ob-loading-ring"></div>
                <div class="ob-loading-ring ob-loading-ring-2"></div>
            </div>
        </div>
    `;

    document.body.appendChild(_overlayEl);
}
