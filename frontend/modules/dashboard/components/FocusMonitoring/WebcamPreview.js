/* ============================================================
   FOCUS MONITORING — Webcam Preview Subcomponent
   Manages rendering the HTML5 video element, loading states,
   and permission retry CTA panels.
   ============================================================ */

let _activeVideo = null;

/**
 * Renders video feeds, loading animations, or error cards based on active status.
 * @param {HTMLElement} container
 * @param {import('../../contracts/FocusMonitoringContract.js').FocusMonitoringState} state
 * @param {Object} actions
 * @param {Function} actions.onRetry - Triggers a camera restart.
 */
export function renderWebcamPreview(container, state, { onRetry }) {
    if (!container) return;

    const status = state.cameraStatus;

    if (status === 'loading') {
        container.innerHTML = `
            <div class="fm-cam-overlay">
                <div class="fm-spinner"></div>
                <p class="fm-overlay-text">Initializing monitoring feed…</p>
            </div>
        `;
        _activeVideo = null;
        return;
    }

    if (status === 'error') {
        if (state.cameraPermission === 'denied') {
            container.innerHTML = `
                <div class="fm-cam-overlay fm-error-overlay">
                    <span class="fm-error-icon">🔒</span>
                    <p class="fm-overlay-text">${state.error}</p>
                    <button class="fm-btn-amber" id="fmRetryBtn">Enable Access</button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="fm-cam-overlay fm-error-overlay">
                    <span class="fm-error-icon">⚠️</span>
                    <p class="fm-overlay-text">${state.error || 'Connection failed'}</p>
                    <button class="fm-btn-outline" id="fmRetryBtn">Retry Connection</button>
                </div>
            `;
        }

        const btn = container.querySelector('#fmRetryBtn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (onRetry) onRetry();
            });
        }
        _activeVideo = null;
        return;
    }

    if (status === 'active') {
        // Render video element if not already present
        if (!container.querySelector('#fmVideo')) {
            container.innerHTML = `
                <video id="fmVideo" class="fm-video" autoplay playsinline muted></video>
                <div class="fm-live-badge">LIVE</div>
            `;
            _activeVideo = container.querySelector('#fmVideo');
        }
    } else {
        container.innerHTML = `
            <div class="fm-cam-overlay">
                <p class="fm-overlay-text">Camera offline</p>
            </div>
        `;
        _activeVideo = null;
    }
}

/** Releases active preview references. */
export function destroyWebcamPreview() {
    _activeVideo = null;
}
