/* ============================================================
   FOCUS MONITORING — Monitoring Status Subcomponent
   Displays the dynamic camera active and face detection indicators.
   ============================================================ */

/**
 * Renders status rows containing visual indicator dots and labels.
 * @param {HTMLElement} container
 * @param {import('../../contracts/FocusMonitoringContract.js').FocusMonitoringState} state
 */
export function renderMonitoringStatus(container, state) {
    if (!container) return;

    const camActive = state.cameraStatus === 'active';
    const faceDetected = state.faceDetected;

    container.innerHTML = `
        <div class="fm-monitor-status">
            <div class="fm-status-row">
                <span class="fm-status-dot ${camActive ? 'fm-status-dot--green' : 'fm-status-dot--gray'}"></span>
                <span class="fm-status-text">Camera Active</span>
                <span class="fm-status-icon">${camActive ? '✓' : '✗'}</span>
            </div>
            <div class="fm-status-row">
                <span class="fm-status-dot ${faceDetected ? 'fm-status-dot--green' : 'fm-status-dot--gray'}"></span>
                <span class="fm-status-text">${faceDetected ? 'Face Detected' : 'Face Not Detected'}</span>
                <span class="fm-status-icon">${faceDetected ? '✓' : '✗'}</span>
            </div>
        </div>
    `;
}
